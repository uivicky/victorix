// VICTORIX 3.0 – Cloudflare Worker Cron & D1/KV Runner (Optional Alternative to GitHub Actions)
// NOTE: Enable [triggers] crons = ["*/15 * * * *"] in wrangler.toml ONLY if GitHub Actions cron is disabled.

export interface Env {
  DB?: any; // Cloudflare D1Database binding
  KV?: any; // Cloudflare KVNamespace binding
  APP_URL?: string;
  CRON_SECRET?: string;
}

export default {
  async scheduled(event: any, env: Env, ctx: any) {
    const lockKey = 'victorix:cron_lock';
    const now = Date.now();

    // 1. Acquire KV run lock (prevent overlapping runs)
    if (env.KV) {
      const existingLock = await env.KV.get(lockKey);
      if (existingLock && now - Number(existingLock) < 10 * 60 * 1000) {
        console.log('VICTORIX Cron: Skipping duplicate run while lock is active.');
        return;
      }
      await env.KV.put(lockKey, String(now), { expirationTtl: 600 });
    }

    try {
      const targetUrl = (env.APP_URL || '').replace(/\/$/, '');
      if (targetUrl && env.CRON_SECRET) {
        const res = await fetch(`${targetUrl}/api/discovery/trigger`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-cron-secret': env.CRON_SECRET,
            'x-scheduler-source': 'cloudflare_worker',
          },
          body: JSON.stringify({ triggerType: 'cloudflare_worker' }),
        });

        const payload = await res.text();
        if (env.KV) {
          await env.KV.put('victorix:last_worker_cron_summary', payload, { expirationTtl: 86400 });
        }
        console.log('VICTORIX Cron Trigger executed:', res.status);
      } else if (env.DB) {
        // Direct D1 execution marker when running standalone on Cloudflare Workers
        await env.DB.prepare(
          `INSERT INTO automation_runs (id, trigger_type, status, started_at, finished_at, steps_json)
           VALUES (?, 'cloudflare_worker', 'partial', ?, ?, ?)`
        )
          .bind(
            `run-${now}`,
            new Date(now).toISOString(),
            new Date().toISOString(),
            JSON.stringify(['Cloudflare Worker woke up without APP_URL webhook configured.'])
          )
          .run();
      }
    } finally {
      if (env.KV) {
        await env.KV.delete(lockKey);
      }
    }
  },
};
