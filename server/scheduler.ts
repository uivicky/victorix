import { storage } from './storage.js';
import { runBusinessClientDiscovery } from './businessDiscovery.js';
import { runRemoteJobDiscovery } from './jobDiscovery.js';
import { AutomationRun } from '../src/types/index.js';

const LOCK_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes stale lock safeguard

export async function executeAutomationWorkflow(params: {
  triggerType: AutomationRun['triggerType'];
  mode?: 'full' | 'business' | 'jobs';
  forceManual?: boolean;
}): Promise<{
  skipped: boolean;
  reason?: string;
  run: AutomationRun;
}> {
  const startedAt = new Date().toISOString();
  const startMs = Date.now();
  const runId = `run-${startMs}`;
  const mode = params.mode || 'full';

  // 1. Check pause state for scheduled runs
  if (storage.state.userSettings.schedulerPaused && !params.forceManual) {
    const skippedRun: AutomationRun = {
      id: runId,
      triggerType: params.triggerType,
      status: 'skipped_locked',
      startedAt,
      finishedAt: new Date().toISOString(),
      durationMs: 0,
      businessEvaluated: 0,
      businessAdded: 0,
      jobsEvaluated: 0,
      jobsAdded: 0,
      duplicatesSkipped: 0,
      steps: ['Automation is currently paused in User Settings. Skipped scheduled run.'],
    };
    storage.state.automationRuns.unshift(skippedRun);
    storage.save();
    return { skipped: true, reason: 'Automation paused', run: skippedRun };
  }

  // 2. Enforce single active scheduler discipline for automated crons
  if (
    !params.forceManual &&
    params.triggerType !== storage.state.userSettings.activeScheduler
  ) {
    const skippedRun: AutomationRun = {
      id: runId,
      triggerType: params.triggerType,
      status: 'skipped_locked',
      startedAt,
      finishedAt: new Date().toISOString(),
      durationMs: 0,
      businessEvaluated: 0,
      businessAdded: 0,
      jobsEvaluated: 0,
      jobsAdded: 0,
      duplicatesSkipped: 0,
      steps: [
        `Blocked duplicate scheduler (${params.triggerType}) because activeScheduler is set to "${storage.state.userSettings.activeScheduler}".`,
      ],
    };
    storage.state.automationRuns.unshift(skippedRun);
    storage.save();
    return {
      skipped: true,
      reason: `Active scheduler is ${storage.state.userSettings.activeScheduler}`,
      run: skippedRun,
    };
  }

  // 3. Acquire Run Lock (prevent overlapping concurrent executions)
  const lock = storage.state.runLock;
  if (lock.locked && lock.lockedAt) {
    const lockAge = Date.now() - new Date(lock.lockedAt).getTime();
    if (lockAge < LOCK_TIMEOUT_MS) {
      const lockedRun: AutomationRun = {
        id: runId,
        triggerType: params.triggerType,
        status: 'skipped_locked',
        startedAt,
        finishedAt: new Date().toISOString(),
        durationMs: 0,
        businessEvaluated: 0,
        businessAdded: 0,
        jobsEvaluated: 0,
        jobsAdded: 0,
        duplicatesSkipped: 0,
        steps: [`Duplicate run prevented: Lock held by ${lock.owner} since ${lock.lockedAt}`],
      };
      storage.state.automationRuns.unshift(lockedRun);
      storage.save();
      return { skipped: true, reason: 'Run lock active', run: lockedRun };
    }
  }

  storage.state.runLock = {
    locked: true,
    lockedAt: startedAt,
    owner: `${params.triggerType}:${runId}`,
  };

  if (params.triggerType === 'github_actions') {
    storage.state.quotas.githubActionsRunsToday += 1;
  } else if (params.triggerType === 'cloudflare_worker') {
    storage.state.quotas.workerRequestsToday += 1;
  }
  storage.save();

  const steps: string[] = [];
  let businessEvaluated = 0;
  let businessAdded = 0;
  let jobsEvaluated = 0;
  let jobsAdded = 0;
  let duplicatesSkipped = 0;
  let hasPartialErrors = false;
  const errors: string[] = [];

  try {
    steps.push(`Acquired run lock (${runId})`);
    steps.push(`Loaded settings (Priority: ${storage.state.userSettings.businessDiscoveryPriority})`);

    // 4. Execute Business Client Discovery
    if (mode === 'full' || mode === 'business') {
      steps.push('Running Business Client Discovery (OpenStreetMap Overpass API)...');
      const bizRes = await runBusinessClientDiscovery({ forceManual: params.forceManual });
      businessEvaluated = bizRes.evaluated;
      businessAdded = bizRes.added;
      duplicatesSkipped += bizRes.duplicatesSkipped;
      if (bizRes.error && bizRes.sourceStatus === 'error') {
        hasPartialErrors = true;
        errors.push(`Business Discovery: ${bizRes.error}`);
        steps.push(`Business Discovery warning: ${bizRes.error}`);
      } else if (bizRes.sourceStatus === 'cooldown' || bizRes.sourceStatus === 'rate_limited') {
        steps.push(`Business Discovery skipped cleanly: ${bizRes.error}`);
      } else {
        steps.push(
          `Business Discovery complete: evaluated=${bizRes.evaluated}, added=${bizRes.added}, duplicates=${bizRes.duplicatesSkipped}`
        );
      }
    }

    // 5. Execute Global Remote Job Discovery (checks per-source refresh intervals & rate limits)
    if (mode === 'full' || mode === 'jobs') {
      steps.push('Running Global Remote Job Discovery across permitted public APIs/RSS & Scam Engine...');
      const jobRes = await runRemoteJobDiscovery({ forceManual: params.forceManual });
      jobsEvaluated = jobRes.evaluated;
      jobsAdded = jobRes.added;
      duplicatesSkipped += jobRes.duplicatesSkipped;

      for (const s of jobRes.sourceSummaries || []) {
        steps.push(
          `[Source: ${s.sourceName}] status=${s.status}, evaluated=${s.evaluated}, added=${s.added}, dupMerged=${s.duplicatesMerged}${
            s.error ? ` (${s.error})` : ''
          }`
        );
      }

      if (jobRes.error && (jobRes.sourceStatus === 'error' || jobRes.sourceStatus === 'partial')) {
        hasPartialErrors = true;
        errors.push(`Global Job Discovery: ${jobRes.error}`);
      } else if (jobRes.sourceStatus === 'cooldown') {
        steps.push('Global Job Discovery skipped sources currently within refresh cooldown intervals.');
      } else {
        steps.push(
          `Global Job Discovery complete: evaluated=${jobRes.evaluated}, added=${jobRes.added}, dupMerged=${jobRes.duplicatesSkipped}, expiredMarked=${jobRes.expiredUpdated}`
        );
      }
    }

    // 6. Retention & Quota Hygiene
    const cleanup = storage.applyRetentionCleanup();
    steps.push(
      `Retention hygiene complete (pruned ${cleanup.removedJobs} expired jobs, ${cleanup.removedLogs} old logs)`
    );

    const finishedAt = new Date().toISOString();
    const runRecord: AutomationRun = {
      id: runId,
      triggerType: params.triggerType,
      status: hasPartialErrors ? 'partial' : 'success',
      startedAt,
      finishedAt,
      durationMs: Date.now() - startMs,
      businessEvaluated,
      businessAdded,
      jobsEvaluated,
      jobsAdded,
      duplicatesSkipped,
      steps,
      errorMessage: errors.length > 0 ? errors.join(' | ') : undefined,
    };

    storage.state.automationRuns.unshift(runRecord);
    if (storage.state.automationRuns.length > (storage.state.userSettings.logRetentionCount || 100)) {
      storage.state.automationRuns = storage.state.automationRuns.slice(
        0,
        storage.state.userSettings.logRetentionCount || 100
      );
    }

    // Sync execution summary to Cloudflare KV if configured
    await storage.kvPut(
      'victorix:last_automation_run',
      JSON.stringify({ id: runId, status: runRecord.status, finishedAt })
    );

    return { skipped: false, run: runRecord };
  } catch (err: any) {
    const failedRun: AutomationRun = {
      id: runId,
      triggerType: params.triggerType,
      status: 'failed',
      startedAt,
      finishedAt: new Date().toISOString(),
      durationMs: Date.now() - startMs,
      businessEvaluated,
      businessAdded,
      jobsEvaluated,
      jobsAdded,
      duplicatesSkipped,
      steps: [...steps, `Fatal error: ${err.message}`],
      errorMessage: err.message,
    };
    storage.state.automationRuns.unshift(failedRun);
    return { skipped: false, run: failedRun };
  } finally {
    // 7. Always release lock
    storage.state.runLock = {
      locked: false,
      lockedAt: null,
      owner: null,
    };
    storage.save();
  }
}
