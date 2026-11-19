import React, { useState, useMemo } from 'react';
import {
  RemoteJob,
  SavedJob,
  JobApplication,
  JobAlertItem,
  SourceSyncState,
  ApplicationStage,
  JobRiskClassification,
  DeviceCompatibility,
  JobVerificationEvidence,
  JobSuitabilityScore,
} from '../../types';
import {
  Briefcase,
  ShieldAlert,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  RefreshCw,
  Search,
  Sparkles,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Send,
  Laptop,
  Smartphone,
  Globe,
  Bell,
  Plus,
  Filter,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const JOB_CATEGORIES = [
  'All',
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
  'Custom Inspection',
];

const LOCATION_OPTIONS = [
  'All',
  'India',
  'Worldwide / Anywhere',
  'USA',
  'UK',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Netherlands',
  'Singapore',
  'UAE',
  'Europe',
  'Asia',
  'Africa',
  'Latin America',
];

const INDIA_ELIGIBILITY_OPTIONS = [
  'All',
  'Explicitly accepts India applicants',
  'Worldwide applicants',
  'Region restricted',
  'India eligibility unclear',
  'Not eligible for India applicants',
];

const WORK_TYPE_OPTIONS = [
  'All',
  'Fully remote',
  'Hybrid',
  'Freelance',
  'Contract',
  'Part-time',
  'Full-time',
  'Internship',
  'Temporary',
];

const SALARY_BUCKETS = [
  'All',
  'Unpaid / not disclosed',
  'Under $500/month',
  '$500–$1,000/month',
  '$1,000–$2,000/month',
  '$2,000–$5,000/month',
  'Above $5,000/month',
  'Other / non-USD disclosed',
];

const EXPERIENCE_LEVELS = [
  'All',
  'No experience',
  'Entry level',
  'Junior',
  'Mid-level',
  'Senior',
  'Not specified',
];

const APPLICATION_STAGES: ApplicationStage[] = [
  'DISCOVERED',
  'VERIFIED',
  'SHORTLISTED',
  'READY TO APPLY',
  'APPLIED',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
];

interface AugmentedJob extends RemoteJob {
  isSaved?: boolean;
  applicationStage?: string | null;
}

export interface GlobalJobsSummary {
  totalUniqueJobs: number;
  newJobsToday: number;
  indiaEligibleCount: number;
  worldwideCount: number;
  entryLevelCount: number;
  freelanceCount: number;
  partTimeCount: number;
  fullTimeCount: number;
  verifiedCount: number;
  needsReviewCount: number;
  suspiciousOrBlockedCount: number;
  activeSourcesCount: number;
  failedSourcesCount: number;
  lastScanAt: string | null;
  nextScanAt: string | null;
}

interface AdminJobPanelProps {
  mode: 'finder' | 'scam-checker' | 'saved' | 'applications';
  jobs: AugmentedJob[];
  summary?: GlobalJobsSummary | null;
  alerts?: JobAlertItem[];
  savedJobs: SavedJob[];
  applications: JobApplication[];
  officialPortals: { name: string; url: string; note: string }[];
  syncState: SourceSyncState[];
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  onRefresh: () => void;
}

function getRiskBadgeClass(risk: JobRiskClassification): string {
  switch (risk) {
    case 'VERIFIED':
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    case 'NEEDS REVIEW':
      return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    case 'SUSPICIOUS':
      return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
    case 'REJECTED':
      return 'bg-red-500/20 text-red-300 border-red-500/40';
  }
}

function getIndiaBadgeClass(status: string): string {
  if (status === 'Explicitly accepts India applicants') {
    return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  }
  if (status === 'Worldwide applicants') {
    return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
  }
  if (status === 'Not eligible for India applicants') {
    return 'bg-red-500/15 text-red-300 border-red-500/30';
  }
  return 'bg-white/5 text-gray-300 border-white/10';
}

export const AdminJobPanel: React.FC<AdminJobPanelProps> = ({
  mode,
  jobs,
  summary,
  alerts = [],
  savedJobs,
  applications,
  officialPortals,
  syncState,
  authFetch,
  onRefresh,
}) => {
  // Discovery & Sync state
  const [syncing, setSyncing] = useState(false);
  const [syncingSourceId, setSyncingSourceId] = useState<string | null>(null);
  const [syncMsg, setSyncMsg] = useState('');
  const [showSourcesMatrix, setShowSourcesMatrix] = useState(false);
  const [showAlertsDrawer, setShowAlertsDrawer] = useState(false);

  // Add Custom ATS / RSS Source Form
  const [customPlatform, setCustomPlatform] = useState<'greenhouse' | 'lever' | 'ashby' | 'recruitee' | 'custom_rss'>('greenhouse');
  const [customCompany, setCustomCompany] = useState('');
  const [customSlugOrUrl, setCustomSlugOrUrl] = useState('');
  const [addingCustom, setAddingCustom] = useState(false);
  const [customMsg, setCustomMsg] = useState('');

  // Global Multi-Dimensional Filters & Sort
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [indiaFilter, setIndiaFilter] = useState('All');
  const [workTypeFilter, setWorkTypeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [salaryFilter, setSalaryFilter] = useState('All');
  const [experienceFilter, setExperienceFilter] = useState('All');
  const [deviceFilter, setDeviceFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'india_first' | 'matching_score' | 'newest'>('india_first');

  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState('');

  // Manual Scam Checker state
  const [inspectForm, setInspectForm] = useState({
    jobTitle: '',
    employerName: '',
    companyWebsite: '',
    originalPostingUrl: '',
    applicationUrl: '',
    source: 'National Career Service / Official Career Page',
    salaryRange: '',
    countryEligibility: 'India / Remote',
    employmentType: 'Remote Full-time',
    applicationDeadline: '',
    description: '',
  });
  const [inspecting, setInspecting] = useState(false);
  const [inspectError, setInspectError] = useState('');
  const [inspectResult, setInspectResult] = useState<{
    evidence: JobVerificationEvidence;
    suitability: JobSuitabilityScore;
    deviceCompatibility: DeviceCompatibility;
  } | null>(null);

  // Saved Jobs note editor
  const [savedNotesMap, setSavedNotesMap] = useState<Record<string, string>>({});

  // Applications editor state
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [appStageFilter, setAppStageFilter] = useState<string>('All');
  const [appActionError, setAppActionError] = useState('');
  const [assistLoadingId, setAssistLoadingId] = useState<string | null>(null);

  const handleSyncJobs = async (sourceId?: string) => {
    if (sourceId) setSyncingSourceId(sourceId);
    else setSyncing(true);
    setSyncMsg('');
    try {
      const res = await authFetch('/api/jobs/sync', {
        method: 'POST',
        body: JSON.stringify(sourceId ? { sourceId } : {}),
      });
      const data = await res.json();
      if (data.success && data.result) {
        const r = data.result;
        const okSources = (r.sourceSummaries || []).filter((s: any) => s.status === 'ok').length;
        const summaryNote = sourceId
          ? `Source sync complete: evaluated=${r.evaluated}, added=${r.added}, duplicatesMerged=${r.duplicatesSkipped}.`
          : `Global sync across ${okSources} live feeds: evaluated=${r.evaluated}, added=${r.added}, duplicatesMerged=${r.duplicatesSkipped}${
              r.expiredUpdated ? `, expiredMarked=${r.expiredUpdated}` : ''
            }.`;
        setSyncMsg(r.error ? `${summaryNote} Notice: ${r.error}` : summaryNote);
        onRefresh();
      } else {
        setSyncMsg(data.error || 'Could not sync remote job sources.');
      }
    } catch (err: any) {
      setSyncMsg(err.message || 'Network error');
    } finally {
      setSyncing(false);
      setSyncingSourceId(null);
    }
  };

  const handleToggleSource = async (src: SourceSyncState) => {
    setSyncMsg('');
    const res = await authFetch(`/api/jobs/sources/${src.sourceId}`, {
      method: 'PATCH',
      body: JSON.stringify({ enabled: !src.enabled }),
    });
    const data = await res.json();
    if (!res.ok) {
      setSyncMsg(data.error || 'Could not update source state.');
      return;
    }
    onRefresh();
  };

  const handleAddCustomSource = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingCustom(true);
    setCustomMsg('');
    try {
      const res = await authFetch('/api/jobs/sources/custom', {
        method: 'POST',
        body: JSON.stringify({
          platform: customPlatform,
          companyOrLabel: customCompany,
          boardSlugOrUrl: customSlugOrUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCustomMsg(data.error || 'Could not verify source URL.');
      } else {
        setCustomMsg(
          `Connected "${data.source?.sourceName}" cleanly (${data.fetchedCount ?? 0} live jobs inspected).`
        );
        setCustomCompany('');
        setCustomSlugOrUrl('');
        onRefresh();
      }
    } catch (err: any) {
      setCustomMsg(err.message || 'Network error adding source.');
    } finally {
      setAddingCustom(false);
    }
  };

  const handleMarkAlertsRead = async (id?: string) => {
    if (id) {
      await authFetch(`/api/jobs/alerts/${id}/read`, { method: 'POST' });
    } else {
      await authFetch('/api/jobs/alerts/mark-all-read', { method: 'POST' });
    }
    onRefresh();
  };

  const handleToggleSave = async (job: AugmentedJob) => {
    setActionNotice('');
    if (job.isSaved) {
      await authFetch(`/api/jobs/${job.id}/save`, { method: 'DELETE' });
    } else {
      await authFetch(`/api/jobs/${job.id}/save`, {
        method: 'POST',
        body: JSON.stringify({ personalNotes: '' }),
      });
    }
    onRefresh();
  };

  const handleAddToApplications = async (job: RemoteJob) => {
    setActionNotice('');
    const res = await authFetch('/api/applications', {
      method: 'POST',
      body: JSON.stringify({ jobId: job.id }),
    });
    const data = await res.json();
    if (!res.ok) {
      setActionNotice(data.error || 'Unable to track application');
      return;
    }
    setActionNotice(`Added "${job.jobTitle}" to Application Tracker.`);
    onRefresh();
  };

  const handleInspectListing = async (saveToDb: boolean) => {
    setInspecting(true);
    setInspectError('');
    setInspectResult(null);
    try {
      const res = await authFetch('/api/jobs/inspect', {
        method: 'POST',
        body: JSON.stringify({
          ...inspectForm,
          applicationDeadline: inspectForm.applicationDeadline || undefined,
          saveToDb,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setInspectError(data.error || 'Validation failed');
      } else if (saveToDb && data.job) {
        setInspectResult({
          evidence: data.job.evidence,
          suitability: data.job.suitability,
          deviceCompatibility: data.job.deviceCompatibility,
        });
        onRefresh();
      } else {
        setInspectResult({
          evidence: data.evidence,
          suitability: data.suitability,
          deviceCompatibility: data.deviceCompatibility,
        });
      }
    } catch (err: any) {
      setInspectError(err.message || 'Request failed');
    } finally {
      setInspecting(false);
    }
  };

  const handleUpdateSavedNote = async (jobId: string, notes: string) => {
    await authFetch(`/api/jobs/${jobId}/save`, {
      method: 'POST',
      body: JSON.stringify({ personalNotes: notes }),
    });
    onRefresh();
  };

  const handleUpdateApplication = async (appId: string, updates: Partial<JobApplication>) => {
    setAppActionError('');
    const res = await authFetch(`/api/applications/${appId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) {
      setAppActionError(data.error || 'Failed to update application');
      return;
    }
    onRefresh();
  };

  const handleGenerateAssist = async (appId: string) => {
    setAssistLoadingId(appId);
    setAppActionError('');
    try {
      const res = await authFetch(`/api/applications/${appId}/assist`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setAppActionError(data.error || 'Could not refresh draft');
      } else {
        onRefresh();
      }
    } finally {
      setAssistLoadingId(null);
    }
  };

  const handleDownloadCsv = async (endpoint: string, filename: string) => {
    const res = await authFetch(endpoint);
    if (!res.ok) return;
    const text = await res.text();
    const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAllFilters = () => {
    setSearch('');
    setLocationFilter('All');
    setIndiaFilter('All');
    setWorkTypeFilter('All');
    setCategoryFilter('All');
    setSalaryFilter('All');
    setExperienceFilter('All');
    setDeviceFilter('All');
    setRiskFilter('All');
    setSourceFilter('All');
  };

  const availableSourceNames = useMemo(() => {
    const set = new Set<string>();
    for (const s of syncState) {
      if (s.integrationStatus === 'connected_active') {
        set.add(s.sourceName.replace(/\s+(Official|Public).*$/i, '').trim());
      }
    }
    for (const j of jobs) {
      j.discoveredSources?.forEach((ds) => set.add(ds.sourceName));
    }
    return ['All', ...Array.from(set)];
  }, [jobs, syncState]);

  const filteredJobs = useMemo(() => {
    const q = search.toLowerCase().trim();
    const list = jobs.filter((j) => {
      if (
        q &&
        !j.jobTitle.toLowerCase().includes(q) &&
        !j.employerName.toLowerCase().includes(q) &&
        !j.category.toLowerCase().includes(q) &&
        !j.countryEligibility.toLowerCase().includes(q) &&
        !j.description.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (
        locationFilter !== 'All' &&
        j.locationCountryBucket !== locationFilter &&
        !j.countryEligibility.toLowerCase().includes(locationFilter.toLowerCase())
      ) {
        return false;
      }
      if (indiaFilter !== 'All' && j.indiaEligibility !== indiaFilter) {
        return false;
      }
      if (workTypeFilter !== 'All') {
        if (workTypeFilter === 'Fully remote') {
          if (j.workType !== 'Fully remote' && !j.remoteStatus.toLowerCase().includes('100% remote')) {
            return false;
          }
        } else if (j.workType !== workTypeFilter) {
          return false;
        }
      }
      if (categoryFilter !== 'All' && j.category !== categoryFilter) return false;
      if (salaryFilter !== 'All' && j.salaryBucket !== salaryFilter) return false;
      if (experienceFilter !== 'All' && j.experienceLevel !== experienceFilter) return false;
      if (deviceFilter !== 'All' && j.deviceCompatibility !== deviceFilter) return false;
      if (riskFilter !== 'All' && j.riskClassification !== riskFilter) return false;
      if (
        sourceFilter !== 'All' &&
        !j.source.toLowerCase().includes(sourceFilter.toLowerCase()) &&
        !j.discoveredSources?.some((ds) => ds.sourceName.toLowerCase().includes(sourceFilter.toLowerCase()))
      ) {
        return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
      if (sortBy === 'matching_score') {
        return b.suitability.totalScore - a.suitability.totalScore;
      }
      const rank = (status: string) =>
        status === 'Explicitly accepts India applicants'
          ? 4
          : status === 'Worldwide applicants'
          ? 3
          : status === 'India eligibility unclear'
          ? 2
          : 1;
      const rDiff = rank(b.indiaEligibility) - rank(a.indiaEligibility);
      if (rDiff !== 0) return rDiff;
      return b.suitability.totalScore - a.suitability.totalScore;
    });
  }, [
    jobs,
    search,
    locationFilter,
    indiaFilter,
    workTypeFilter,
    categoryFilter,
    salaryFilter,
    experienceFilter,
    deviceFilter,
    riskFilter,
    sourceFilter,
    sortBy,
  ]);

  const unreadAlerts = alerts.filter((a) => !a.read);
  const filteredApps = applications.filter(
    (a) => appStageFilter === 'All' || a.stage === appStageFilter
  );
  const selectedApp = applications.find((a) => a.id === selectedAppId) || null;

  // Compute safe fallback KPIs if summary omitted
  const kpi: GlobalJobsSummary = summary || {
    totalUniqueJobs: jobs.length,
    newJobsToday: 0,
    indiaEligibleCount: jobs.filter((j) => j.indiaEligibility === 'Explicitly accepts India applicants').length,
    worldwideCount: jobs.filter((j) => j.indiaEligibility === 'Worldwide applicants').length,
    entryLevelCount: jobs.filter((j) => j.experienceLevel === 'No experience' || j.experienceLevel === 'Entry level').length,
    freelanceCount: jobs.filter((j) => j.workType === 'Freelance' || j.workType === 'Contract').length,
    partTimeCount: jobs.filter((j) => j.workType === 'Part-time').length,
    fullTimeCount: jobs.filter((j) => j.workType === 'Full-time').length,
    verifiedCount: jobs.filter((j) => j.riskClassification === 'VERIFIED').length,
    needsReviewCount: jobs.filter((j) => j.riskClassification === 'NEEDS REVIEW').length,
    suspiciousOrBlockedCount: jobs.filter((j) => j.riskClassification === 'SUSPICIOUS' || j.riskClassification === 'REJECTED').length,
    activeSourcesCount: syncState.filter((s) => s.enabled && s.integrationStatus === 'connected_active').length,
    failedSourcesCount: syncState.filter((s) => s.lastStatus === 'error' || s.lastStatus === 'blocked').length,
    lastScanAt: null,
    nextScanAt: null,
  };

  // =========================================================================
  // VIEW 1: GLOBAL REMOTE JOB HUNTER
  // =========================================================================
  if (mode === 'finder') {
    const kpiCards = [
      { label: 'Unique Jobs', value: kpi.totalUniqueJobs, tone: 'text-white' },
      { label: 'New Today', value: kpi.newJobsToday, tone: 'text-[#B68AFF]' },
      { label: 'India-Eligible', value: kpi.indiaEligibleCount, tone: 'text-emerald-400' },
      { label: 'Worldwide', value: kpi.worldwideCount, tone: 'text-sky-400' },
      { label: 'Entry / No Exp', value: kpi.entryLevelCount, tone: 'text-gray-200' },
      { label: 'Freelance / Contract', value: kpi.freelanceCount, tone: 'text-gray-200' },
      { label: 'Part-Time', value: kpi.partTimeCount, tone: 'text-gray-200' },
      { label: 'Full-Time', value: kpi.fullTimeCount, tone: 'text-gray-200' },
      { label: 'Verified', value: kpi.verifiedCount, tone: 'text-emerald-400' },
      { label: 'Needs Review', value: kpi.needsReviewCount, tone: 'text-amber-300' },
      { label: 'Suspicious / Blocked', value: kpi.suspiciousOrBlockedCount, tone: 'text-red-400' },
      { label: 'Active Sources', value: kpi.activeSourcesCount, tone: 'text-emerald-400' },
      { label: 'Failed / Blocked Src', value: kpi.failedSourcesCount, tone: kpi.failedSourcesCount > 0 ? 'text-amber-400' : 'text-gray-400' },
    ];

    return (
      <div className="space-y-5">
        {/* Header + Controls */}
        <div className="p-5 rounded-xl bg-[#0e0e14] border border-white/10 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-display font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                <Globe className="w-4 h-4 text-[#B68AFF]" />
                <span>GLOBAL REMOTE JOB HUNTER</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Real multi-source aggregator across Remote OK, Remotive, We Work Remotely, Jobicy, Himalayas, Working Nomads, Arbeitnow &amp; configurable public ATS boards. Prioritizes India-eligible &amp; worldwide listings with strict fraud inspection.
              </p>
              <div className="flex flex-wrap gap-4 mt-1.5 text-[11px] text-gray-400 tabular-nums">
                <span>
                  Last scan:{' '}
                  <strong className="text-gray-200">
                    {kpi.lastScanAt ? new Date(kpi.lastScanAt).toLocaleString() : 'Not yet scanned'}
                  </strong>
                </span>
                <span>
                  Next scan:{' '}
                  <strong className="text-gray-200">
                    {kpi.nextScanAt ? new Date(kpi.nextScanAt).toLocaleTimeString() : 'Scheduler Paused'}
                  </strong>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => setShowAlertsDrawer(!showAlertsDrawer)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white cursor-pointer"
              >
                <Bell className={`w-3.5 h-3.5 ${unreadAlerts.length > 0 ? 'text-[#B68AFF]' : 'text-gray-400'}`} />
                <span>Alerts ({unreadAlerts.length})</span>
              </button>

              <button
                onClick={() => setShowSourcesMatrix(!showSourcesMatrix)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white cursor-pointer"
              >
                <span>Sources ({syncState.length})</span>
                {showSourcesMatrix ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => handleDownloadCsv('/api/jobs/export/csv', 'victorix_global_remote_jobs.csv')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>

              <button
                onClick={() => handleSyncJobs()}
                disabled={syncing}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#8B45FF] hover:bg-[#7830ee] disabled:opacity-50 text-white text-xs font-semibold whitespace-nowrap cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Scanning Global Feeds...' : 'Sync All Global Sources'}</span>
              </button>
            </div>
          </div>

          {syncMsg && (
            <div className="p-3 rounded-lg bg-[#050505] border border-[#8B45FF]/35 text-xs text-gray-200">
              {syncMsg}
            </div>
          )}

          {/* 15 KPI Summary Strip */}
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 xl:grid-cols-13 gap-2 pt-1">
            {kpiCards.map((c) => (
              <div key={c.label} className="p-2.5 rounded-lg bg-[#050505] border border-white/5 text-center">
                <p className={`text-base font-display font-bold tabular-nums ${c.tone}`}>{c.value}</p>
                <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{c.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Unread Job Alerts Tray */}
        {showAlertsDrawer && (
          <div className="p-4 rounded-xl bg-[#0e0e14] border border-[#8B45FF]/30 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-display font-bold text-white flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-[#B68AFF]" />
                <span>Job Alerts ({alerts.length} recent · {unreadAlerts.length} unread)</span>
              </h3>
              {unreadAlerts.length > 0 && (
                <button
                  onClick={() => handleMarkAlertsRead()}
                  className="text-[11px] text-[#B68AFF] hover:underline cursor-pointer"
                >
                  Mark All Read
                </button>
              )}
            </div>
            {alerts.length === 0 ? (
              <p className="text-xs text-gray-400">No job alerts triggered yet. Sync global sources to trigger India-eligible &amp; high-match alerts.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {alerts.map((al) => (
                  <div
                    key={al.id}
                    className={`p-3 rounded-lg border text-xs flex items-start justify-between gap-2 ${
                      al.read ? 'bg-[#050505] border-white/5 opacity-70' : 'bg-[#8B45FF]/10 border-[#8B45FF]/35'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#B68AFF]">
                        {al.alertType.replace('_', ' ')} · Match {al.matchScore}/100
                      </span>
                      <p className="font-semibold text-white">{al.title}</p>
                      <p className="text-[11px] text-gray-400">
                        {al.employerName} · {al.countryEligibility}
                      </p>
                    </div>
                    {!al.read && (
                      <button
                        onClick={() => handleMarkAlertsRead(al.id)}
                        className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-[10px] text-white shrink-0 cursor-pointer"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Job Sources Compliance Matrix & Custom ATS / RSS Connector */}
        {showSourcesMatrix && (
          <div className="p-5 rounded-xl bg-[#0e0e14] border border-white/10 space-y-5">
            <div>
              <h3 className="text-sm font-display font-bold text-white">
                Permitted Job Sources Matrix &amp; ATS Connectors
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Respects source rate limits, refresh intervals, and attribution rules. Portals without public APIs provide official search URLs only (zero prohibited scraping).
              </p>
            </div>

            {/* Add Public ATS Board or Custom RSS Feed */}
            <form onSubmit={handleAddCustomSource} className="p-3.5 rounded-lg bg-[#050505] border border-white/10 space-y-3">
              <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-[#B68AFF]" />
                <span>Connect Public Employer Career Board (Greenhouse / Lever / Ashby / Recruitee) or Custom RSS Feed</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                <select
                  value={customPlatform}
                  onChange={(e) => setCustomPlatform(e.target.value as any)}
                  className="bg-[#0e0e14] border border-white/10 rounded-lg px-2.5 py-2 text-white"
                >
                  <option value="greenhouse">Greenhouse Public Board</option>
                  <option value="lever">Lever Public Postings</option>
                  <option value="ashby">Ashby Public Board</option>
                  <option value="recruitee">Recruitee Offers API</option>
                  <option value="custom_rss">Custom Permitted RSS URL</option>
                </select>
                <input
                  type="text"
                  required
                  placeholder="Company / Feed Label (e.g. GitLab)"
                  value={customCompany}
                  onChange={(e) => setCustomCompany(e.target.value)}
                  className="bg-[#0e0e14] border border-white/10 rounded-lg px-3 py-2 text-white"
                />
                <input
                  type="text"
                  required
                  placeholder={customPlatform === 'custom_rss' ? 'https://example.com/jobs.rss' : 'Board slug (e.g. gitlab or vercel)'}
                  value={customSlugOrUrl}
                  onChange={(e) => setCustomSlugOrUrl(e.target.value)}
                  className="bg-[#0e0e14] border border-white/10 rounded-lg px-3 py-2 text-white"
                />
                <button
                  type="submit"
                  disabled={addingCustom}
                  className="px-3 py-2 rounded-lg bg-[#8B45FF] hover:bg-[#7830ee] disabled:opacity-50 text-white font-semibold cursor-pointer"
                >
                  {addingCustom ? 'Testing Feed...' : 'Test & Connect Source'}
                </button>
              </div>
              {customMsg && <p className="text-[11px] text-[#B68AFF]">{customMsg}</p>}
            </form>

            {/* Sources Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400">
                    <th className="py-2 px-2">Source Name</th>
                    <th className="py-2 px-2">Type</th>
                    <th className="py-2 px-2">Status / Health</th>
                    <th className="py-2 px-2">Interval &amp; Quota</th>
                    <th className="py-2 px-2">Last / Next Sync</th>
                    <th className="py-2 px-2">Attribution</th>
                    <th className="py-2 px-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[11px]">
                  {syncState.map((s) => (
                    <tr key={s.sourceId}>
                      <td className="py-2.5 px-2 font-semibold text-white">
                        {s.sourceName}
                        {s.lastError && <p className="text-[10px] text-amber-300 font-normal mt-0.5">{s.lastError}</p>}
                      </td>
                      <td className="py-2.5 px-2 text-gray-300">{s.integrationType}</td>
                      <td className="py-2.5 px-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            s.integrationStatus === 'connected_active'
                              ? 'bg-emerald-500/15 text-emerald-300'
                              : s.integrationStatus === 'search_portal_only'
                              ? 'bg-sky-500/15 text-sky-300'
                              : s.integrationStatus === 'configurable_ready'
                              ? 'bg-white/10 text-gray-300'
                              : 'bg-red-500/15 text-red-300'
                          }`}
                        >
                          {s.integrationStatus.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-gray-300 tabular-nums">
                        {s.minIntervalMinutes}m · {s.requestsToday}/{s.dailyLimit}
                      </td>
                      <td className="py-2.5 px-2 text-gray-400 tabular-nums">
                        <div>Last: {s.lastSyncedAt ? new Date(s.lastSyncedAt).toLocaleTimeString() : 'Never'}</div>
                        {s.nextPermittedSyncAt && (
                          <div>Next: {new Date(s.nextPermittedSyncAt).toLocaleTimeString()}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-gray-400 max-w-[180px] truncate" title={s.attributionRequirement}>
                        {s.attributionRequirement}
                      </td>
                      <td className="py-2.5 px-2 text-right space-x-1.5 whitespace-nowrap">
                        {s.integrationStatus === 'search_portal_only' ? (
                          <a
                            href={s.configUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-[#B68AFF]"
                          >
                            <span>Search</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <>
                            {s.integrationStatus !== 'configurable_ready' && (
                              <button
                                onClick={() => handleSyncJobs(s.sourceId)}
                                disabled={syncingSourceId === s.sourceId || !s.enabled}
                                className="px-2.5 py-1 rounded bg-[#8B45FF]/25 hover:bg-[#8B45FF]/40 disabled:opacity-40 text-white cursor-pointer"
                              >
                                {syncingSourceId === s.sourceId ? 'Syncing...' : 'Sync'}
                              </button>
                            )}
                            <button
                              onClick={() => handleToggleSource(s)}
                              className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 cursor-pointer"
                            >
                              {s.enabled ? 'Disable' : 'Enable'}
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Official Search Portals Strip (NCS, LinkedIn, Indeed, Glassdoor, Wellfound) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {officialPortals.map((p, idx) => (
            <a
              key={idx}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-[#0e0e14] border border-white/10 hover:border-[#8B45FF]/40 flex items-center justify-between gap-2 transition-colors"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{p.name}</p>
                <p className="text-[10px] text-gray-400 truncate">{p.note}</p>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[#B68AFF] shrink-0" />
            </a>
          ))}
        </div>

        {/* Comprehensive Global Filters Bar */}
        <div className="p-4 rounded-xl bg-[#0e0e14] border border-white/10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#B68AFF]" />
              <span>Global Multi-Filter Discovery ({filteredJobs.length} matching of {jobs.length})</span>
            </span>
            <button
              onClick={clearAllFilters}
              className="text-[11px] text-gray-400 hover:text-white underline cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-2.5 text-xs">
            <div className="relative sm:col-span-2">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search title, employer, skill, country..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#050505] border border-white/10 rounded-lg pl-8 pr-3 py-2 text-white"
              />
            </div>

            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              aria-label="Filter by Country or Region"
              className="bg-[#050505] border border-white/10 rounded-lg px-2.5 py-2 text-white"
            >
              {LOCATION_OPTIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc === 'All' ? 'Region: All Countries' : loc}
                </option>
              ))}
            </select>

            <select
              value={indiaFilter}
              onChange={(e) => setIndiaFilter(e.target.value)}
              aria-label="Filter by India Eligibility"
              className="bg-[#050505] border border-white/10 rounded-lg px-2.5 py-2 text-white"
            >
              {INDIA_ELIGIBILITY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === 'All' ? 'India Elig: All' : opt}
                </option>
              ))}
            </select>

            <select
              value={workTypeFilter}
              onChange={(e) => setWorkTypeFilter(e.target.value)}
              aria-label="Filter by Work Type"
              className="bg-[#050505] border border-white/10 rounded-lg px-2.5 py-2 text-white"
            >
              {WORK_TYPE_OPTIONS.map((wt) => (
                <option key={wt} value={wt}>
                  {wt === 'All' ? 'Work Type: All' : wt}
                </option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by Category"
              className="bg-[#050505] border border-white/10 rounded-lg px-2.5 py-2 text-white"
            >
              {JOB_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'Category: All 22 Roles' : c}
                </option>
              ))}
            </select>

            <select
              value={salaryFilter}
              onChange={(e) => setSalaryFilter(e.target.value)}
              aria-label="Filter by Salary Range"
              className="bg-[#050505] border border-white/10 rounded-lg px-2.5 py-2 text-white"
            >
              {SALARY_BUCKETS.map((sb) => (
                <option key={sb} value={sb}>
                  {sb === 'All' ? 'Salary: All Brackets' : sb}
                </option>
              ))}
            </select>

            <select
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
              aria-label="Filter by Experience Level"
              className="bg-[#050505] border border-white/10 rounded-lg px-2.5 py-2 text-white"
            >
              {EXPERIENCE_LEVELS.map((ex) => (
                <option key={ex} value={ex}>
                  {ex === 'All' ? 'Experience: All' : ex}
                </option>
              ))}
            </select>

            <select
              value={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value)}
              aria-label="Filter by Device Compatibility"
              className="bg-[#050505] border border-white/10 rounded-lg px-2.5 py-2 text-white"
            >
              <option value="All">Device: All</option>
              <option value="Both supported">Both supported</option>
              <option value="Mobile friendly">Mobile friendly</option>
              <option value="Laptop preferred">Laptop preferred</option>
              <option value="Laptop required">Laptop required</option>
              <option value="Not specified">Not specified</option>
            </select>

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              aria-label="Filter by Scam Risk"
              className="bg-[#050505] border border-white/10 rounded-lg px-2.5 py-2 text-white"
            >
              <option value="All">Scam Risk: All</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="NEEDS REVIEW">NEEDS REVIEW</option>
              <option value="SUSPICIOUS">SUSPICIOUS</option>
              <option value="REJECTED">REJECTED</option>
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              aria-label="Filter by Source"
              className="bg-[#050505] border border-white/10 rounded-lg px-2.5 py-2 text-white"
            >
              {availableSourceNames.map((sn) => (
                <option key={sn} value={sn}>
                  {sn === 'All' ? 'Source: All Feeds' : sn}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort Jobs"
              className="bg-[#050505] border border-[#8B45FF]/30 rounded-lg px-2.5 py-2 text-[#B68AFF] font-semibold"
            >
              <option value="india_first">Sort: India Eligibility First</option>
              <option value="matching_score">Sort: Highest Match Score</option>
              <option value="newest">Sort: Newest Published</option>
            </select>
          </div>
        </div>

        {actionNotice && (
          <div className="p-3 rounded-lg bg-[#8B45FF]/15 border border-[#8B45FF]/40 text-xs text-white">
            {actionNotice}
          </div>
        )}

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <div className="p-10 text-center rounded-xl bg-[#0e0e14] border border-dashed border-white/10 space-y-2">
            <Briefcase className="w-6 h-6 text-gray-500 mx-auto" />
            <p className="text-xs font-semibold text-gray-300">No remote jobs currently match active filters.</p>
            <p className="text-[11px] text-gray-400">
              Click &ldquo;Sync All Global Sources&rdquo; above to fetch real listings from Remote OK, Remotive, We Work Remotely, Jobicy, Himalayas, Working Nomads, and Arbeitnow, or reset filters.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredJobs.map((job) => {
              const isExpanded = expandedJobId === job.id;
              return (
                <div
                  key={job.id}
                  className="p-4 rounded-xl bg-[#0e0e14] border border-white/10 hover:border-white/20 space-y-3"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${getRiskBadgeClass(
                            job.riskClassification
                          )}`}
                        >
                          {job.riskClassification}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${getIndiaBadgeClass(
                            job.indiaEligibility
                          )}`}
                        >
                          {job.indiaEligibility}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-gray-300 font-medium">
                          {job.category}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-gray-300">
                          {job.workType} · {job.experienceLevel}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#8B45FF]/15 text-[#B68AFF] text-[10px] font-mono tabular-nums">
                          Match: {job.suitability.totalScore}/100
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 text-[10px] text-gray-300">
                          {job.deviceCompatibility.includes('Mobile') || job.deviceCompatibility === 'Both supported' ? (
                            <Smartphone className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Laptop className="w-3 h-3 text-gray-400" />
                          )}
                          {job.deviceCompatibility}
                        </span>
                      </div>

                      <h3 className="text-sm font-display font-bold text-white">{job.jobTitle}</h3>
                      <p className="text-xs text-gray-400">
                        <strong className="text-gray-200">{job.employerName}</strong> · Region:{' '}
                        <span className="text-gray-200">{job.countryEligibility}</span> · Compensation:{' '}
                        <span className="text-gray-200">{job.salaryRange || job.salaryBucket}</span>
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
                        <span>Published: {new Date(job.publishedAt).toLocaleDateString()}</span>
                        <span>· Checked: {new Date(job.lastCheckedAt).toLocaleDateString()}</span>
                        {job.discoveredSources?.map((ds, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-white/5 text-gray-300 text-[10px]">
                            Source: {ds.sourceName}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-gray-200 cursor-pointer"
                      >
                        {isExpanded ? 'Hide Analysis' : 'Scam & Match Info'}
                      </button>

                      <button
                        onClick={() => handleToggleSave(job)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                          job.isSaved
                            ? 'bg-[#8B45FF]/25 text-[#B68AFF] border border-[#8B45FF]/40'
                            : 'bg-white/5 hover:bg-white/10 text-gray-300'
                        }`}
                      >
                        {job.isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                        <span>{job.isSaved ? 'Saved' : 'Save'}</span>
                      </button>

                      {job.riskClassification === 'REJECTED' || job.isExpired ? (
                        <span className="px-3 py-1.5 rounded-lg bg-red-950/50 border border-red-500/30 text-[11px] font-semibold text-red-300">
                          Blocked (Scam/Expired)
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAddToApplications(job)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer"
                        >
                          <Send className="w-3 h-3" />
                          <span>{job.applicationStage ? `Tracked (${job.applicationStage})` : 'Track'}</span>
                        </button>
                      )}

                      <a
                        href={job.applicationUrl || job.originalPostingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#8B45FF] hover:bg-[#7830ee] text-xs font-semibold text-white"
                      >
                        <span>Apply</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-3.5 rounded-xl bg-[#050505] border border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-white">Verification Evidence ({job.riskClassification})</p>
                          <a
                            href={job.originalPostingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-[#B68AFF] hover:underline inline-flex items-center gap-1"
                          >
                            <span>Original Listing</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <p className="text-gray-400">{job.evidence.explanation}</p>
                        {job.evidence.paymentScamSignals.length > 0 && (
                          <ul className="space-y-1 text-red-300">
                            {job.evidence.paymentScamSignals.map((s, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        {job.evidence.positiveEvidence.length > 0 && (
                          <ul className="space-y-1 text-emerald-300">
                            {job.evidence.positiveEvidence.map((e, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                <span>{e}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        {job.evidence.riskFlags.length > 0 && (
                          <ul className="space-y-1 text-amber-300">
                            {job.evidence.riskFlags.map((f, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="space-y-2">
                        <p className="font-semibold text-white tabular-nums">
                          Separate 7-Factor Matching Score: {job.suitability.totalScore}/100
                        </p>
                        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                          {job.suitability.factors.map((f, idx) => (
                            <div key={idx} className="p-2 rounded bg-[#0e0e14] border border-white/5">
                              <div className="flex justify-between text-white font-medium tabular-nums">
                                <span>{f.label}</span>
                                <span>
                                  {f.score}/{f.max}
                                </span>
                              </div>
                              <p className="text-gray-400 text-[10px] mt-0.5 truncate" title={f.note}>
                                {f.note}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: JOB SCAM CHECKER
  // =========================================================================
  if (mode === 'scam-checker') {
    return (
      <div className="space-y-6">
        <div className="p-5 rounded-xl bg-[#0e0e14] border border-white/10 space-y-4">
          <div>
            <h2 className="text-base font-display font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#B68AFF]" />
              <span>Evidence-Based Job Scam &amp; Credibility Engine</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Paste any remote job post (e.g., from National Career Service, LinkedIn, Indeed, Glassdoor, Wellfound, or WhatsApp) to detect upfront fees, OTP/bank credential traps, domain mismatches, expiration, and calculate Matching Score independently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <input
              type="text"
              placeholder="Job Title * (e.g. Junior React Developer)"
              value={inspectForm.jobTitle}
              onChange={(e) => setInspectForm({ ...inspectForm, jobTitle: e.target.value })}
              className="bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-white"
            />
            <input
              type="text"
              placeholder="Employer / Company Name *"
              value={inspectForm.employerName}
              onChange={(e) => setInspectForm({ ...inspectForm, employerName: e.target.value })}
              className="bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-white"
            />
            <input
              type="url"
              placeholder="Original Posting URL * (https://...)"
              value={inspectForm.originalPostingUrl}
              onChange={(e) => setInspectForm({ ...inspectForm, originalPostingUrl: e.target.value })}
              className="bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-white"
            />
            <input
              type="url"
              placeholder="Company Official Website (optional, for domain match)"
              value={inspectForm.companyWebsite}
              onChange={(e) => setInspectForm({ ...inspectForm, companyWebsite: e.target.value })}
              className="bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-white"
            />
            <input
              type="text"
              placeholder="Salary Range (optional, e.g. $1,200/month or ₹25,000/month)"
              value={inspectForm.salaryRange}
              onChange={(e) => setInspectForm({ ...inspectForm, salaryRange: e.target.value })}
              className="bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-white"
            />
            <input
              type="text"
              placeholder="Country / Remote Eligibility (e.g. India / Remote or Worldwide)"
              value={inspectForm.countryEligibility}
              onChange={(e) => setInspectForm({ ...inspectForm, countryEligibility: e.target.value })}
              className="bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-white"
            />
            <input
              type="text"
              placeholder="Work Type (e.g. Remote Full-time, Freelance, Internship)"
              value={inspectForm.employmentType}
              onChange={(e) => setInspectForm({ ...inspectForm, employmentType: e.target.value })}
              className="bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-white"
            />
            <input
              type="date"
              aria-label="Application Deadline (optional)"
              value={inspectForm.applicationDeadline}
              onChange={(e) => setInspectForm({ ...inspectForm, applicationDeadline: e.target.value })}
              className="bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <textarea
            rows={5}
            placeholder="Paste the complete job description, recruiter instructions, payment terms, or interview message here... *"
            value={inspectForm.description}
            onChange={(e) => setInspectForm({ ...inspectForm, description: e.target.value })}
            className="w-full bg-[#050505] border border-white/10 rounded-lg p-3 text-xs text-white"
          />

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleInspectListing(false)}
              disabled={inspecting || !inspectForm.jobTitle || !inspectForm.employerName || !inspectForm.description || !inspectForm.originalPostingUrl}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 text-xs font-semibold text-white cursor-pointer"
            >
              {inspecting ? 'Analyzing...' : 'Inspect Listing'}
            </button>
            <button
              onClick={() => handleInspectListing(true)}
              disabled={inspecting || !inspectForm.jobTitle || !inspectForm.employerName || !inspectForm.description || !inspectForm.originalPostingUrl}
              className="px-4 py-2 rounded-lg bg-[#8B45FF] hover:bg-[#7830ee] disabled:opacity-40 text-xs font-semibold text-white cursor-pointer"
            >
              Inspect &amp; Save to Job Database
            </button>
          </div>

          {inspectError && (
            <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/30 text-xs text-red-300">
              {inspectError}
            </div>
          )}

          {inspectResult && (
            <div className="p-4 rounded-xl bg-[#050505] border border-white/15 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded border text-xs font-bold ${getRiskBadgeClass(
                      inspectResult.evidence.classification
                    )}`}
                  >
                    VERDICT: {inspectResult.evidence.classification}
                  </span>
                  <span className="text-xs text-gray-300">
                    Device: <strong>{inspectResult.deviceCompatibility}</strong>
                  </span>
                </div>
                <div className="text-xs font-mono tabular-nums text-[#B68AFF]">
                  Matching Score: {inspectResult.suitability.totalScore}/100 (Strictly Separate)
                </div>
              </div>

              <p className="text-xs text-gray-300">{inspectResult.evidence.explanation}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  {inspectResult.evidence.paymentScamSignals.length > 0 && (
                    <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-200 space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <XCircle className="w-4 h-4" /> Critical Payment / Credential Scam Signals:
                      </p>
                      <ul className="list-disc pl-4">
                        {inspectResult.evidence.paymentScamSignals.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {inspectResult.evidence.riskFlags.length > 0 && (
                    <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-200 space-y-1">
                      <p className="font-bold">Risk Flags Detected:</p>
                      <ul className="list-disc pl-4">
                        {inspectResult.evidence.riskFlags.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {inspectResult.evidence.positiveEvidence.length > 0 && (
                    <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-emerald-200 space-y-1">
                      <p className="font-bold">Positive Verification Evidence:</p>
                      <ul className="list-disc pl-4">
                        {inspectResult.evidence.positiveEvidence.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="font-semibold text-white">Matching Score Factors (0–100)</p>
                  {inspectResult.suitability.factors.map((f, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-[#0e0e14] border border-white/5">
                      <div className="flex justify-between text-white font-medium tabular-nums">
                        <span>{f.label}</span>
                        <span>
                          {f.score}/{f.max}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400">{f.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: SAVED JOBS
  // =========================================================================
  if (mode === 'saved') {
    return (
      <div className="space-y-4">
        <div className="p-5 rounded-xl bg-[#0e0e14] border border-white/10">
          <h2 className="text-base font-display font-bold text-white">Saved Remote Jobs ({savedJobs.length})</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Personal shortlist with private notes. Move qualified non-rejected opportunities into Application Tracker when ready.
          </p>
        </div>

        {savedJobs.length === 0 ? (
          <div className="p-10 text-center rounded-xl bg-[#0e0e14] border border-dashed border-white/10 text-xs text-gray-400">
            No saved remote jobs yet. Click &ldquo;Save&rdquo; on any job in Global Remote Job Hunter.
          </div>
        ) : (
          <div className="space-y-3">
            {savedJobs.map((item) => {
              const job = item.job;
              if (!job) return null;
              const noteVal = savedNotesMap[job.id] ?? item.personalNotes;
              return (
                <div key={item.id} className="p-4 rounded-xl bg-[#0e0e14] border border-white/10 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getRiskBadgeClass(job.riskClassification)}`}>
                          {job.riskClassification}
                        </span>
                        <span className="text-[11px] text-[#B68AFF] font-mono tabular-nums">
                          Match: {job.suitability.totalScore}/100
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white">{job.jobTitle}</h3>
                      <p className="text-xs text-gray-400">
                        {job.employerName} · {job.countryEligibility} · Saved {new Date(item.savedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={job.applicationUrl || job.originalPostingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#B68AFF] inline-flex items-center gap-1"
                      >
                        <span>Apply</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      {job.riskClassification !== 'REJECTED' && !job.isExpired && (
                        <button
                          onClick={() => handleAddToApplications(job)}
                          className="px-3 py-1.5 rounded-lg bg-[#8B45FF] text-white text-xs font-semibold cursor-pointer"
                        >
                          Move to Tracker
                        </button>
                      )}
                      <button
                        onClick={() =>
                          authFetch(`/api/jobs/${job.id}/save`, { method: 'DELETE' }).then(() => onRefresh())
                        }
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-xs text-gray-300 hover:text-red-300 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Personal notes..."
                      value={noteVal}
                      onChange={(e) => setSavedNotesMap({ ...savedNotesMap, [job.id]: e.target.value })}
                      className="flex-1 bg-[#050505] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                    <button
                      onClick={() => handleUpdateSavedNote(job.id, noteVal)}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white cursor-pointer"
                    >
                      Save Note
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 4: APPLICATION TRACKER
  // =========================================================================
  return (
    <div className="space-y-6">
      <div className="p-5 rounded-xl bg-[#0e0e14] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-display font-bold text-white">
            Personal Remote Job Application Tracker ({applications.length})
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Explicit user approval is mandatory before marking any application as APPLIED. Never auto-submits applications.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={appStageFilter}
            onChange={(e) => setAppStageFilter(e.target.value)}
            className="bg-[#050505] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
          >
            <option value="All">All Stages</option>
            {APPLICATION_STAGES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
          <button
            onClick={() => handleDownloadCsv('/api/applications/export/csv', 'victorix_job_applications.csv')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {appActionError && (
        <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200">
          {appActionError}
        </div>
      )}

      {filteredApps.length === 0 ? (
        <div className="p-10 text-center rounded-xl bg-[#0e0e14] border border-dashed border-white/10 text-xs text-gray-400">
          No tracked applications yet. Shortlist a verified remote job in Global Remote Job Hunter first.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Applications List */}
          <div className="lg:col-span-5 space-y-2.5">
            {filteredApps.map((appItem) => (
              <button
                key={appItem.id}
                onClick={() => setSelectedAppId(appItem.id)}
                className={`w-full text-left p-4 rounded-xl border transition-colors cursor-pointer ${
                  selectedApp?.id === appItem.id
                    ? 'bg-[#8B45FF]/15 border-[#8B45FF]'
                    : 'bg-[#0e0e14] border-white/10 hover:border-white/25'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-bold text-white">
                    {appItem.stage}
                  </span>
                  {appItem.job && (
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getRiskBadgeClass(appItem.job.riskClassification)}`}>
                      {appItem.job.riskClassification}
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-white">{appItem.job?.jobTitle}</p>
                <p className="text-[11px] text-gray-400">
                  {appItem.job?.employerName} · {appItem.humanApproved ? 'Human Approved' : 'Pending Review'}
                </p>
              </button>
            ))}
          </div>

          {/* Application Workspace */}
          <div className="lg:col-span-7">
            {!selectedApp ? (
              <div className="p-8 text-center rounded-xl bg-[#0e0e14] border border-white/10 text-xs text-gray-400">
                Select an application on the left to manage stages, honest CV tips, human approval, and message drafts.
              </div>
            ) : (
              <div className="p-5 rounded-xl bg-[#0e0e14] border border-white/10 space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
                  <div>
                    <h3 className="text-base font-display font-bold text-white">
                      {selectedApp.job?.jobTitle}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {selectedApp.job?.employerName} ·{' '}
                      <a
                        href={selectedApp.job?.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#B68AFF] hover:underline"
                      >
                        Open Official Application Link
                      </a>
                    </p>
                  </div>
                </div>

                {/* Human Approval Gate */}
                <label className="flex items-center gap-2.5 p-3 rounded-lg bg-[#050505] border border-white/10 text-xs text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedApp.humanApproved}
                    onChange={(e) =>
                      handleUpdateApplication(selectedApp.id, { humanApproved: e.target.checked })
                    }
                    className="accent-[#8B45FF]"
                  />
                  <span>
                    <strong className="text-[#B68AFF]">Human Approval Confirmed:</strong> I have inspected this listing, trust evidence, and my application draft personally.
                  </span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-gray-400 block mb-1">Application Stage</label>
                    <select
                      value={selectedApp.stage}
                      onChange={(e) =>
                        handleUpdateApplication(selectedApp.id, { stage: e.target.value as ApplicationStage })
                      }
                      className="w-full bg-[#050505] border border-white/10 rounded-lg px-2.5 py-2 text-white"
                    >
                      {APPLICATION_STAGES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Application Date</label>
                    <input
                      type="date"
                      value={selectedApp.applicationDate || ''}
                      onChange={(e) =>
                        handleUpdateApplication(selectedApp.id, { applicationDate: e.target.value })
                      }
                      className="w-full bg-[#050505] border border-white/10 rounded-lg px-2.5 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Follow-up Reminder</label>
                    <input
                      type="date"
                      value={selectedApp.followUpReminder || ''}
                      onChange={(e) =>
                        handleUpdateApplication(selectedApp.id, { followUpReminder: e.target.value })
                      }
                      className="w-full bg-[#050505] border border-white/10 rounded-lg px-2.5 py-2 text-white"
                    />
                  </div>
                </div>

                {/* Honest CV Tips */}
                <div className="p-3.5 rounded-lg bg-[#050505] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#B68AFF]" />
                      <span>Honest CV Tailoring Suggestions</span>
                    </span>
                    <button
                      onClick={() => handleGenerateAssist(selectedApp.id)}
                      disabled={assistLoadingId === selectedApp.id}
                      className="text-[11px] text-[#B68AFF] hover:underline cursor-pointer"
                    >
                      {assistLoadingId === selectedApp.id ? 'Refreshing...' : 'Regenerate Draft'}
                    </button>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-gray-300">
                    {selectedApp.cvSuggestions.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>

                {/* Message Draft */}
                <div className="space-y-1.5 text-xs">
                  <label className="text-gray-400 block">Application Cover Message Draft</label>
                  <textarea
                    rows={5}
                    value={selectedApp.messageDraft}
                    onChange={(e) =>
                      handleUpdateApplication(selectedApp.id, { messageDraft: e.target.value })
                    }
                    className="w-full bg-[#050505] border border-white/10 rounded-lg p-3 text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-gray-400 block mb-1">Personal Notes</label>
                    <textarea
                      rows={3}
                      value={selectedApp.personalNotes}
                      onChange={(e) =>
                        handleUpdateApplication(selectedApp.id, { personalNotes: e.target.value })
                      }
                      className="w-full bg-[#050505] border border-white/10 rounded-lg p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Interview Notes</label>
                    <textarea
                      rows={3}
                      value={selectedApp.interviewNotes}
                      onChange={(e) =>
                        handleUpdateApplication(selectedApp.id, { interviewNotes: e.target.value })
                      }
                      className="w-full bg-[#050505] border border-white/10 rounded-lg p-2.5 text-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
