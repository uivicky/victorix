import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  BusinessLead,
  ContactEnquiry,
  BlogPost,
  AutomationRun,
  SourceSyncState,
  RemoteJob,
  SavedJob,
  JobApplication,
  JobAlertItem,
  FollowUpTask,
  UserSettings,
  SeoAuditIssue,
  StorageStatus,
  FreeTierServiceStatus,
  PageSpeedMetricResult,
} from '../src/types/index.js';
import { BLOG_POSTS as INITIAL_BLOG_POSTS } from '../src/data/agencyData.js';
import {
  classifyCountryBucket,
  classifyExperienceLevel,
  classifyIndiaEligibility,
  classifySalaryBucket,
  classifyWorkType,
} from './jobScamEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DB_FILE = process.env.VERCEL
  ? path.join('/tmp', 'victorix_db.json')
  : path.join(ROOT_DIR, 'victorix_db.json');

export interface QuotaCounters {
  date: string;
  githubActionsRunsToday: number;
  workerRequestsToday: number;
  d1ReadsToday: number;
  d1WritesToday: number;
  kvReadsToday: number;
  kvWritesToday: number;
  pagesBuildsMonth: number;
  geminiRequestsToday: number;
  pagespeedRequestsToday: number;
  overpassRequestsToday: number;
  remotiveRequestsToday: number;
  remoteokRequestsToday: number;
  weworkremotelyRequestsToday: number;
  jobicyRequestsToday: number;
  himalayasRequestsToday: number;
  workingnomadsRequestsToday: number;
  arbeitnowRequestsToday: number;
  customAtsRequestsToday: number;
}

export interface DbState {
  leads: BusinessLead[];
  enquiries: ContactEnquiry[];
  blogs: BlogPost[];
  remoteJobs: RemoteJob[];
  savedJobs: SavedJob[];
  jobApplications: JobApplication[];
  jobAlerts: JobAlertItem[];
  automationRuns: AutomationRun[];
  sourceSyncState: SourceSyncState[];
  followUpTasks: FollowUpTask[];
  seoRecommendations: SeoAuditIssue[];
  seoReportsHistory: PageSpeedMetricResult[];
  userSettings: UserSettings;
  quotas: QuotaCounters;
  runLock: {
    locked: boolean;
    lockedAt: string | null;
    owner: string | null;
  };
  lastBackupAt: string | null;
  dedupeFingerprints: string[];
  notifiedJobFingerprints: string[];
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getDefaultSources(): SourceSyncState[] {
  const today = todayStr();
  return [
    {
      sourceId: 'osm_overpass_business',
      sourceName: 'OpenStreetMap Overpass API (India Businesses)',
      sourceType: 'business',
      integrationType: 'Open Directory API',
      integrationStatus: 'connected_active',
      sourceHealth: 'healthy',
      attributionRequirement: 'OpenStreetMap contributors attribution (ODbL)',
      configUrl: 'https://overpass-api.de/api/interpreter',
      minIntervalMinutes: 30,
      dailyLimit: 250,
      requestsToday: 0,
      lastResetDate: today,
      lastSyncedAt: null,
      nextPermittedSyncAt: null,
      lastStatus: 'ready',
      lastError: null,
      enabled: true,
      notes: 'Free public geospatial directory. Priority: Mumbai -> Maharashtra -> India.',
    },
    // -------------------------------------------------------------------------
    // CONNECTED GLOBAL PUBLIC JOB APIs & FEEDS
    // -------------------------------------------------------------------------
    {
      sourceId: 'remoteok_api',
      sourceName: 'Remote OK Official API',
      sourceType: 'job',
      integrationType: 'Public JSON API',
      integrationStatus: 'connected_active',
      sourceHealth: 'untested',
      attributionRequirement: 'Link back directly (follow, no nofollow) to Remote OK',
      configUrl: 'https://remoteok.com/api',
      minIntervalMinutes: 60,
      dailyLimit: 24,
      requestsToday: 0,
      lastResetDate: today,
      lastSyncedAt: null,
      nextPermittedSyncAt: null,
      lastStatus: 'ready',
      lastError: null,
      enabled: true,
      notes: 'Official JSON API (https://remoteok.com/api). Index 0 contains legal notice.',
    },
    {
      sourceId: 'remotive_api',
      sourceName: 'Remotive Official Remote Jobs API',
      sourceType: 'job',
      integrationType: 'Public JSON API',
      integrationStatus: 'connected_active',
      sourceHealth: 'untested',
      attributionRequirement: 'Credit Remotive as source and link back to original listing',
      configUrl: 'https://remotive.com/api/remote-jobs',
      minIntervalMinutes: 360, // Strict adherence: max 4 requests/day (every 6 hours)
      dailyLimit: 4,
      requestsToday: 0,
      lastResetDate: today,
      lastSyncedAt: null,
      nextPermittedSyncAt: null,
      lastStatus: 'ready',
      lastError: null,
      enabled: true,
      notes: 'Official API (https://remotive.com/api/remote-jobs). Strictly capped at 4 calls/day.',
    },
    {
      sourceId: 'weworkremotely_rss',
      sourceName: 'We Work Remotely Official RSS',
      sourceType: 'job',
      integrationType: 'Public RSS Feed',
      integrationStatus: 'connected_active',
      sourceHealth: 'untested',
      attributionRequirement: 'Preserve direct link back to We Work Remotely listing',
      configUrl: 'https://weworkremotely.com/remote-jobs.rss',
      minIntervalMinutes: 60,
      dailyLimit: 24,
      requestsToday: 0,
      lastResetDate: today,
      lastSyncedAt: null,
      nextPermittedSyncAt: null,
      lastStatus: 'ready',
      lastError: null,
      enabled: true,
      notes: 'Official RSS 2.0 feed (https://weworkremotely.com/remote-jobs.rss).',
    },
    {
      sourceId: 'jobicy_api',
      sourceName: 'Jobicy Public Remote Jobs API v2',
      sourceType: 'job',
      integrationType: 'Public JSON API',
      integrationStatus: 'connected_active',
      sourceHealth: 'untested',
      attributionRequirement: 'Attribute Jobicy and preserve direct listing links',
      configUrl: 'https://jobicy.com/api/v2/remote-jobs',
      minIntervalMinutes: 120,
      dailyLimit: 12,
      requestsToday: 0,
      lastResetDate: today,
      lastSyncedAt: null,
      nextPermittedSyncAt: null,
      lastStatus: 'ready',
      lastError: null,
      enabled: true,
      notes: 'Official JSON API (https://jobicy.com/api/v2/remote-jobs).',
    },
    {
      sourceId: 'himalayas_api',
      sourceName: 'Himalayas Public Remote Jobs API',
      sourceType: 'job',
      integrationType: 'Public JSON API',
      integrationStatus: 'connected_active',
      sourceHealth: 'untested',
      attributionRequirement: 'Preserve direct Himalayas listing/application link',
      configUrl: 'https://himalayas.app/jobs/api',
      minIntervalMinutes: 120,
      dailyLimit: 12,
      requestsToday: 0,
      lastResetDate: today,
      lastSyncedAt: null,
      nextPermittedSyncAt: null,
      lastStatus: 'ready',
      lastError: null,
      enabled: true,
      notes: 'Official JSON API (https://himalayas.app/jobs/api). Includes seniority, salary & expiry.',
    },
    {
      sourceId: 'workingnomads_api',
      sourceName: 'Working Nomads Exposed Jobs API',
      sourceType: 'job',
      integrationType: 'Public JSON API',
      integrationStatus: 'connected_active',
      sourceHealth: 'untested',
      attributionRequirement: 'Preserve Working Nomads original job link',
      configUrl: 'https://www.workingnomads.com/api/exposed_jobs/',
      minIntervalMinutes: 120,
      dailyLimit: 12,
      requestsToday: 0,
      lastResetDate: today,
      lastSyncedAt: null,
      nextPermittedSyncAt: null,
      lastStatus: 'ready',
      lastError: null,
      enabled: true,
      notes: 'Official JSON feed (https://www.workingnomads.com/api/exposed_jobs/).',
    },
    {
      sourceId: 'arbeitnow_api',
      sourceName: 'Arbeitnow Public Job Board API',
      sourceType: 'job',
      integrationType: 'Public JSON API',
      integrationStatus: 'connected_active',
      sourceHealth: 'untested',
      attributionRequirement: 'Credit Arbeitnow and link directly to original job URL',
      configUrl: 'https://www.arbeitnow.com/api/job-board-api',
      minIntervalMinutes: 120,
      dailyLimit: 12,
      requestsToday: 0,
      lastResetDate: today,
      lastSyncedAt: null,
      nextPermittedSyncAt: null,
      lastStatus: 'ready',
      lastError: null,
      enabled: true,
      notes: 'Official JSON API (https://www.arbeitnow.com/api/job-board-api) covering Europe & Global remote.',
    },
    // -------------------------------------------------------------------------
    // CONFIGURABLE PUBLIC EMPLOYER ATS PLATFORMS
    // -------------------------------------------------------------------------
    {
      sourceId: 'greenhouse_ats',
      sourceName: 'Greenhouse Public Job Boards',
      sourceType: 'job',
      integrationType: 'Public ATS API',
      integrationStatus: 'configurable_ready',
      sourceHealth: 'untested',
      attributionRequirement: 'Direct employer ATS link preserved',
      configUrl: 'https://boards-api.greenhouse.io/v1/boards/{board}/jobs',
      minIntervalMinutes: 180,
      dailyLimit: 20,
      requestsToday: 0,
      lastResetDate: today,
      lastSyncedAt: null,
      nextPermittedSyncAt: null,
      lastStatus: 'ready',
      lastError: null,
      enabled: false,
      notes: 'Add any company Greenhouse board slug via "+ Add ATS / RSS Source" to sync live.',
    },
    {
      sourceId: 'lever_ats',
      sourceName: 'Lever Public Postings API',
      sourceType: 'job',
      integrationType: 'Public ATS API',
      integrationStatus: 'configurable_ready',
      sourceHealth: 'untested',
      attributionRequirement: 'Direct employer ATS link preserved',
      configUrl: 'https://api.lever.co/v0/postings/{company}?mode=json',
      minIntervalMinutes: 180,
      dailyLimit: 20,
      requestsToday: 0,
      lastResetDate: today,
      lastSyncedAt: null,
      nextPermittedSyncAt: null,
      lastStatus: 'ready',
      lastError: null,
      enabled: false,
      notes: 'Add any company Lever handle via "+ Add ATS / RSS Source" to sync live.',
    },
    {
      sourceId: 'ashby_ats',
      sourceName: 'Ashby Public Job Board API',
      sourceType: 'job',
      integrationType: 'Public ATS API',
      integrationStatus: 'configurable_ready',
      sourceHealth: 'untested',
      attributionRequirement: 'Direct employer ATS link preserved',
      configUrl: 'https://api.ashbyhq.com/posting-api/job-board/{board}',
      minIntervalMinutes: 180,
      dailyLimit: 20,
      requestsToday: 0,
      lastResetDate: today,
      lastSyncedAt: null,
      nextPermittedSyncAt: null,
      lastStatus: 'ready',
      lastError: null,
      enabled: false,
      notes: 'Add any company Ashby board handle to ingest remote openings cleanly.',
    },
    {
      sourceId: 'recruitee_ats',
      sourceName: 'Recruitee Public Job Boards',
      sourceType: 'job',
      integrationType: 'Public ATS API',
      integrationStatus: 'configurable_ready',
      sourceHealth: 'untested',
      attributionRequirement: 'Direct employer ATS link preserved',
      configUrl: 'https://{company}.recruitee.com/api/offers/',
      minIntervalMinutes: 180,
      dailyLimit: 20,
      requestsToday: 0,
      lastResetDate: today,
      lastSyncedAt: null,
      nextPermittedSyncAt: null,
      lastStatus: 'ready',
      lastError: null,
      enabled: false,
      notes: 'Add any company Recruitee subdomain via "+ Add ATS / RSS Source".',
    },
    {
      sourceId: 'workable_ats',
      sourceName: 'Workable Public Job Boards',
      sourceType: 'job',
      integrationType: 'Public ATS API',
      integrationStatus: 'configurable_ready',
      sourceHealth: 'untested',
      attributionRequirement: 'Direct employer career link preserved',
      configUrl: 'https://apply.workable.com/api/v3/accounts/{company}/jobs',
      minIntervalMinutes: 180,
      dailyLimit: 20,
      requestsToday: 0,
      lastResetDate: today,
      lastSyncedAt: null,
      nextPermittedSyncAt: null,
      lastStatus: 'ready',
      lastError: null,
      enabled: false,
      notes: 'Supports configurable public Workable career board accounts or manual inspection.',
    },
    {
      sourceId: 'personio_ats',
      sourceName: 'Personio Public Career Feeds',
      sourceType: 'job',
      integrationType: 'Public ATS API',
      integrationStatus: 'configurable_ready',
      sourceHealth: 'untested',
      attributionRequirement: 'Direct employer career link preserved',
      configUrl: 'https://{company}.jobs.personio.de/xml',
      minIntervalMinutes: 180,
      dailyLimit: 20,
      requestsToday: 0,
      lastResetDate: today,
      lastSyncedAt: null,
      nextPermittedSyncAt: null,
      lastStatus: 'ready',
      lastError: null,
      enabled: false,
      notes: 'Supports configurable public Personio XML career feeds.',
    },
    // -------------------------------------------------------------------------
    // OFFICIAL SEARCH PORTALS (NO RESTRICTED SCRAPING)
    // -------------------------------------------------------------------------
    {
      sourceId: 'ncs_official_portal',
      sourceName: 'National Career Service (ncs.gov.in)',
      sourceType: 'job',
      integrationType: 'Official Search Portal',
      integrationStatus: 'search_portal_only',
      sourceHealth: 'healthy',
      attributionRequirement: 'Official Govt. of India portal link',
      configUrl: 'https://www.ncs.gov.in/',
      minIntervalMinutes: 1440,
      dailyLimit: 0,
      requestsToday: 0,
      lastResetDate: today,
      lastSyncedAt: null,
      nextPermittedSyncAt: null,
      lastStatus: 'ready',
      lastError: null,
      enabled: false,
      notes: 'Official search portal link + Job Scam Checker inspection (no automated scraping).',
    },
    {
      sourceId: 'linkedin_portal',
      sourceName: 'LinkedIn Remote Jobs Search',
      sourceType: 'job',
      integrationType: 'Official Search Portal',
      integrationStatus: 'search_portal_only',
      sourceHealth: 'healthy',
      attributionRequirement: 'Official LinkedIn search link (login-protected scraping prohibited)',
      configUrl: 'https://www.linkedin.com/jobs/search/?f_WT=2',
      minIntervalMinutes: 1440,
      dailyLimit: 0,
      requestsToday: 0,
      lastResetDate: today,
      lastSyncedAt: null,
      nextPermittedSyncAt: null,
      lastStatus: 'ready',
      lastError: null,
      enabled: false,
      notes: 'Official filtered search URL + manual Scam Checker inspection only.',
    },
    {
      sourceId: 'indeed_portal',
      sourceName: 'Indeed Remote Jobs Search',
      sourceType: 'job',
      integrationType: 'Official Search Portal',
      integrationStatus: 'search_portal_only',
      sourceHealth: 'healthy',
      attributionRequirement: 'Official Indeed search link',
      configUrl: 'https://in.indeed.com/jobs?sc=0kf%3Aattr(DSQF7)%3B',
      minIntervalMinutes: 1440,
      dailyLimit: 0,
      requestsToday: 0,
      lastResetDate: today,
      lastSyncedAt: null,
      nextPermittedSyncAt: null,
      lastStatus: 'ready',
      lastError: null,
      enabled: false,
      notes: 'Official filtered search URL + manual Scam Checker inspection only.',
    },
    {
      sourceId: 'glassdoor_portal',
      sourceName: 'Glassdoor Remote Jobs Search',
      sourceType: 'job',
      integrationType: 'Official Search Portal',
      integrationStatus: 'search_portal_only',
      sourceHealth: 'healthy',
      attributionRequirement: 'Official Glassdoor search link',
      configUrl: 'https://www.glassdoor.co.in/Job/remote-jobs-SRCH_IL.0,6_IS11535.htm',
      minIntervalMinutes: 1440,
      dailyLimit: 0,
      requestsToday: 0,
      lastResetDate: today,
      lastSyncedAt: null,
      nextPermittedSyncAt: null,
      lastStatus: 'ready',
      lastError: null,
      enabled: false,
      notes: 'Official search URL + manual Scam Checker inspection only.',
    },
    {
      sourceId: 'wellfound_portal',
      sourceName: 'Wellfound Startup Remote Jobs',
      sourceType: 'job',
      integrationType: 'Official Search Portal',
      integrationStatus: 'search_portal_only',
      sourceHealth: 'healthy',
      attributionRequirement: 'Official Wellfound search link',
      configUrl: 'https://wellfound.com/role/r/remote',
      minIntervalMinutes: 1440,
      dailyLimit: 0,
      requestsToday: 0,
      lastResetDate: today,
      lastSyncedAt: null,
      nextPermittedSyncAt: null,
      lastStatus: 'ready',
      lastError: null,
      enabled: false,
      notes: 'Official search URL + manual Scam Checker inspection only.',
    },
  ];
}

function getDefaultSettings(): UserSettings {
  return {
    activeScheduler:
      (process.env.ACTIVE_SCHEDULER as UserSettings['activeScheduler']) || 'github_actions',
    schedulerPaused: false,
    businessDiscoveryPriority: 'Priority 1: Mumbai',
    leadRetentionDays: 180,
    jobRetentionDays: 45,
    logRetentionCount: 100,
    applicantSkills: [
      'HTML',
      'CSS',
      'JavaScript',
      'React',
      'TypeScript',
      'WordPress',
      'Website Management',
      'SEO',
      'Digital Marketing',
      'Canva',
      'Content Writing',
      'Virtual Assistant',
      'Customer Support',
      'Chat Support',
      'Email Support',
      'Data Entry',
      'Online Research',
      'Software Testing',
    ],
    applicantDevice: 'Laptop + Mobile Phone',
    autoThrottleAiAtPct: 85,
    updatedAt: new Date().toISOString(),
  };
}

function getInitialDb(): DbState {
  return {
    leads: [],
    enquiries: [],
    blogs: INITIAL_BLOG_POSTS.map((b) => ({
      ...b,
      status: 'published' as const,
      seoTitle: `${b.title} | VICTORIX`,
      seoDescription: b.excerpt,
      internalLinks: [
        { label: 'Website Development Services', url: '/services/website-development' },
        { label: 'Little World School Case Study', url: '/portfolio/little-world-school' },
      ],
      updatedAt: new Date().toISOString(),
    })),
    remoteJobs: [],
    savedJobs: [],
    jobApplications: [],
    jobAlerts: [],
    automationRuns: [],
    sourceSyncState: getDefaultSources(),
    followUpTasks: [],
    seoRecommendations: [
      {
        id: 'seo-rec-1',
        severity: 'warning',
        url: 'https://victorix.in/',
        title: 'Verify Google Search Console TXT Record',
        explanation:
          'Google Search Console API requires domain verification before organic clicks, impressions, and average positions can be fetched.',
        fix: 'Add TXT verification record to victorix.in DNS and configure GOOGLE_SEARCH_CONSOLE_KEY.',
        status: 'open',
      },
      {
        id: 'seo-rec-2',
        severity: 'optimization',
        url: 'https://victorix.in/website-developer-mumbai',
        title: 'Monitor Local Mumbai Landing Page Core Web Vitals',
        explanation:
          'Ensure LCP stays under 2.5s and CLS stays under 0.1 via PageSpeed Insights testing.',
        fix: 'Run live PageSpeed Insights check inside SEO Growth Monitor after deployment.',
        status: 'open',
      },
    ],
    seoReportsHistory: [],
    userSettings: getDefaultSettings(),
    quotas: {
      date: todayStr(),
      githubActionsRunsToday: 0,
      workerRequestsToday: 0,
      d1ReadsToday: 0,
      d1WritesToday: 0,
      kvReadsToday: 0,
      kvWritesToday: 0,
      pagesBuildsMonth: 0,
      geminiRequestsToday: 0,
      pagespeedRequestsToday: 0,
      overpassRequestsToday: 0,
      remotiveRequestsToday: 0,
      remoteokRequestsToday: 0,
      weworkremotelyRequestsToday: 0,
      jobicyRequestsToday: 0,
      himalayasRequestsToday: 0,
      workingnomadsRequestsToday: 0,
      arbeitnowRequestsToday: 0,
      customAtsRequestsToday: 0,
    },
    runLock: {
      locked: false,
      lockedAt: null,
      owner: null,
    },
    lastBackupAt: null,
    dedupeFingerprints: [],
    notifiedJobFingerprints: [],
  };
}

function migrateLegacyJob(j: any): RemoteJob {
  const elig = j.countryEligibility || 'Worldwide';
  const workType = j.workType || classifyWorkType(j.employmentType || '', j.jobTitle || '', j.description || '');
  const expLevel =
    j.experienceLevel || classifyExperienceLevel(j.experienceRequired || '', j.jobTitle || '', j.description || '');
  const salaryBucket = j.salaryBucket || classifySalaryBucket(j.salaryRange);
  const indiaEligibility = j.indiaEligibility || classifyIndiaEligibility(elig, j.description || '');
  const locationCountryBucket = j.locationCountryBucket || classifyCountryBucket(elig);
  const pubMs = new Date(j.publishedAt || j.createdAt).getTime();
  const isExpired =
    typeof j.isExpired === 'boolean'
      ? j.isExpired
      : j.riskClassification === 'REJECTED' && (Date.now() - pubMs) / 86400000 > 45;

  const oldSuit = j.suitability || {};
  const suitability =
    typeof oldSuit.skillRelevance === 'number'
      ? oldSuit
      : {
          totalScore: oldSuit.totalScore ?? 60,
          skillRelevance: oldSuit.jobRelevance ?? 15,
          locationEligibility: oldSuit.remoteEligibility ?? 15,
          remoteCompatibility: 12,
          experienceCompatibility: 10,
          employerCredibility: Math.min(15, oldSuit.employerCredibility ?? 10),
          compensationTransparency: Math.min(5, oldSuit.compensationTransparency ?? 2),
          deviceCompatibilityScore: oldSuit.deviceCompatibilityScore ?? 4,
          factors: Array.isArray(oldSuit.factors) ? oldSuit.factors : [],
        };

  const discoveredSources = Array.isArray(j.discoveredSources) && j.discoveredSources.length > 0
    ? j.discoveredSources
    : [
        {
          sourceId: j.source === 'Remotive' ? 'remotive_api' : 'manual_source',
          sourceName: j.source || 'Remotive',
          sourceUrl: j.originalPostingUrl || '',
          attributionUrl: j.sourceAttributionUrl,
          fetchedAt: j.lastCheckedAt || j.createdAt || new Date().toISOString(),
        },
      ];

  return {
    ...j,
    discoveredSources,
    salaryBucket,
    workType,
    experienceLevel: expLevel,
    locationCountryBucket,
    indiaEligibility,
    isExpired,
    suitability,
  };
}

function sanitizeLoadedDb(raw: any): DbState {
  const fresh = getInitialDb();

  // Strictly purge any legacy synthetic "-sample." demo leads from previous versions
  const realLeads: BusinessLead[] = Array.isArray(raw?.leads)
    ? raw.leads
        .filter((l: any) => l?.websiteUrl && !String(l.websiteUrl).includes('-sample'))
        .map((l: any) => ({
          ...l,
          stage: l.stage === 'ai_analysed' ? 'analysed' : l.stage || 'new_lead',
          dealValue: Math.max(5999, Number(l.dealValue) || 5999),
          notes: Array.isArray(l.notes) ? l.notes : [],
          activities: Array.isArray(l.activities) ? l.activities : [],
        }))
    : [];

  const realRuns: AutomationRun[] = Array.isArray(raw?.automationRuns) ? raw.automationRuns : [];

  // Merge existing source sync checkpoints with expanded Global Job Hunter defaults
  const defaultMap = new Map(fresh.sourceSyncState.map((s) => [s.sourceId, s]));
  const rawSources: any[] = Array.isArray(raw?.sourceSyncState) ? raw.sourceSyncState : [];
  const mergedMap = new Map<string, SourceSyncState>();

  for (const def of fresh.sourceSyncState) {
    mergedMap.set(def.sourceId, def);
  }

  for (const rs of rawSources) {
    if (!rs?.sourceId) continue;
    const def = defaultMap.get(rs.sourceId);
    if (def) {
      // If Arbeitnow was previously disabled under old policy placeholder, upgrade it to new public API config
      const wasOldArbeitnowPlaceholder =
        rs.sourceId === 'arbeitnow_api' &&
        String(rs.lastError || '').includes('Disabled by compliance policy');
      mergedMap.set(rs.sourceId, {
        ...def,
        ...(wasOldArbeitnowPlaceholder ? {} : rs),
        integrationType: def.integrationType,
        integrationStatus: wasOldArbeitnowPlaceholder
          ? def.integrationStatus
          : rs.integrationStatus || def.integrationStatus,
        sourceHealth: rs.sourceHealth || def.sourceHealth,
        attributionRequirement: def.attributionRequirement,
        configUrl: rs.configUrl || def.configUrl,
        minIntervalMinutes: rs.minIntervalMinutes ?? def.minIntervalMinutes,
        dailyLimit: rs.dailyLimit ?? def.dailyLimit,
      });
    } else {
      // Custom user-added ATS / RSS source
      mergedMap.set(rs.sourceId, {
        integrationType: 'Public ATS API',
        integrationStatus: 'connected_active',
        sourceHealth: 'untested',
        attributionRequirement: 'Direct source link preserved',
        ...rs,
      });
    }
  }

  const sources = Array.from(mergedMap.values());

  // Daily quota counter rollover check
  const today = todayStr();
  let quotas: QuotaCounters = { ...fresh.quotas, ...(raw?.quotas || {}) };
  if (quotas.date !== today) {
    quotas = {
      ...fresh.quotas,
      date: today,
      pagesBuildsMonth: quotas.pagesBuildsMonth || 0,
    };
    for (const s of sources) {
      if (s.lastResetDate !== today) {
        s.requestsToday = 0;
        s.lastResetDate = today;
      }
    }
  }

  const migratedJobs: RemoteJob[] = Array.isArray(raw?.remoteJobs)
    ? raw.remoteJobs.map(migrateLegacyJob)
    : [];

  return {
    leads: realLeads,
    enquiries: Array.isArray(raw?.enquiries) ? raw.enquiries : [],
    blogs: Array.isArray(raw?.blogs) && raw.blogs.length > 0 ? raw.blogs : fresh.blogs,
    remoteJobs: migratedJobs,
    savedJobs: Array.isArray(raw?.savedJobs) ? raw.savedJobs : [],
    jobApplications: Array.isArray(raw?.jobApplications) ? raw.jobApplications : [],
    jobAlerts: Array.isArray(raw?.jobAlerts) ? raw.jobAlerts : [],
    automationRuns: realRuns,
    sourceSyncState: sources,
    followUpTasks: Array.isArray(raw?.followUpTasks) ? raw.followUpTasks : [],
    seoRecommendations:
      Array.isArray(raw?.seoRecommendations) && raw.seoRecommendations.length > 0
        ? raw.seoRecommendations
        : fresh.seoRecommendations,
    seoReportsHistory: Array.isArray(raw?.seoReportsHistory) ? raw.seoReportsHistory : [],
    userSettings: { ...fresh.userSettings, ...(raw?.userSettings || {}) },
    quotas,
    runLock: raw?.runLock || fresh.runLock,
    lastBackupAt: raw?.lastBackupAt || null,
    dedupeFingerprints: Array.isArray(raw?.dedupeFingerprints) ? raw.dedupeFingerprints : [],
    notifiedJobFingerprints: Array.isArray(raw?.notifiedJobFingerprints)
      ? raw.notifiedJobFingerprints
      : [],
  };
}

export class StorageManager {
  public state: DbState;

  constructor() {
    this.state = this.load();
  }

  public isD1Configured(): boolean {
    return Boolean(
      process.env.CLOUDFLARE_ACCOUNT_ID &&
        process.env.CLOUDFLARE_D1_DATABASE_ID &&
        process.env.CLOUDFLARE_API_TOKEN
    );
  }

  public isKvConfigured(): boolean {
    return Boolean(
      process.env.CLOUDFLARE_ACCOUNT_ID &&
        process.env.CLOUDFLARE_KV_NAMESPACE_ID &&
        process.env.CLOUDFLARE_API_TOKEN
    );
  }

  public getStorageStatus(): StorageStatus {
    const d1 = this.isD1Configured();
    const kv = this.isKvConfigured();
    let statusLabel = 'Cloudflare D1 & KV: SETUP REQUIRED (Using local JSON persistence)';
    if (d1 && kv) {
      statusLabel = 'Cloudflare D1 & KV: CONNECTED (Free Tier Active)';
    } else if (d1) {
      statusLabel = 'Cloudflare D1 Connected · Cloudflare KV: SETUP REQUIRED';
    }

    return {
      d1Configured: d1,
      kvConfigured: kv,
      activeBackend: d1 && kv ? 'cloudflare_d1_and_kv' : 'local_json_fallback',
      statusLabel,
      migrationsFile: 'migrations/0001_initial_d1_schema.sql',
      tablesCount: 11,
      lastBackupAt: this.state.lastBackupAt,
    };
  }

  public load(): DbState {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
        const sanitized = sanitizeLoadedDb(raw);
        return sanitized;
      }
    } catch (err) {
      console.error('Error loading local persistence file, initializing clean DB:', err);
    }
    const fresh = getInitialDb();
    this.saveState(fresh);
    return fresh;
  }

  public save(): void {
    this.saveState(this.state);
  }

  private saveState(data: DbState): void {
    try {
      this.rolloverQuotasIfNeeded(data);
      data.quotas.d1WritesToday += 1;
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist state:', err);
    }
  }

  public rolloverQuotasIfNeeded(targetState: DbState = this.state): void {
    if (!targetState || !targetState.quotas) return;
    const today = todayStr();
    if (targetState.quotas.date !== today) {
      targetState.quotas = {
        date: today,
        githubActionsRunsToday: 0,
        workerRequestsToday: 0,
        d1ReadsToday: 0,
        d1WritesToday: 0,
        kvReadsToday: 0,
        kvWritesToday: 0,
        pagesBuildsMonth: targetState.quotas.pagesBuildsMonth || 0,
        geminiRequestsToday: 0,
        pagespeedRequestsToday: 0,
        overpassRequestsToday: 0,
        remotiveRequestsToday: 0,
        remoteokRequestsToday: 0,
        weworkremotelyRequestsToday: 0,
        jobicyRequestsToday: 0,
        himalayasRequestsToday: 0,
        workingnomadsRequestsToday: 0,
        arbeitnowRequestsToday: 0,
        customAtsRequestsToday: 0,
      };
      for (const s of targetState.sourceSyncState || []) {
        if (s.lastResetDate !== today) {
          s.requestsToday = 0;
          s.lastResetDate = today;
        }
      }
    }
  }

  // Optional Cloudflare D1 REST Query Executor (when env credentials exist)
  public async execD1Sql(sql: string, params: any[] = []): Promise<any> {
    if (!this.isD1Configured()) {
      return { configured: false, executed: false };
    }
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const dbId = process.env.CLOUDFLARE_D1_DATABASE_ID;
    const token = process.env.CLOUDFLARE_API_TOKEN;
    this.state.quotas.d1WritesToday += 1;

    try {
      const resp = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${dbId}/query`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sql, params }),
        }
      );
      return await resp.json();
    } catch (err: any) {
      return { configured: true, executed: false, error: err.message };
    }
  }

  // Optional Cloudflare KV REST Sync (when env credentials exist)
  public async kvPut(key: string, value: string): Promise<boolean> {
    this.state.quotas.kvWritesToday += 1;
    if (!this.isKvConfigured()) return false;
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const nsId = process.env.CLOUDFLARE_KV_NAMESPACE_ID;
    const token = process.env.CLOUDFLARE_API_TOKEN;
    try {
      const resp = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${nsId}/values/${encodeURIComponent(key)}`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: value,
        }
      );
      return resp.ok;
    } catch {
      return false;
    }
  }

  public getFreeTierMonitor(): FreeTierServiceStatus[] {
    this.rolloverQuotasIfNeeded();
    const q = this.state.quotas;
    const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY');
    const hasD1 = this.isD1Configured();
    const hasKv = this.isKvConfigured();

    const globalJobCallsToday =
      (q.remoteokRequestsToday || 0) +
      (q.weworkremotelyRequestsToday || 0) +
      (q.jobicyRequestsToday || 0) +
      (q.himalayasRequestsToday || 0) +
      (q.workingnomadsRequestsToday || 0) +
      (q.arbeitnowRequestsToday || 0) +
      (q.customAtsRequestsToday || 0);

    return [
      {
        id: 'github_actions',
        serviceName: 'GitHub Actions Runner',
        provider: 'GitHub Free Tier',
        status:
          this.state.userSettings.activeScheduler === 'github_actions'
            ? 'Free and active'
            : 'External setup required',
        usedToday: q.githubActionsRunsToday,
        dailyLimit: 96,
        monthlyLimit: 2000,
        unit: 'runs/day (2,000 mins/mo free)',
        warningThresholdPct: 80,
        fallbackBehavior: 'Use local manual Run Now or switch to Cloudflare Cron Triggers.',
        setupGuide: 'Push repo to GitHub and configure APP_URL & CRON_SECRET repository secrets.',
      },
      {
        id: 'cloudflare_d1',
        serviceName: 'Cloudflare D1 Database',
        provider: 'Cloudflare Free Tier',
        status: hasD1 ? 'Free and active' : 'External setup required',
        usedToday: q.d1WritesToday + q.d1ReadsToday,
        dailyLimit: 100000,
        unit: 'operations/day (100k writes, 5M reads)',
        warningThresholdPct: 80,
        fallbackBehavior: 'Persists to local victorix_db.json with full SQL export backup.',
        setupGuide: 'Set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID, and CLOUDFLARE_API_TOKEN.',
      },
      {
        id: 'cloudflare_kv',
        serviceName: 'Cloudflare KV Cache',
        provider: 'Cloudflare Free Tier',
        status: hasKv ? 'Free and active' : 'External setup required',
        usedToday: q.kvWritesToday + q.kvReadsToday,
        dailyLimit: 1000,
        unit: 'writes/day (1,000 free writes/day)',
        warningThresholdPct: 80,
        fallbackBehavior: 'In-memory + local JSON deduplication fingerprints.',
        setupGuide: 'Set CLOUDFLARE_KV_NAMESPACE_ID and CLOUDFLARE_API_TOKEN.',
      },
      {
        id: 'cloudflare_pages',
        serviceName: 'Cloudflare Pages Static Sites',
        provider: 'Cloudflare Free Tier',
        status: 'Free and active',
        usedToday: q.pagesBuildsMonth,
        dailyLimit: 500,
        monthlyLimit: 500,
        unit: 'builds/month (unlimited bandwidth)',
        warningThresholdPct: 85,
        fallbackBehavior: 'Download static HTML bundle from Client Website Factory and upload manually.',
        setupGuide: 'Connect Git repo or upload generated dist folder via wrangler pages deploy.',
      },
      {
        id: 'gemini_api',
        serviceName: 'Google Gemini AI (gemini-4-hydrogen)',
        provider: 'Google AI Studio Free Tier',
        status: !hasGemini
          ? 'External setup required'
          : q.geminiRequestsToday >= 1400
          ? 'Free quota exhausted'
          : 'Free and active',
        usedToday: q.geminiRequestsToday,
        dailyLimit: 1500,
        unit: 'requests/day (15 RPM)',
        warningThresholdPct: 85,
        fallbackBehavior: 'Deterministic rule-based generator handles proposals, CV tips & drafts automatically.',
        setupGuide: 'Configure GEMINI_API_KEY from Google AI Studio (no paid billing required).',
      },
      {
        id: 'remotive_api',
        serviceName: 'Remotive Remote Jobs API',
        provider: 'Remotive Public API',
        status: q.remotiveRequestsToday >= 4 ? 'Free quota exhausted' : 'Free and active',
        usedToday: q.remotiveRequestsToday,
        dailyLimit: 4,
        unit: 'requests/day (6h interval enforced)',
        warningThresholdPct: 75,
        fallbackBehavior: 'Serves cached verified Remotive listings until 6-hour cooldown resets.',
        setupGuide: 'Active automatically. Link & attribution to Remotive strictly preserved.',
      },
      {
        id: 'global_job_feeds',
        serviceName: 'Global Remote Job APIs & RSS (6 Feeds)',
        provider: 'RemoteOK, WWR, Jobicy, Himalayas, WorkingNomads, Arbeitnow',
        status: 'Free and active',
        usedToday: globalJobCallsToday,
        dailyLimit: 100,
        unit: 'feed syncs/day',
        warningThresholdPct: 80,
        fallbackBehavior: 'Independent source isolation keeps remaining feeds operational if one rate-limits.',
        setupGuide: 'Active automatically with per-source intervals and attribution requirements preserved.',
      },
      {
        id: 'osm_overpass',
        serviceName: 'OpenStreetMap Overpass Directory',
        provider: 'OpenStreetMap Foundation',
        status: q.overpassRequestsToday >= 200 ? 'Free quota exhausted' : 'Free and active',
        usedToday: q.overpassRequestsToday,
        dailyLimit: 250,
        unit: 'queries/day',
        warningThresholdPct: 80,
        fallbackBehavior: 'Respects fair-use cooldown; manual website auditing remains active.',
        setupGuide: 'Active automatically with polite User-Agent and strict timeouts.',
      },
      {
        id: 'gsc_ga4',
        serviceName: 'Google Search Console & GA4',
        provider: 'Google Free Tools',
        status:
          process.env.GOOGLE_SEARCH_CONSOLE_KEY && process.env.GA4_MEASUREMENT_ID
            ? 'Free and active'
            : 'External setup required',
        usedToday: q.pagespeedRequestsToday,
        dailyLimit: 400,
        unit: 'API checks/day',
        warningThresholdPct: 80,
        fallbackBehavior: 'Uses local HTTP route SEO validation; never fabricates search clicks/impressions.',
        setupGuide: 'Verify victorix.in in Search Console and set GOOGLE_SEARCH_CONSOLE_KEY / GA4_MEASUREMENT_ID.',
      },
    ];
  }

  public applyRetentionCleanup(): { removedJobs: number; removedLogs: number } {
    const now = Date.now();
    const jobCutoff = now - (this.state.userSettings.jobRetentionDays || 45) * 86400 * 1000;
    const savedSet = new Set(this.state.savedJobs.map((s) => s.jobId));
    const appSet = new Set(this.state.jobApplications.map((a) => a.jobId));

    const beforeJobs = this.state.remoteJobs.length;
    this.state.remoteJobs = this.state.remoteJobs.filter((j) => {
      if (savedSet.has(j.id) || appSet.has(j.id)) return true;
      const pubTime = new Date(j.publishedAt || j.createdAt).getTime();
      return Number.isNaN(pubTime) || pubTime >= jobCutoff;
    });
    const removedJobs = beforeJobs - this.state.remoteJobs.length;

    const maxLogs = this.state.userSettings.logRetentionCount || 100;
    const beforeLogs = this.state.automationRuns.length;
    if (beforeLogs > maxLogs) {
      this.state.automationRuns = this.state.automationRuns.slice(0, maxLogs);
    }
    const removedLogs = beforeLogs - this.state.automationRuns.length;

    this.save();
    return { removedJobs, removedLogs };
  }

  public createBackupPayload(): string {
    this.state.lastBackupAt = new Date().toISOString();
    this.save();
    return JSON.stringify(
      {
        exportedAt: this.state.lastBackupAt,
        version: 'VICTORIX-3.0-GLOBAL-JOBS',
        data: this.state,
      },
      null,
      2
    );
  }

  public hasFingerprint(fp: string): boolean {
    return this.state.dedupeFingerprints.includes(fp);
  }

  public addFingerprint(fp: string): void {
    if (!this.state.dedupeFingerprints.includes(fp)) {
      this.state.dedupeFingerprints.unshift(fp);
      if (this.state.dedupeFingerprints.length > 8000) {
        this.state.dedupeFingerprints = this.state.dedupeFingerprints.slice(0, 8000);
      }
    }
  }
}

export const storage = new StorageManager();
