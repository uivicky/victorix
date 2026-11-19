import crypto from 'crypto';
import { storage } from './storage.js';
import { evaluateJobScamAndSuitability } from './jobScamEngine.js';
import { validateUrlAgainstSsrf } from './ssrfAuditor.js';
import {
  DiscoveredJobSourceRef,
  JobAlertItem,
  RemoteJob,
  SourceSyncState,
} from '../src/types/index.js';

export const GLOBAL_JOB_CATEGORIES = [
  'Data Entry',
  'Virtual Assistant',
  'Customer Support',
  'Chat Support',
  'Email Support',
  'Web Development',
  'HTML/CSS',
  'JavaScript',
  'React',
  'WordPress',
  'SEO',
  'Digital Marketing',
  'Graphic Design',
  'Canva Design',
  'Content Writing',
  'Social Media Management',
  'Online Research',
  'AI Data Annotation',
  'Freelance Projects',
  'Remote Internships',
  'Remote Technical Support',
  'Software Testing',
] as const;

interface RawNormalizedCandidate {
  externalJobId?: string;
  jobTitle: string;
  employerName: string;
  companyWebsite?: string;
  description: string;
  originalPostingUrl: string;
  applicationUrl: string;
  sourceId: string;
  sourceName: string;
  sourceAttributionUrl?: string;
  publishedAt: string;
  applicationDeadline?: string | null;
  salaryRange?: string | null;
  employmentType: string;
  experienceRequired?: string | null;
  countryEligibility: string;
  rawCategory: string;
  tags: string[];
}

export interface SourceRunSummary {
  sourceId: string;
  sourceName: string;
  status: 'ok' | 'skipped_cooldown' | 'rate_limited' | 'blocked' | 'disabled' | 'error';
  evaluated: number;
  added: number;
  duplicatesMerged: number;
  error?: string;
}

function stripHtml(html: string): string {
  return String(html || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeXmlEntities(text: string): string {
  return String(text || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function extractXmlTag(block: string, tag: string): string {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = block.match(re);
  return m ? decodeXmlEntities(m[1]) : '';
}

export function normalizeCategory(title: string, rawCategory: string, tags: string[] = []): string {
  const combined = `${title} ${rawCategory} ${tags.join(' ')}`.toLowerCase();
  if (combined.includes('data annotation') || combined.includes('ai trainer') || combined.includes('rlhf') || combined.includes('annotation')) {
    return 'AI Data Annotation';
  }
  if (combined.includes('react')) return 'React';
  if (combined.includes('wordpress')) return 'WordPress';
  if (combined.includes('html') || combined.includes('css')) return 'HTML/CSS';
  if (combined.includes('javascript') || combined.includes('typescript') || combined.includes('node.js')) {
    return 'JavaScript';
  }
  if (combined.includes('qa') || combined.includes('quality assurance') || combined.includes('tester') || combined.includes('testing')) {
    return 'Software Testing';
  }
  if (combined.includes('technical support') || combined.includes('tech support') || combined.includes('helpdesk') || combined.includes('it support')) {
    return 'Remote Technical Support';
  }
  if (combined.includes('chat support') || combined.includes('live chat')) return 'Chat Support';
  if (combined.includes('email support')) return 'Email Support';
  if (combined.includes('customer support') || combined.includes('customer service') || combined.includes('customer success')) {
    return 'Customer Support';
  }
  if (combined.includes('virtual assistant') || combined.includes('executive assistant')) {
    return 'Virtual Assistant';
  }
  if (combined.includes('data entry') || combined.includes('spreadsheet')) return 'Data Entry';
  if (combined.includes('online research') || combined.includes('market research') || combined.includes('lead research')) {
    return 'Online Research';
  }
  if (combined.includes('seo')) return 'SEO';
  if (combined.includes('social media')) return 'Social Media Management';
  if (combined.includes('digital marketing') || combined.includes('marketing') || combined.includes('growth')) {
    return 'Digital Marketing';
  }
  if (combined.includes('canva')) return 'Canva Design';
  if (combined.includes('graphic') || combined.includes('ui/ux') || combined.includes('design')) {
    return 'Graphic Design';
  }
  if (combined.includes('writer') || combined.includes('content') || combined.includes('copywrit') || combined.includes('editor')) {
    return 'Content Writing';
  }
  if (combined.includes('intern')) return 'Remote Internships';
  if (combined.includes('freelance') || combined.includes('contract')) return 'Freelance Projects';
  if (
    combined.includes('web') ||
    combined.includes('frontend') ||
    combined.includes('full stack') ||
    combined.includes('fullstack') ||
    combined.includes('backend') ||
    combined.includes('developer') ||
    combined.includes('engineer') ||
    combined.includes('software')
  ) {
    return 'Web Development';
  }
  return 'Freelance Projects';
}

function normalizeTextKey(val: string): string {
  return String(val || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function normalizeUrlKey(url: string): string {
  try {
    const u = new URL(url.trim());
    return `${u.hostname.replace(/^www\./, '').toLowerCase()}${u.pathname.replace(/\/$/, '').toLowerCase()}`;
  } catch {
    return url.trim().toLowerCase();
  }
}

export function buildJobFingerprint(title: string, employer: string, _url?: string): string {
  const base = `${normalizeTextKey(employer)}|${normalizeTextKey(title)}`;
  return crypto.createHash('sha256').update(base).digest('hex').slice(0, 24);
}

async function politeFetch(url: string, accept = 'application/json', timeoutMs = 13000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'VICTORIX-GlobalJobHunter/3.0 (+https://victorix.in; permitted-feed-reader)',
        Accept: accept,
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

function safeIsoDate(input?: string | number | null): string {
  if (!input) return new Date().toISOString();
  if (typeof input === 'number') {
    const ms = input < 1e12 ? input * 1000 : input;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  }
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

// ---------------------------------------------------------------------------
// PER-SOURCE PARSERS (REAL AUTHORIZED FEEDS ONLY)
// ---------------------------------------------------------------------------
async function fetchRemoteOk(sync: SourceSyncState): Promise<RawNormalizedCandidate[]> {
  const resp = await politeFetch(sync.configUrl || 'https://remoteok.com/api', 'application/json');
  if (!resp.ok) throw Object.assign(new Error(`Remote OK HTTP ${resp.status}`), { httpStatus: resp.status });
  const data: any = await resp.json();
  if (!Array.isArray(data)) return [];
  // Index 0 on Remote OK API is legal metadata object
  return data
    .slice(1, 45)
    .filter((item) => item && item.position && item.company && (item.url || item.apply_url))
    .map((item) => {
      const salMin = Number(item.salary_min) || 0;
      const salMax = Number(item.salary_max) || 0;
      const salaryRange =
        salMin > 0 && salMax > 0
          ? `$${salMin.toLocaleString()} - $${salMax.toLocaleString()}/year`
          : salMin > 0
          ? `$${salMin.toLocaleString()}/year`
          : null;
      return {
        externalJobId: String(item.id || item.slug || ''),
        jobTitle: String(item.position).trim(),
        employerName: String(item.company).trim(),
        description: stripHtml(item.description || ''),
        originalPostingUrl: String(item.url || item.apply_url).trim(),
        applicationUrl: String(item.apply_url || item.url).trim(),
        sourceId: sync.sourceId,
        sourceName: 'Remote OK',
        sourceAttributionUrl: 'https://remoteok.com',
        publishedAt: safeIsoDate(item.date || item.epoch),
        salaryRange,
        employmentType: Array.isArray(item.tags) && item.tags.includes('contract') ? 'Contract' : 'Full-time Remote',
        countryEligibility: String(item.location || 'Worldwide').trim() || 'Worldwide',
        rawCategory: Array.isArray(item.tags) ? item.tags.slice(0, 3).join(', ') : '',
        tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
      };
    });
}

async function fetchRemotive(sync: SourceSyncState): Promise<RawNormalizedCandidate[]> {
  const url = `${sync.configUrl || 'https://remotive.com/api/remote-jobs'}?limit=50`;
  const resp = await politeFetch(url, 'application/json');
  if (!resp.ok) throw Object.assign(new Error(`Remotive HTTP ${resp.status}`), { httpStatus: resp.status });
  const data: any = await resp.json();
  const jobs = Array.isArray(data?.jobs) ? data.jobs : [];
  return jobs
    .filter((rj: any) => rj?.title && rj?.company_name && rj?.url)
    .map((rj: any) => ({
      externalJobId: String(rj.id || ''),
      jobTitle: String(rj.title).trim(),
      employerName: String(rj.company_name).trim(),
      description: stripHtml(rj.description || ''),
      originalPostingUrl: String(rj.url).trim(),
      applicationUrl: String(rj.url).trim(),
      sourceId: sync.sourceId,
      sourceName: 'Remotive',
      sourceAttributionUrl: 'https://remotive.com',
      publishedAt: safeIsoDate(rj.publication_date),
      salaryRange: rj.salary && String(rj.salary).trim() ? String(rj.salary).trim() : null,
      employmentType: String(rj.job_type || 'Remote').replace(/_/g, ' '),
      countryEligibility: String(rj.candidate_required_location || 'Worldwide').trim(),
      rawCategory: String(rj.category || ''),
      tags: Array.isArray(rj.tags) ? rj.tags.map(String) : [],
    }));
}

function parseRssFeedItems(
  xml: string,
  sourceId: string,
  sourceName: string,
  attributionUrl: string
): RawNormalizedCandidate[] {
  const items: RawNormalizedCandidate[] = [];
  const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/gi);
  for (const m of itemMatches) {
    const block = m[1];
    const rawTitle = extractXmlTag(block, 'title');
    const link = extractXmlTag(block, 'link');
    if (!rawTitle || !link) continue;

    // We Work Remotely often formats title as "Company Name: Role Title"
    let employerName = extractXmlTag(block, 'company') || extractXmlTag(block, 'dc:creator');
    let jobTitle = rawTitle;
    if (!employerName && rawTitle.includes(':')) {
      const idx = rawTitle.indexOf(':');
      const left = rawTitle.slice(0, idx).trim();
      const right = rawTitle.slice(idx + 1).trim();
      if (left.length >= 2 && right.length >= 3) {
        employerName = left;
        jobTitle = right;
      }
    }
    if (!employerName) employerName = sourceName;

    const region = extractXmlTag(block, 'region') || 'Worldwide';
    const rawCat = extractXmlTag(block, 'category') || '';
    const skills = extractXmlTag(block, 'skills');
    const empType = extractXmlTag(block, 'type') || 'Remote';
    const pubDate = extractXmlTag(block, 'pubDate');
    const desc = stripHtml(extractXmlTag(block, 'description'));
    const guid = extractXmlTag(block, 'guid') || link;

    items.push({
      externalJobId: guid,
      jobTitle,
      employerName,
      description: desc,
      originalPostingUrl: link,
      applicationUrl: link,
      sourceId,
      sourceName,
      sourceAttributionUrl: attributionUrl,
      publishedAt: safeIsoDate(pubDate),
      salaryRange: null,
      employmentType: empType,
      countryEligibility: region,
      rawCategory: rawCat,
      tags: skills ? skills.split(',').map((s) => s.trim()) : [],
    });
    if (items.length >= 40) break;
  }
  return items;
}

async function fetchWeWorkRemotely(sync: SourceSyncState): Promise<RawNormalizedCandidate[]> {
  const resp = await politeFetch(
    sync.configUrl || 'https://weworkremotely.com/remote-jobs.rss',
    'application/rss+xml, application/xml, text/xml'
  );
  if (!resp.ok) throw Object.assign(new Error(`We Work Remotely HTTP ${resp.status}`), { httpStatus: resp.status });
  const xml = await resp.text();
  return parseRssFeedItems(xml, sync.sourceId, 'We Work Remotely', 'https://weworkremotely.com');
}

async function fetchJobicy(sync: SourceSyncState): Promise<RawNormalizedCandidate[]> {
  const url = `${sync.configUrl || 'https://jobicy.com/api/v2/remote-jobs'}?count=40`;
  const resp = await politeFetch(url, 'application/json');
  if (!resp.ok) throw Object.assign(new Error(`Jobicy HTTP ${resp.status}`), { httpStatus: resp.status });
  const data: any = await resp.json();
  const jobs = Array.isArray(data?.jobs) ? data.jobs : [];
  return jobs
    .filter((j: any) => j?.jobTitle && j?.companyName && j?.url)
    .map((j: any) => {
      const min = Number(j.salaryMin);
      const max = Number(j.salaryMax);
      const cur = j.salaryCurrency || '';
      const per = j.salaryPeriod || '';
      const sym = cur === 'USD' ? '$' : cur ? `${cur} ` : '';
      let salaryRange: string | null = null;
      if (min > 0 && max > 0) {
        salaryRange = `${sym}${min.toLocaleString()} - ${sym}${max.toLocaleString()}${per ? `/${per}` : ''}`;
      } else if (min > 0) {
        salaryRange = `${sym}${min.toLocaleString()}${per ? `/${per}` : ''}`;
      }
      return {
        externalJobId: String(j.id || ''),
        jobTitle: decodeXmlEntities(j.jobTitle),
        employerName: decodeXmlEntities(j.companyName),
        description: stripHtml(j.jobDescription || j.jobExcerpt || ''),
        originalPostingUrl: String(j.url).trim(),
        applicationUrl: String(j.url).trim(),
        sourceId: sync.sourceId,
        sourceName: 'Jobicy',
        sourceAttributionUrl: 'https://jobicy.com',
        publishedAt: safeIsoDate(j.pubDate),
        salaryRange,
        employmentType: Array.isArray(j.jobType) ? j.jobType.join(', ') : String(j.jobType || 'Remote'),
        experienceRequired: j.jobLevel ? String(j.jobLevel) : null,
        countryEligibility: String(j.jobGeo || 'Anywhere').trim(),
        rawCategory: Array.isArray(j.jobIndustry) ? j.jobIndustry.join(', ') : String(j.jobIndustry || ''),
        tags: [],
      };
    });
}

async function fetchHimalayas(sync: SourceSyncState): Promise<RawNormalizedCandidate[]> {
  const url = `${sync.configUrl || 'https://himalayas.app/jobs/api'}?limit=40`;
  const resp = await politeFetch(url, 'application/json');
  if (!resp.ok) throw Object.assign(new Error(`Himalayas HTTP ${resp.status}`), { httpStatus: resp.status });
  const data: any = await resp.json();
  const jobs = Array.isArray(data?.jobs) ? data.jobs : [];
  return jobs
    .filter((j: any) => j?.title && j?.companyName && (j?.applicationLink || j?.guid))
    .map((j: any) => {
      const min = Number(j.minSalary);
      const max = Number(j.maxSalary);
      const cur = j.currency || 'USD';
      const per = j.salaryPeriod || 'year';
      const sym = cur === 'USD' ? '$' : `${cur} `;
      let salaryRange: string | null = null;
      if (min > 0 && max > 0) {
        salaryRange = `${sym}${min.toLocaleString()} - ${sym}${max.toLocaleString()}/${per}`;
      } else if (min > 0) {
        salaryRange = `${sym}${min.toLocaleString()}/${per}`;
      }
      const locList = Array.isArray(j.locationRestrictions) && j.locationRestrictions.length > 0
        ? j.locationRestrictions.join(', ')
        : 'Worldwide';
      return {
        externalJobId: String(j.guid || ''),
        jobTitle: String(j.title).trim(),
        employerName: String(j.companyName).trim(),
        description: stripHtml(j.description || j.excerpt || ''),
        originalPostingUrl: String(j.guid || j.applicationLink).trim(),
        applicationUrl: String(j.applicationLink || j.guid).trim(),
        sourceId: sync.sourceId,
        sourceName: 'Himalayas',
        sourceAttributionUrl: 'https://himalayas.app',
        publishedAt: safeIsoDate(j.pubDate),
        applicationDeadline: j.expiryDate ? safeIsoDate(j.expiryDate) : null,
        salaryRange,
        employmentType: String(j.employmentType || 'Remote'),
        experienceRequired: Array.isArray(j.seniority) ? j.seniority.join(', ') : null,
        countryEligibility: locList,
        rawCategory: Array.isArray(j.categories) ? j.categories.join(', ') : '',
        tags: Array.isArray(j.categories) ? j.categories.map(String) : [],
      };
    });
}

async function fetchWorkingNomads(sync: SourceSyncState): Promise<RawNormalizedCandidate[]> {
  const resp = await politeFetch(
    sync.configUrl || 'https://www.workingnomads.com/api/exposed_jobs/',
    'application/json'
  );
  if (!resp.ok) throw Object.assign(new Error(`Working Nomads HTTP ${resp.status}`), { httpStatus: resp.status });
  const data: any = await resp.json();
  if (!Array.isArray(data)) return [];
  return data
    .slice(0, 45)
    .filter((j) => j?.title && j?.company_name && j?.url)
    .map((j) => ({
      externalJobId: String(j.url).trim(),
      jobTitle: String(j.title).trim(),
      employerName: String(j.company_name).trim(),
      description: stripHtml(j.description || ''),
      originalPostingUrl: String(j.url).trim(),
      applicationUrl: String(j.url).trim(),
      sourceId: sync.sourceId,
      sourceName: 'Working Nomads',
      sourceAttributionUrl: 'https://www.workingnomads.com',
      publishedAt: safeIsoDate(j.pub_date),
      salaryRange: null,
      employmentType: 'Remote',
      countryEligibility: String(j.location || 'Worldwide').trim() || 'Worldwide',
      rawCategory: String(j.category_name || ''),
      tags: typeof j.tags === 'string' ? j.tags.split(',').map((t: string) => t.trim()) : [],
    }));
}

async function fetchArbeitnow(sync: SourceSyncState): Promise<RawNormalizedCandidate[]> {
  const resp = await politeFetch(
    sync.configUrl || 'https://www.arbeitnow.com/api/job-board-api',
    'application/json'
  );
  if (!resp.ok) throw Object.assign(new Error(`Arbeitnow HTTP ${resp.status}`), { httpStatus: resp.status });
  const data: any = await resp.json();
  const jobs = Array.isArray(data?.data) ? data.data : [];
  return jobs
    .filter((j: any) => j?.title && j?.company_name && j?.url && (j?.remote || String(j?.location || '').toLowerCase().includes('remote')))
    .slice(0, 45)
    .map((j: any) => ({
      externalJobId: String(j.slug || ''),
      jobTitle: String(j.title).trim(),
      employerName: String(j.company_name).trim(),
      description: stripHtml(j.description || ''),
      originalPostingUrl: String(j.url).trim(),
      applicationUrl: String(j.url).trim(),
      sourceId: sync.sourceId,
      sourceName: 'Arbeitnow',
      sourceAttributionUrl: 'https://www.arbeitnow.com',
      publishedAt: safeIsoDate(j.created_at),
      salaryRange: null,
      employmentType: Array.isArray(j.job_types) && j.job_types.length > 0 ? j.job_types.join(', ') : 'Remote',
      countryEligibility: String(j.location || 'Europe / Remote').trim(),
      rawCategory: Array.isArray(j.tags) ? j.tags.join(', ') : '',
      tags: Array.isArray(j.tags) ? j.tags.map(String) : [],
    }));
}

async function fetchDynamicCustomSource(sync: SourceSyncState): Promise<RawNormalizedCandidate[]> {
  if (!sync.configUrl) return [];
  const ssrf = await validateUrlAgainstSsrf(sync.configUrl);
  if (!ssrf.safe) {
    throw new Error(`SSRF blocked source URL: ${ssrf.reason}`);
  }

  const accept =
    sync.integrationType === 'Custom RSS Feed'
      ? 'application/rss+xml, application/xml, text/xml'
      : 'application/json, application/xml';
  const resp = await politeFetch(sync.configUrl, accept);
  if (!resp.ok) {
    throw Object.assign(new Error(`${sync.sourceName} HTTP ${resp.status}`), { httpStatus: resp.status });
  }

  const urlLower = sync.configUrl.toLowerCase();
  if (sync.integrationType === 'Custom RSS Feed' || urlLower.includes('/xml') || urlLower.endsWith('.rss') || urlLower.endsWith('.xml')) {
    const xml = await resp.text();
    return parseRssFeedItems(xml, sync.sourceId, sync.sourceName, sync.configUrl);
  }

  const data: any = await resp.json();

  // Greenhouse: { jobs: [...] }
  if (urlLower.includes('greenhouse.io')) {
    const arr = Array.isArray(data?.jobs) ? data.jobs : [];
    return arr.slice(0, 40).map((j: any) => ({
      externalJobId: String(j.id || ''),
      jobTitle: String(j.title || '').trim(),
      employerName: sync.sourceName.replace(/\s*\(Greenhouse\)$/i, ''),
      description: stripHtml(j.content || j.title || ''),
      originalPostingUrl: String(j.absolute_url || ''),
      applicationUrl: String(j.absolute_url || ''),
      sourceId: sync.sourceId,
      sourceName: sync.sourceName,
      sourceAttributionUrl: j.absolute_url,
      publishedAt: safeIsoDate(j.updated_at),
      salaryRange: null,
      employmentType: 'Remote / ATS',
      countryEligibility: String(j.location?.name || 'Remote'),
      rawCategory: Array.isArray(j.departments) ? j.departments.map((d: any) => d.name).join(', ') : '',
      tags: [],
    }));
  }

  // Lever: [...]
  if (urlLower.includes('lever.co') && Array.isArray(data)) {
    return data.slice(0, 40).map((j: any) => ({
      externalJobId: String(j.id || ''),
      jobTitle: String(j.text || '').trim(),
      employerName: sync.sourceName.replace(/\s*\(Lever\)$/i, ''),
      description: stripHtml(j.descriptionPlain || j.description || ''),
      originalPostingUrl: String(j.hostedUrl || ''),
      applicationUrl: String(j.applyUrl || j.hostedUrl || ''),
      sourceId: sync.sourceId,
      sourceName: sync.sourceName,
      sourceAttributionUrl: j.hostedUrl,
      publishedAt: safeIsoDate(j.createdAt),
      salaryRange: null,
      employmentType: String(j.categories?.commitment || 'Remote'),
      countryEligibility: String(j.categories?.location || j.workplaceType || 'Remote'),
      rawCategory: String(j.categories?.team || j.categories?.department || ''),
      tags: [],
    }));
  }

  // Ashby: { jobs: [...] }
  if (urlLower.includes('ashbyhq.com')) {
    const arr = Array.isArray(data?.jobs) ? data.jobs : [];
    return arr.slice(0, 40).map((j: any) => ({
      externalJobId: String(j.id || j.jobUrl || ''),
      jobTitle: String(j.title || '').trim(),
      employerName: sync.sourceName.replace(/\s*\(Ashby\)$/i, ''),
      description: stripHtml(j.descriptionPlain || j.descriptionHtml || j.title || ''),
      originalPostingUrl: String(j.jobUrl || ''),
      applicationUrl: String(j.applyUrl || j.jobUrl || ''),
      sourceId: sync.sourceId,
      sourceName: sync.sourceName,
      sourceAttributionUrl: j.jobUrl,
      publishedAt: safeIsoDate(j.publishedAt),
      salaryRange: null,
      employmentType: String(j.employmentType || 'Remote'),
      countryEligibility: String(j.location || (j.isRemote ? 'Remote' : 'Check listing')),
      rawCategory: String(j.department || j.team || ''),
      tags: [],
    }));
  }

  // Recruitee: { offers: [...] }
  if (urlLower.includes('recruitee.com')) {
    const arr = Array.isArray(data?.offers) ? data.offers : [];
    return arr.slice(0, 40).map((j: any) => ({
      externalJobId: String(j.id || ''),
      jobTitle: String(j.title || '').trim(),
      employerName: String(j.company_name || sync.sourceName),
      description: stripHtml(j.description || j.requirements || ''),
      originalPostingUrl: String(j.careers_url || ''),
      applicationUrl: String(j.careers_apply_url || j.careers_url || ''),
      sourceId: sync.sourceId,
      sourceName: sync.sourceName,
      sourceAttributionUrl: j.careers_url,
      publishedAt: safeIsoDate(j.published_at || j.created_at),
      salaryRange: null,
      employmentType: String(j.employment_type_code || (j.remote ? 'Remote' : 'Hybrid')),
      countryEligibility: String(j.location || (j.remote ? 'Worldwide / Remote' : 'Check listing')),
      rawCategory: String(j.department || ''),
      tags: [],
    }));
  }

  return [];
}

function incrementSourceQuota(sourceId: string): void {
  const q = storage.state.quotas;
  switch (sourceId) {
    case 'remoteok_api':
      q.remoteokRequestsToday = (q.remoteokRequestsToday || 0) + 1;
      break;
    case 'remotive_api':
      q.remotiveRequestsToday = (q.remotiveRequestsToday || 0) + 1;
      break;
    case 'weworkremotely_rss':
      q.weworkremotelyRequestsToday = (q.weworkremotelyRequestsToday || 0) + 1;
      break;
    case 'jobicy_api':
      q.jobicyRequestsToday = (q.jobicyRequestsToday || 0) + 1;
      break;
    case 'himalayas_api':
      q.himalayasRequestsToday = (q.himalayasRequestsToday || 0) + 1;
      break;
    case 'workingnomads_api':
      q.workingnomadsRequestsToday = (q.workingnomadsRequestsToday || 0) + 1;
      break;
    case 'arbeitnow_api':
      q.arbeitnowRequestsToday = (q.arbeitnowRequestsToday || 0) + 1;
      break;
    default:
      q.customAtsRequestsToday = (q.customAtsRequestsToday || 0) + 1;
      break;
  }
}

function findDuplicateJob(cand: RawNormalizedCandidate, fp: string): RemoteJob | undefined {
  const canonPost = normalizeUrlKey(cand.originalPostingUrl);
  const canonApp = normalizeUrlKey(cand.applicationUrl);
  return storage.state.remoteJobs.find((existing) => {
    if (existing.fingerprint === fp) return true;
    if (normalizeUrlKey(existing.originalPostingUrl) === canonPost) return true;
    if (canonApp && normalizeUrlKey(existing.applicationUrl) === canonApp) return true;
    if (
      cand.externalJobId &&
      existing.externalJobId === cand.externalJobId &&
      existing.discoveredSources.some((ds) => ds.sourceId === cand.sourceId)
    ) {
      return true;
    }
    return false;
  });
}

function maybeEmitJobAlert(job: RemoteJob): void {
  if (job.riskClassification === 'REJECTED' || job.riskClassification === 'SUSPICIOUS') return;
  if (storage.state.notifiedJobFingerprints.includes(job.fingerprint)) return;

  let alertType: JobAlertItem['alertType'] | null = null;
  if (job.indiaEligibility === 'Explicitly accepts India applicants') {
    alertType = 'india_eligible';
  } else if (job.suitability.totalScore >= 80) {
    alertType = 'high_match';
  } else if (job.workType === 'Freelance' || job.workType === 'Contract') {
    alertType = 'freelance';
  } else if (job.indiaEligibility === 'Worldwide applicants' && job.suitability.totalScore >= 65) {
    alertType = 'worldwide_remote';
  }

  if (!alertType) return;

  const alert: JobAlertItem = {
    id: `alert-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    jobId: job.id,
    fingerprint: job.fingerprint,
    alertType,
    title: job.jobTitle,
    employerName: job.employerName,
    countryEligibility: job.countryEligibility,
    matchScore: job.suitability.totalScore,
    createdAt: new Date().toISOString(),
    read: false,
  };

  storage.state.jobAlerts.unshift(alert);
  if (storage.state.jobAlerts.length > 100) {
    storage.state.jobAlerts = storage.state.jobAlerts.slice(0, 100);
  }
  storage.state.notifiedJobFingerprints.unshift(job.fingerprint);
  if (storage.state.notifiedJobFingerprints.length > 2000) {
    storage.state.notifiedJobFingerprints = storage.state.notifiedJobFingerprints.slice(0, 2000);
  }
}

function refreshExistingExpirations(): number {
  let expiredUpdated = 0;
  const now = Date.now();
  for (const job of storage.state.remoteJobs) {
    if (job.isExpired) continue;
    const pubMs = new Date(job.publishedAt || job.createdAt).getTime();
    const ageDays = Number.isNaN(pubMs) ? 0 : (now - pubMs) / 86400000;
    const dlMs = job.applicationDeadline ? new Date(job.applicationDeadline).getTime() : NaN;
    const pastDeadline = !Number.isNaN(dlMs) && dlMs < now;
    if (pastDeadline || ageDays > 45) {
      job.isExpired = true;
      job.riskClassification = 'REJECTED';
      job.evidence.classification = 'REJECTED';
      job.evidence.explanation = pastDeadline
        ? 'Listing automatically marked expired past employer application deadline.'
        : 'Listing automatically marked expired (>45 days since publication).';
      expiredUpdated += 1;
    }
  }
  return expiredUpdated;
}

export async function syncSingleJobSource(
  sync: SourceSyncState,
  options?: { forceManual?: boolean; maxAddPerSource?: number }
): Promise<SourceRunSummary> {
  if (!sync.enabled || sync.integrationStatus === 'search_portal_only' || sync.integrationStatus === 'paused_blocked') {
    return {
      sourceId: sync.sourceId,
      sourceName: sync.sourceName,
      status: sync.integrationStatus === 'paused_blocked' ? 'blocked' : 'disabled',
      evaluated: 0,
      added: 0,
      duplicatesMerged: 0,
      error: sync.lastError || 'Source is not enabled for automated polling',
    };
  }

  storage.rolloverQuotasIfNeeded();

  // Respect daily API request limit
  if (sync.dailyLimit > 0 && sync.requestsToday >= sync.dailyLimit) {
    sync.lastStatus = 'rate_limited';
    sync.integrationStatus = 'rate_limited';
    sync.sourceHealth = 'degraded';
    sync.lastError = `Daily limit (${sync.dailyLimit}/day) reached. Serving persisted records until daily reset.`;
    return {
      sourceId: sync.sourceId,
      sourceName: sync.sourceName,
      status: 'rate_limited',
      evaluated: 0,
      added: 0,
      duplicatesMerged: 0,
      error: sync.lastError,
    };
  }

  // Respect source-specific refresh interval
  if (!options?.forceManual && sync.lastSyncedAt) {
    const minsSince = (Date.now() - new Date(sync.lastSyncedAt).getTime()) / 60000;
    if (minsSince < sync.minIntervalMinutes) {
      const remaining = Math.max(1, Math.round(sync.minIntervalMinutes - minsSince));
      return {
        sourceId: sync.sourceId,
        sourceName: sync.sourceName,
        status: 'skipped_cooldown',
        evaluated: 0,
        added: 0,
        duplicatesMerged: 0,
        error: `Refresh interval active (${remaining}m until next permitted sync).`,
      };
    }
  }

  let candidates: RawNormalizedCandidate[] = [];
  try {
    sync.requestsToday += 1;
    incrementSourceQuota(sync.sourceId);

    switch (sync.sourceId) {
      case 'remoteok_api':
        candidates = await fetchRemoteOk(sync);
        break;
      case 'remotive_api':
        candidates = await fetchRemotive(sync);
        break;
      case 'weworkremotely_rss':
        candidates = await fetchWeWorkRemotely(sync);
        break;
      case 'jobicy_api':
        candidates = await fetchJobicy(sync);
        break;
      case 'himalayas_api':
        candidates = await fetchHimalayas(sync);
        break;
      case 'workingnomads_api':
        candidates = await fetchWorkingNomads(sync);
        break;
      case 'arbeitnow_api':
        candidates = await fetchArbeitnow(sync);
        break;
      default:
        candidates = await fetchDynamicCustomSource(sync);
        break;
    }
  } catch (err: any) {
    const httpStatus = Number(err?.httpStatus || 0);
    const msg = err?.name === 'AbortError' ? `${sync.sourceName} timed out` : err?.message || 'Fetch error';
    sync.lastSyncedAt = new Date().toISOString();
    sync.nextPermittedSyncAt = new Date(Date.now() + sync.minIntervalMinutes * 60000).toISOString();

    if (httpStatus === 401 || httpStatus === 403) {
      sync.lastStatus = 'blocked';
      sync.integrationStatus = 'paused_blocked';
      sync.sourceHealth = 'blocked';
      sync.enabled = false;
      sync.lastError = `Source returned HTTP ${httpStatus}. Automatically disabled to avoid policy violation; use Official Search Portal / manual inspection.`;
      return {
        sourceId: sync.sourceId,
        sourceName: sync.sourceName,
        status: 'blocked',
        evaluated: 0,
        added: 0,
        duplicatesMerged: 0,
        error: sync.lastError,
      };
    }

    if (httpStatus === 429) {
      sync.lastStatus = 'rate_limited';
      sync.integrationStatus = 'rate_limited';
      sync.sourceHealth = 'degraded';
      sync.nextPermittedSyncAt = new Date(Date.now() + Math.max(sync.minIntervalMinutes, 120) * 60000).toISOString();
      sync.lastError = `Source returned HTTP 429 rate-limit. Applied backoff cooldown.`;
      return {
        sourceId: sync.sourceId,
        sourceName: sync.sourceName,
        status: 'rate_limited',
        evaluated: 0,
        added: 0,
        duplicatesMerged: 0,
        error: sync.lastError,
      };
    }

    sync.lastStatus = 'error';
    sync.sourceHealth = 'degraded';
    sync.lastError = msg;
    return {
      sourceId: sync.sourceId,
      sourceName: sync.sourceName,
      status: 'error',
      evaluated: 0,
      added: 0,
      duplicatesMerged: 0,
      error: msg,
    };
  }

  const nowIso = new Date().toISOString();
  sync.lastSyncedAt = nowIso;
  sync.nextPermittedSyncAt = new Date(Date.now() + sync.minIntervalMinutes * 60000).toISOString();
  sync.lastStatus = 'ok';
  sync.integrationStatus = 'connected_active';
  sync.sourceHealth = 'healthy';
  sync.lastError = null;

  const applicantSkills = storage.state.userSettings.applicantSkills || [];
  let evaluated = 0;
  let added = 0;
  let duplicatesMerged = 0;
  const maxAdd = options?.maxAddPerSource ?? 20;

  for (const cand of candidates) {
    if (!cand.jobTitle || !cand.employerName || !cand.originalPostingUrl) continue;
    evaluated += 1;

    const fp = buildJobFingerprint(cand.jobTitle, cand.employerName, cand.originalPostingUrl);
    const existing = findDuplicateJob(cand, fp);

    if (existing) {
      duplicatesMerged += 1;
      existing.lastCheckedAt = nowIso;
      if (!existing.discoveredSources.some((ds) => ds.sourceId === cand.sourceId)) {
        existing.discoveredSources.push({
          sourceId: cand.sourceId,
          sourceName: cand.sourceName,
          sourceUrl: cand.originalPostingUrl,
          attributionUrl: cand.sourceAttributionUrl,
          fetchedAt: nowIso,
        });
        if (!existing.source.includes(cand.sourceName)) {
          existing.source = `${existing.source}, ${cand.sourceName}`;
        }
      }
      if (!existing.salaryRange && cand.salaryRange) {
        existing.salaryRange = cand.salaryRange;
      }
      continue;
    }

    if (added >= maxAdd) continue;

    const jobId = `job-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const category = normalizeCategory(cand.jobTitle, cand.rawCategory, cand.tags);
    const evalResult = evaluateJobScamAndSuitability({
      jobId,
      jobTitle: cand.jobTitle,
      employerName: cand.employerName,
      companyWebsite: cand.companyWebsite,
      description: cand.description.slice(0, 3500),
      originalPostingUrl: cand.originalPostingUrl,
      applicationUrl: cand.applicationUrl,
      source: cand.sourceName,
      publishedAt: cand.publishedAt,
      applicationDeadline: cand.applicationDeadline,
      salaryRange: cand.salaryRange,
      employmentType: cand.employmentType,
      experienceRequired: cand.experienceRequired,
      countryEligibility: cand.countryEligibility,
      category,
      applicantSkills,
    });

    const sourceRef: DiscoveredJobSourceRef = {
      sourceId: cand.sourceId,
      sourceName: cand.sourceName,
      sourceUrl: cand.originalPostingUrl,
      attributionUrl: cand.sourceAttributionUrl,
      fetchedAt: nowIso,
    };

    const newJob: RemoteJob = {
      id: jobId,
      externalJobId: cand.externalJobId,
      fingerprint: fp,
      jobTitle: cand.jobTitle,
      employerName: cand.employerName,
      companyWebsite: cand.companyWebsite,
      description: cand.description.slice(0, 2200),
      originalPostingUrl: cand.originalPostingUrl,
      applicationUrl: cand.applicationUrl,
      source: cand.sourceName,
      sourceAttributionUrl: cand.sourceAttributionUrl,
      discoveredSources: [sourceRef],
      publishedAt: cand.publishedAt,
      lastCheckedAt: nowIso,
      salaryRange: cand.salaryRange || null,
      salaryBucket: evalResult.salaryBucket,
      employmentType: cand.employmentType || 'Remote',
      workType: evalResult.workType,
      experienceRequired: cand.experienceRequired || null,
      experienceLevel: evalResult.experienceLevel,
      countryEligibility: cand.countryEligibility || 'Worldwide',
      locationCountryBucket: evalResult.locationCountryBucket,
      indiaEligibility: evalResult.indiaEligibility,
      remoteStatus: evalResult.workType === 'Hybrid' ? 'Hybrid Remote' : '100% Remote',
      applicationDeadline: cand.applicationDeadline || null,
      isExpired: evalResult.isExpired,
      deviceCompatibility: evalResult.deviceCompatibility,
      category,
      riskClassification: evalResult.evidence.classification,
      evidence: evalResult.evidence,
      suitability: evalResult.suitability,
      createdAt: nowIso,
    };

    storage.state.remoteJobs.unshift(newJob);
    storage.addFingerprint(`job:${fp}`);
    maybeEmitJobAlert(newJob);
    added += 1;
  }

  return {
    sourceId: sync.sourceId,
    sourceName: sync.sourceName,
    status: 'ok',
    evaluated,
    added,
    duplicatesMerged,
  };
}

export async function runRemoteJobDiscovery(options?: {
  forceManual?: boolean;
  sourceId?: string;
}): Promise<{
  evaluated: number;
  added: number;
  duplicatesSkipped: number;
  expiredUpdated: number;
  sourceStatus: string;
  sourceSummaries: SourceRunSummary[];
  error?: string;
}> {
  const jobSources = storage.state.sourceSyncState.filter((s) => {
    if (s.sourceType !== 'job') return false;
    if (options?.sourceId) return s.sourceId === options.sourceId;
    return s.enabled && s.integrationStatus !== 'search_portal_only';
  });

  if (jobSources.length === 0) {
    return {
      evaluated: 0,
      added: 0,
      duplicatesSkipped: 0,
      expiredUpdated: 0,
      sourceStatus: 'disabled',
      sourceSummaries: [],
      error: options?.sourceId
        ? `Source ${options.sourceId} is not configured/enabled for API fetching.`
        : 'No enabled job sources active.',
    };
  }

  const expiredUpdated = refreshExistingExpirations();
  const summaries: SourceRunSummary[] = [];

  for (const src of jobSources) {
    // Only bypass cooldown when user specifically clicks manual sync on a single source, OR forceManual
    const forceThisSource = Boolean(options?.forceManual && (options?.sourceId || src.requestsToday < src.dailyLimit));
    const summary = await syncSingleJobSource(src, {
      forceManual: forceThisSource,
      maxAddPerSource: options?.sourceId ? 25 : 15,
    });
    summaries.push(summary);
  }

  // Keep storage lean on free tier (retain up to 600 recent jobs + all saved/applied jobs)
  if (storage.state.remoteJobs.length > 600) {
    const keepIds = new Set([
      ...storage.state.savedJobs.map((s) => s.jobId),
      ...storage.state.jobApplications.map((a) => a.jobId),
    ]);
    const sorted = [...storage.state.remoteJobs].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
    const retained: RemoteJob[] = [];
    for (const j of sorted) {
      if (keepIds.has(j.id) || retained.length < 600) {
        retained.push(j);
      }
    }
    storage.state.remoteJobs = retained;
  }

  storage.save();

  const evaluated = summaries.reduce((acc, s) => acc + s.evaluated, 0);
  const added = summaries.reduce((acc, s) => acc + s.added, 0);
  const duplicatesSkipped = summaries.reduce((acc, s) => acc + s.duplicatesMerged, 0);
  const okCount = summaries.filter((s) => s.status === 'ok').length;
  const errMsgs = summaries
    .filter((s) => s.status === 'error' || s.status === 'blocked')
    .map((s) => `${s.sourceName}: ${s.error}`);

  const sourceStatus =
    okCount > 0
      ? errMsgs.length > 0
        ? 'partial'
        : 'ok'
      : summaries.every((s) => s.status === 'skipped_cooldown' || s.status === 'rate_limited')
      ? 'cooldown'
      : 'error';

  return {
    evaluated,
    added,
    duplicatesSkipped,
    expiredUpdated,
    sourceStatus,
    sourceSummaries: summaries,
    error: errMsgs.length > 0 ? errMsgs.join(' | ') : undefined,
  };
}

export async function addAndTestCustomJobSource(input: {
  platform: 'greenhouse' | 'lever' | 'ashby' | 'recruitee' | 'custom_rss';
  companyOrLabel: string;
  boardSlugOrUrl: string;
}): Promise<{
  success: boolean;
  source?: SourceSyncState;
  error?: string;
  fetchedCount?: number;
}> {
  const cleanLabel = input.companyOrLabel.trim();
  const slugOrUrl = input.boardSlugOrUrl.trim();
  if (!cleanLabel || !slugOrUrl) {
    return { success: false, error: 'Company/Label and board slug or RSS URL are required.' };
  }

  let resolvedUrl = slugOrUrl;
  let integrationType: SourceSyncState['integrationType'] = 'Public ATS API';
  let suffix = '';

  if (input.platform === 'greenhouse') {
    const slug = slugOrUrl.replace(/^https?:\/\/(boards\.)?greenhouse\.io\//i, '').replace(/\/.*$/, '');
    resolvedUrl = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(slug)}/jobs`;
    suffix = 'Greenhouse';
  } else if (input.platform === 'lever') {
    const slug = slugOrUrl.replace(/^https?:\/\/jobs\.lever\.co\//i, '').replace(/\/.*$/, '');
    resolvedUrl = `https://api.lever.co/v0/postings/${encodeURIComponent(slug)}?mode=json`;
    suffix = 'Lever';
  } else if (input.platform === 'ashby') {
    const slug = slugOrUrl.replace(/^https?:\/\/jobs\.ashbyhq\.com\//i, '').replace(/\/.*$/, '');
    resolvedUrl = `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(slug)}`;
    suffix = 'Ashby';
  } else if (input.platform === 'recruitee') {
    const slug = slugOrUrl.replace(/^https?:\/\//i, '').replace(/\.recruitee\.com.*$/i, '');
    resolvedUrl = `https://${encodeURIComponent(slug)}.recruitee.com/api/offers/`;
    suffix = 'Recruitee';
  } else {
    integrationType = 'Custom RSS Feed';
    suffix = 'RSS';
  }

  const ssrf = await validateUrlAgainstSsrf(resolvedUrl);
  if (!ssrf.safe) {
    return { success: false, error: `Blocked unsafe URL: ${ssrf.reason}` };
  }

  const sourceId = `custom_${input.platform}_${cleanLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${Date.now().toString().slice(-4)}`;
  const today = new Date().toISOString().slice(0, 10);

  const newSource: SourceSyncState = {
    sourceId,
    sourceName: `${cleanLabel} (${suffix})`,
    sourceType: 'job',
    integrationType,
    integrationStatus: 'connected_active',
    sourceHealth: 'untested',
    attributionRequirement: `Direct career/RSS link preserved (${cleanLabel})`,
    configUrl: resolvedUrl,
    minIntervalMinutes: 120,
    dailyLimit: 24,
    requestsToday: 0,
    lastResetDate: today,
    lastSyncedAt: null,
    nextPermittedSyncAt: null,
    lastStatus: 'ready',
    lastError: null,
    enabled: true,
    notes: `User-configured ${suffix} source: ${resolvedUrl}`,
  };

  // Test live before committing
  const testResult = await syncSingleJobSource(newSource, { forceManual: true, maxAddPerSource: 15 });
  if (testResult.status === 'error' || testResult.status === 'blocked') {
    return {
      success: false,
      error: testResult.error || `Failed to fetch jobs from ${resolvedUrl}`,
    };
  }

  storage.state.sourceSyncState.push(newSource);
  storage.save();
  return {
    success: true,
    source: newSource,
    fetchedCount: testResult.evaluated,
  };
}

export function inspectManualJobListing(input: {
  jobTitle: string;
  employerName: string;
  companyWebsite?: string;
  description: string;
  originalPostingUrl: string;
  applicationUrl?: string;
  source?: string;
  salaryRange?: string;
  countryEligibility?: string;
  employmentType?: string;
  applicationDeadline?: string;
  experienceRequired?: string;
}): { job: RemoteJob; duplicate: boolean } {
  const postingUrl = input.originalPostingUrl.trim();
  const appUrl = (input.applicationUrl || postingUrl).trim();
  const fp = buildJobFingerprint(input.jobTitle, input.employerName, postingUrl);

  const existing = storage.state.remoteJobs.find(
    (j) => j.fingerprint === fp || normalizeUrlKey(j.originalPostingUrl) === normalizeUrlKey(postingUrl)
  );
  if (existing) {
    return { job: existing, duplicate: true };
  }

  const jobId = `job-manual-${Date.now()}`;
  const category = normalizeCategory(input.jobTitle, '', []);
  const publishedAt = new Date().toISOString();
  const salary = input.salaryRange && input.salaryRange.trim() ? input.salaryRange.trim() : null;
  const eligibility = input.countryEligibility?.trim() || 'India / Remote';
  const empType = input.employmentType?.trim() || 'Remote';
  const sourceName = input.source?.trim() || 'Manual Official Career Verification';

  const evalResult = evaluateJobScamAndSuitability({
    jobId,
    jobTitle: input.jobTitle.trim(),
    employerName: input.employerName.trim(),
    companyWebsite: input.companyWebsite?.trim(),
    description: input.description.trim(),
    originalPostingUrl: postingUrl,
    applicationUrl: appUrl,
    source: sourceName,
    publishedAt,
    applicationDeadline: input.applicationDeadline || null,
    salaryRange: salary,
    employmentType: empType,
    experienceRequired: input.experienceRequired || null,
    countryEligibility: eligibility,
    category,
    applicantSkills: storage.state.userSettings.applicantSkills || [],
  });

  const job: RemoteJob = {
    id: jobId,
    fingerprint: fp,
    jobTitle: input.jobTitle.trim(),
    employerName: input.employerName.trim(),
    companyWebsite: input.companyWebsite?.trim(),
    description: input.description.trim().slice(0, 2200),
    originalPostingUrl: postingUrl,
    applicationUrl: appUrl,
    source: sourceName,
    discoveredSources: [
      {
        sourceId: 'manual_inspection',
        sourceName,
        sourceUrl: postingUrl,
        fetchedAt: publishedAt,
      },
    ],
    publishedAt,
    lastCheckedAt: publishedAt,
    salaryRange: salary,
    salaryBucket: evalResult.salaryBucket,
    employmentType: empType,
    workType: evalResult.workType,
    experienceRequired: input.experienceRequired || null,
    experienceLevel: evalResult.experienceLevel,
    countryEligibility: eligibility,
    locationCountryBucket: evalResult.locationCountryBucket,
    indiaEligibility: evalResult.indiaEligibility,
    remoteStatus: evalResult.workType === 'Hybrid' ? 'Hybrid Remote' : 'Remote',
    applicationDeadline: input.applicationDeadline || null,
    isExpired: evalResult.isExpired,
    deviceCompatibility: evalResult.deviceCompatibility,
    category,
    riskClassification: evalResult.evidence.classification,
    evidence: evalResult.evidence,
    suitability: evalResult.suitability,
    createdAt: publishedAt,
  };

  storage.state.remoteJobs.unshift(job);
  storage.addFingerprint(`job:${fp}`);
  storage.save();

  return { job, duplicate: false };
}
