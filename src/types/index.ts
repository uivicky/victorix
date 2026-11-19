export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  focus: string;
}

export interface ProjectCaseStudy {
  id: string;
  slug: string;
  title: string;
  client: string;
  category: string;
  liveUrl: string;
  tagline: string;
  summary: string;
  challenge: string;
  solution: string;
  technologies: string[];
  keyFeatures: string[];
  metrics: { label: string; value: string }[];
  verifiedProjectDetails?: string[];
  unconfirmedDetails?: string[];
  accentColor: string;
}

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  iconName: string;
  benefits: string[];
  deliverables: string[];
  idealFor: string;
  techStack: string[];
  typicalTimeline: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  readTime: string;
  date: string;
  author: string;
  category: string;
  keywords: string[];
  content: string;
  status?: 'draft' | 'published';
  seoTitle?: string;
  seoDescription?: string;
  internalLinks?: { label: string; url: string }[];
  updatedAt?: string;
}

// ---------------------------------------------------------------------------
// BUSINESS CLIENT HUNTER & SAFE WEBSITE AUDITOR
// ---------------------------------------------------------------------------
export interface WebsiteAudit {
  id?: string;
  url: string;
  httpStatus: number;
  responseTimeMs: number;
  htmlBytes: number;
  isHttps: boolean;
  mobileResponsive: boolean;
  hasViewportMeta: boolean;
  hasTitle: boolean;
  pageTitle?: string;
  hasMetaDescription: boolean;
  metaDescription?: string;
  canonicalPresent: boolean;
  canonicalUrl?: string;
  h1Count: number;
  h2Count: number;
  altTagsMissing: number;
  totalImages?: number;
  loadSpeedEstimated: 'Fast' | 'Average' | 'Slow' | 'Unmeasured';
  securityHeadersScore: number;
  securityHeadersPresent?: string[];
  sitemapDetected: boolean;
  robotsDetected: boolean;
  brokenLinksChecked: number;
  brokenLinksFound: number;
  brokenLinksList?: string[];
  accessibilityScore: number;
  observedIssues: string[];
  positiveHighlights: string[];
  recommendations: string[];
  scannedAt: string;
  auditType: 'live_measured' | 'unreachable' | 'ssrf_blocked';
  errorNote?: string;
}

export interface LeadScore {
  totalScore: number; // 0 - 100
  tier: 'High' | 'Medium' | 'Low';
  businessRelevance: number; // 0 - 25
  improvementOpportunity: number; // 0 - 25
  serviceCompatibility: number; // 0 - 20
  evidenceQuality: number; // 0 - 15
  contactability: number; // 0 - 15
  explanation: string;
  factors: { label: string; score: number; max: number; note: string }[];
}

export interface ProposalDraft {
  id: string;
  leadId: string;
  businessName: string;
  websiteUrl: string;
  recommendedService: string;
  relevantVictorixProjects: string[];
  subjectLine: string;
  intro: string;
  observedGaps: string[];
  solutionProposal: string;
  suggestedNextStep: string;
  whatsappMessage: string;
  status: 'draft' | 'reviewed' | 'approved' | 'rejected' | 'sent';
  reviewedBy?: string;
  updatedAt: string;
}

export type CrmPipelineStage =
  | 'new_lead'
  | 'analysed'
  | 'reviewed'
  | 'contacted'
  | 'interested'
  | 'meeting_scheduled'
  | 'proposal_sent'
  | 'negotiation'
  | 'won'
  | 'lost';

export interface LeadNote {
  id: string;
  author: 'Vicky' | 'Abhishek';
  text: string;
  createdAt: string;
}

export interface ContactActivity {
  id: string;
  type: 'whatsapp' | 'call' | 'meeting';
  date: string;
  notes: string;
  outcome?: string;
}

export interface BusinessLead {
  id: string;
  businessName: string;
  category: string;
  city: string;
  locality?: string;
  priorityTier?: string;
  websiteUrl: string;
  websiteAvailable?: boolean;
  phone?: string;
  source: string;
  sourceUrl?: string;
  discoveryTimestamp?: string;
  stage: CrmPipelineStage;
  audit?: WebsiteAudit;
  score?: LeadScore;
  proposal?: ProposalDraft;
  recommendedService: string;
  dealValue?: number; // INR, minimum ₹5,999
  followUpDate?: string | null;
  humanApprovedForOutreach?: boolean;
  notes: LeadNote[];
  activities: ContactActivity[];
  assignedTo: 'Vicky Vishwakarma' | 'Abhishek';
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// GLOBAL REMOTE JOB HUNTER, SCAM ENGINE & APPLICATION TRACKER
// ---------------------------------------------------------------------------
export type JobRiskClassification = 'VERIFIED' | 'NEEDS REVIEW' | 'SUSPICIOUS' | 'REJECTED';

export type DeviceCompatibility =
  | 'Laptop required'
  | 'Laptop preferred'
  | 'Mobile friendly'
  | 'Both supported'
  | 'Not specified';

export type WorkType =
  | 'Fully remote'
  | 'Hybrid'
  | 'Freelance'
  | 'Contract'
  | 'Part-time'
  | 'Full-time'
  | 'Internship'
  | 'Temporary'
  | 'Not specified';

export type ExperienceLevel =
  | 'No experience'
  | 'Entry level'
  | 'Junior'
  | 'Mid-level'
  | 'Senior'
  | 'Not specified';

export type SalaryBucket =
  | 'Unpaid / not disclosed'
  | 'Under $500/month'
  | '$500–$1,000/month'
  | '$1,000–$2,000/month'
  | '$2,000–$5,000/month'
  | 'Above $5,000/month'
  | 'Other / non-USD disclosed';

export type IndiaEligibilityStatus =
  | 'Explicitly accepts India applicants'
  | 'Worldwide applicants'
  | 'Region restricted'
  | 'India eligibility unclear'
  | 'Not eligible for India applicants';

export type ApplicationStage =
  | 'DISCOVERED'
  | 'VERIFIED'
  | 'SHORTLISTED'
  | 'READY TO APPLY'
  | 'APPLIED'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED';

export interface DiscoveredJobSourceRef {
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  attributionUrl?: string;
  fetchedAt: string;
}

export interface JobVerificationEvidence {
  id: string;
  jobId: string;
  classification: JobRiskClassification;
  employerDomainMatch: boolean;
  officialWebsiteReachable: boolean;
  paymentScamSignals: string[];
  positiveEvidence: string[];
  riskFlags: string[];
  explanation: string;
  checkedAt: string;
}

export interface JobSuitabilityScore {
  totalScore: number; // 0 - 100 (Strictly separate from fraud risk)
  skillRelevance: number; // 0 - 25
  locationEligibility: number; // 0 - 20
  remoteCompatibility: number; // 0 - 15
  experienceCompatibility: number; // 0 - 15
  employerCredibility: number; // 0 - 15
  compensationTransparency: number; // 0 - 5
  deviceCompatibilityScore: number; // 0 - 5
  factors: { label: string; score: number; max: number; note: string }[];
}

export interface RemoteJob {
  id: string;
  externalJobId?: string;
  fingerprint: string;
  jobTitle: string;
  employerName: string;
  companyWebsite?: string;
  description: string;
  originalPostingUrl: string;
  applicationUrl: string;
  source: string;
  sourceAttributionUrl?: string;
  discoveredSources: DiscoveredJobSourceRef[];
  publishedAt: string;
  lastCheckedAt: string;
  salaryRange?: string | null;
  salaryBucket: SalaryBucket;
  employmentType: string;
  workType: WorkType;
  experienceRequired?: string | null;
  experienceLevel: ExperienceLevel;
  countryEligibility: string;
  locationCountryBucket: string;
  indiaEligibility: IndiaEligibilityStatus;
  remoteStatus: string;
  applicationDeadline?: string | null;
  isExpired: boolean;
  deviceCompatibility: DeviceCompatibility;
  category: string;
  riskClassification: JobRiskClassification;
  evidence: JobVerificationEvidence;
  suitability: JobSuitabilityScore;
  createdAt: string;
}

export interface JobAlertItem {
  id: string;
  jobId: string;
  fingerprint: string;
  alertType: 'india_eligible' | 'worldwide_remote' | 'high_match' | 'freelance';
  title: string;
  employerName: string;
  countryEligibility: string;
  matchScore: number;
  createdAt: string;
  read: boolean;
}

export interface SavedJob {
  id: string;
  jobId: string;
  personalNotes: string;
  savedAt: string;
  job?: RemoteJob;
}

export interface JobApplication {
  id: string;
  jobId: string;
  stage: ApplicationStage;
  personalNotes: string;
  interviewNotes: string;
  applicationDate?: string | null;
  followUpReminder?: string | null;
  messageDraft: string;
  humanApproved: boolean;
  cvSuggestions: string[];
  updatedAt: string;
  job?: RemoteJob;
}

// ---------------------------------------------------------------------------
// AUTOMATION, STORAGE, FREE-TIER USAGE & SEO
// ---------------------------------------------------------------------------
export interface ContactEnquiry {
  id: string;
  name: string;
  phone: string;
  service: string;
  projectDetails: string;
  timeline: string;
  createdAt: string;
  status: 'new' | 'contacted' | 'in_discussion' | 'closed';
  notes?: string;
}

export interface AutomationRun {
  id: string;
  triggerType: 'github_actions' | 'cloudflare_worker' | 'manual_run' | 'local_server';
  status: 'running' | 'success' | 'partial' | 'failed' | 'skipped_locked';
  startedAt: string;
  finishedAt?: string;
  durationMs: number;
  businessEvaluated: number;
  businessAdded: number;
  jobsEvaluated: number;
  jobsAdded: number;
  duplicatesSkipped: number;
  steps: string[];
  errorMessage?: string;
}

export interface SourceSyncState {
  sourceId: string;
  sourceName: string;
  sourceType: 'business' | 'job';
  integrationType:
    | 'Public JSON API'
    | 'Public RSS Feed'
    | 'Public ATS API'
    | 'Official Search Portal'
    | 'Custom RSS Feed'
    | 'Open Directory API';
  integrationStatus:
    | 'connected_active'
    | 'configurable_ready'
    | 'search_portal_only'
    | 'rate_limited'
    | 'paused_blocked'
    | 'error';
  sourceHealth: 'healthy' | 'degraded' | 'blocked' | 'untested';
  attributionRequirement: string;
  configUrl?: string;
  minIntervalMinutes: number;
  dailyLimit: number;
  requestsToday: number;
  lastResetDate: string;
  lastSyncedAt?: string | null;
  nextPermittedSyncAt?: string | null;
  lastStatus: 'ready' | 'ok' | 'rate_limited' | 'error' | 'disabled' | 'blocked';
  lastError?: string | null;
  enabled: boolean;
  notes?: string;
}

export interface FollowUpTask {
  id: string;
  relatedType: 'business_lead' | 'job_application';
  relatedId: string;
  title: string;
  dueDate: string;
  assignedTo: 'Vicky Vishwakarma' | 'Abhishek';
  status: 'pending' | 'completed';
  createdAt: string;
}

export type QuotaStateStatus =
  | 'Free and active'
  | 'Free quota exhausted'
  | 'External setup required'
  | 'Optional paid service'
  | 'Temporarily unavailable';

export interface FreeTierServiceStatus {
  id: string;
  serviceName: string;
  provider: string;
  status: QuotaStateStatus;
  usedToday: number;
  dailyLimit: number;
  usedMonthly?: number;
  monthlyLimit?: number;
  unit: string;
  warningThresholdPct: number;
  fallbackBehavior: string;
  setupGuide: string;
}

export interface UserSettings {
  activeScheduler: 'github_actions' | 'cloudflare_worker' | 'local_server';
  schedulerPaused: boolean;
  businessDiscoveryPriority: 'Priority 1: Mumbai' | 'Priority 2: Maharashtra' | 'Priority 3: India';
  leadRetentionDays: number;
  jobRetentionDays: number;
  logRetentionCount: number;
  applicantSkills: string[];
  applicantDevice: 'Laptop + Mobile Phone';
  autoThrottleAiAtPct: number;
  updatedAt: string;
}

export interface StorageStatus {
  d1Configured: boolean;
  kvConfigured: boolean;
  activeBackend: 'cloudflare_d1_and_kv' | 'local_json_fallback';
  statusLabel: string;
  migrationsFile: string;
  tablesCount: number;
  lastBackupAt?: string | null;
}

export interface SeoAuditIssue {
  id: string;
  severity: 'critical' | 'warning' | 'optimization';
  url: string;
  title: string;
  explanation: string;
  fix: string;
  status: 'open' | 'resolved';
}

export interface PageSpeedMetricResult {
  url: string;
  strategy: 'mobile' | 'desktop';
  source: 'google_pagespeed_api' | 'local_http_audit';
  performanceScore: number | null;
  seoScore: number | null;
  accessibilityScore: number | null;
  bestPracticesScore: number | null;
  lcp?: string;
  cls?: string;
  tbt?: string;
  responseTimeMs?: number;
  checkedAt: string;
  note: string;
}

export type StaticTemplateCategory =
  | 'Restaurants'
  | 'Clinics'
  | 'Schools'
  | 'Coaching Institutes'
  | 'Salons'
  | 'Real Estate'
  | 'Local Shops'
  | 'Consultants'
  | 'Small Businesses';
