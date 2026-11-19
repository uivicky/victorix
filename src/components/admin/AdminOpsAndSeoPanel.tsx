import React, { useState } from 'react';
import {
  BlogPost,
  AutomationRun,
  SourceSyncState,
  UserSettings,
  FreeTierServiceStatus,
  StorageStatus,
  PageSpeedMetricResult,
} from '../../types';
import {
  Globe,
  Clock,
  Activity,
  Settings as SettingsIcon,
  Gauge,
  Play,
  Pause,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Database,
  Download,
  BookOpen,
  Plus,
  Trash2,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface AdminOpsAndSeoPanelProps {
  section: 'seo' | 'scheduler' | 'free-tier' | 'logs' | 'settings';
  seoData: {
    gsc: { connected: boolean; status: string; message: string; metrics: any };
    ga4: { connected: boolean; status: string; message: string; metrics: any };
    recommendations: any[];
    pagesAudited: any[];
    pageSpeedHistory: PageSpeedMetricResult[];
    sitemapStatus: { url: string; valid: boolean; routesCount: number };
    robotsStatus: { url: string; valid: boolean; adminProtected: boolean };
  } | null;
  blogs: BlogPost[];
  discoveryLogs: {
    runs: AutomationRun[];
    sourceSyncState: SourceSyncState[];
    runLock: any;
    settings: UserSettings;
  } | null;
  freeTier: {
    services: FreeTierServiceStatus[];
    storageStatus: StorageStatus;
    quotas: any;
  } | null;
  settingsData: {
    settings: UserSettings;
    storageStatus: StorageStatus;
    sourceSyncState: SourceSyncState[];
  } | null;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  onRefresh: () => void;
  onRunNow: () => void;
  isRunningNow: boolean;
}

export const AdminOpsAndSeoPanel: React.FC<AdminOpsAndSeoPanelProps> = ({
  section,
  seoData,
  blogs,
  discoveryLogs,
  freeTier,
  settingsData,
  authFetch,
  onRefresh,
  onRunNow,
  isRunningNow,
}) => {
  // PageSpeed Tester
  const [psiUrl, setPsiUrl] = useState('https://little-world-school.vercel.app/');
  const [psiStrategy, setPsiStrategy] = useState<'mobile' | 'desktop'>('mobile');
  const [psiLoading, setPsiLoading] = useState(false);
  const [psiError, setPsiError] = useState('');

  // Blog CMS inline states
  const [blogTitle, setBlogTitle] = useState('');
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogCategory, setBlogCategory] = useState('Guides');
  const [aiTopic, setAiTopic] = useState('');
  const [aiDrafting, setAiDrafting] = useState(false);

  // Logs expandable row
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);

  // Settings form state
  const currentSettings = settingsData?.settings;
  const [skillsInput, setSkillsInput] = useState(
    currentSettings?.applicantSkills?.join(', ') || ''
  );
  const [schemaPreview, setSchemaPreview] = useState('');
  const [settingsSavedMsg, setSettingsSavedMsg] = useState('');

  const handleRunPageSpeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!psiUrl.trim()) return;
    setPsiLoading(true);
    setPsiError('');
    try {
      const res = await authFetch('/api/admin/seo/pagespeed', {
        method: 'POST',
        body: JSON.stringify({ url: psiUrl.trim(), strategy: psiStrategy }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPsiError(data.error || 'PageSpeed test failed');
      } else {
        onRefresh();
      }
    } catch (err: any) {
      setPsiError(err.message);
    } finally {
      setPsiLoading(false);
    }
  };

  const handleToggleRec = async (id: string, status: string) => {
    await authFetch(`/api/admin/seo/recommendations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: status === 'open' ? 'resolved' : 'open' }),
    });
    onRefresh();
  };

  const handleGenerateBlogDraft = async () => {
    if (!aiTopic.trim()) return;
    setAiDrafting(true);
    try {
      const res = await authFetch('/api/admin/blogs/ai-draft', {
        method: 'POST',
        body: JSON.stringify({ topic: aiTopic.trim(), category: blogCategory }),
      });
      const data = await res.json();
      if (data.success && data.draft) {
        setBlogTitle(data.draft.title || '');
        setBlogExcerpt(data.draft.excerpt || '');
        setBlogContent(data.draft.content || '');
      }
    } finally {
      setAiDrafting(false);
    }
  };

  const handlePublishBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogTitle.trim() || !blogContent.trim()) return;
    await authFetch('/api/admin/blogs', {
      method: 'POST',
      body: JSON.stringify({
        title: blogTitle.trim(),
        excerpt: blogExcerpt.trim() || undefined,
        content: blogContent.trim(),
        category: blogCategory,
        status: 'published',
      }),
    });
    setBlogTitle('');
    setBlogExcerpt('');
    setBlogContent('');
    setAiTopic('');
    onRefresh();
  };

  const handleDeleteBlog = async (id: string) => {
    await authFetch(`/api/admin/blogs/${id}`, { method: 'DELETE' });
    onRefresh();
  };

  const handleUpdateSettings = async (patch: Partial<UserSettings>) => {
    setSettingsSavedMsg('');
    const res = await authFetch('/api/settings', {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      setSettingsSavedMsg('Settings saved.');
      onRefresh();
    }
  };

  const handleTogglePause = async () => {
    await authFetch('/api/discovery/toggle', { method: 'POST' });
    onRefresh();
  };

  const handleDownloadBackup = async () => {
    const res = await authFetch('/api/backup/export');
    if (!res.ok) return;
    const text = await res.text();
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'victorix_backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadSchema = async () => {
    const res = await fetch('/api/schema/d1');
    const txt = await res.text();
    setSchemaPreview(txt);
  };

  // =========================================================================
  // 1. SEO GROWTH MONITOR
  // =========================================================================
  if (section === 'seo') {
    return (
      <div className="space-y-6">
        {/* GSC & GA4 Explicit Connection Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#0e0e14] border border-white/10 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Google Search Console</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  seoData?.gsc.connected
                    ? 'bg-emerald-500/15 text-emerald-300'
                    : 'bg-amber-500/15 text-amber-300'
                }`}
              >
                {seoData?.gsc.status || 'NOT CONNECTED'}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {seoData?.gsc.message || 'Zero fabricated clicks, impressions, or ranking guarantees.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0e0e14] border border-white/10 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Google Analytics 4 (GA4)</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  seoData?.ga4.connected
                    ? 'bg-emerald-500/15 text-emerald-300'
                    : 'bg-amber-500/15 text-amber-300'
                }`}
              >
                {seoData?.ga4.status || 'NOT CONNECTED'}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {seoData?.ga4.message || 'Zero fabricated organic traffic metrics.'}
            </p>
          </div>
        </div>

        {/* Live PageSpeed Insights & HTTP Telemetry */}
        <div className="p-5 rounded-xl bg-[#0e0e14] border border-white/10 space-y-4">
          <div>
            <h2 className="text-base font-display font-bold text-white flex items-center gap-2">
              <Gauge className="w-4 h-4 text-[#B68AFF]" />
              <span>PageSpeed Insights &amp; Technical Telemetry</span>
            </h2>
            <p className="text-xs text-gray-400">
              Runs real Google PageSpeed Insights v5 API (with safe read-only HTTP fallback if API quota is unavailable).
            </p>
          </div>

          <form onSubmit={handleRunPageSpeed} className="flex flex-wrap gap-2">
            <input
              type="url"
              placeholder="https://little-world-school.vercel.app/"
              value={psiUrl}
              onChange={(e) => setPsiUrl(e.target.value)}
              className="flex-1 min-w-[220px] bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
            />
            <select
              value={psiStrategy}
              onChange={(e) => setPsiStrategy(e.target.value as any)}
              className="bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
            >
              <option value="mobile">Mobile</option>
              <option value="desktop">Desktop</option>
            </select>
            <button
              type="submit"
              disabled={psiLoading}
              className="px-4 py-2 rounded-lg bg-[#8B45FF] hover:bg-[#7830ee] disabled:opacity-50 text-xs font-semibold text-white cursor-pointer"
            >
              {psiLoading ? 'Running Audit...' : 'Run PageSpeed Test'}
            </button>
          </form>

          {psiError && <p className="text-xs text-red-300">{psiError}</p>}

          {seoData?.pageSpeedHistory && seoData.pageSpeedHistory.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400">
                    <th className="py-2 px-2">URL</th>
                    <th className="py-2 px-2">Strategy</th>
                    <th className="py-2 px-2">Perf</th>
                    <th className="py-2 px-2">SEO</th>
                    <th className="py-2 px-2">Access</th>
                    <th className="py-2 px-2">Source Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 tabular-nums">
                  {seoData.pageSpeedHistory.map((r, i) => (
                    <tr key={i}>
                      <td className="py-2 px-2 text-[#B68AFF] max-w-[200px] truncate">{r.url}</td>
                      <td className="py-2 px-2 text-gray-300">{r.strategy}</td>
                      <td className="py-2 px-2 text-white">{r.performanceScore ?? '--'}</td>
                      <td className="py-2 px-2 text-white">{r.seoScore ?? '--'}</td>
                      <td className="py-2 px-2 text-white">{r.accessibilityScore ?? '--'}</td>
                      <td className="py-2 px-2 text-gray-400 text-[11px]">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sitemap, Audited Routes & Weekly Action Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl bg-[#0e0e14] border border-white/10 space-y-3">
            <h3 className="text-sm font-display font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#B68AFF]" />
              <span>Technical SEO Status &amp; Audited Public Routes</span>
            </h3>
            <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-[#050505]">
              <span className="text-gray-300">XML Sitemap ({seoData?.sitemapStatus.routesCount || 18} routes)</span>
              <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="text-[#B68AFF] underline">
                /sitemap.xml
              </a>
            </div>
            <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-[#050505]">
              <span className="text-gray-300">Robots.txt (/admin &amp; /api disallowed)</span>
              <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="text-[#B68AFF] underline">
                /robots.txt
              </a>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pt-1">
              {(seoData?.pagesAudited || []).map((p: any, idx: number) => (
                <div key={idx} className="p-2 rounded bg-[#050505] text-[11px] flex items-center justify-between gap-2">
                  <span className="text-gray-200 truncate">{p.url}</span>
                  <span className="text-emerald-400 font-mono shrink-0">H1:{p.h1Count} · Schema</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#0e0e14] border border-white/10 space-y-3">
            <h3 className="text-sm font-display font-bold text-white">SEO Improvement Action Items</h3>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {(seoData?.recommendations || []).map((rec: any) => (
                <div key={rec.id} className="p-3 rounded-lg bg-[#050505] border border-white/5 flex items-start justify-between gap-3">
                  <div className="space-y-0.5 text-xs">
                    <p className={`font-semibold ${rec.status === 'resolved' ? 'line-through text-gray-500' : 'text-white'}`}>
                      {rec.title}
                    </p>
                    <p className="text-[11px] text-gray-400">{rec.explanation}</p>
                  </div>
                  <button
                    onClick={() => handleToggleRec(rec.id, rec.status)}
                    className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-[11px] text-white shrink-0 cursor-pointer"
                  >
                    {rec.status === 'resolved' ? 'Reopen' : 'Mark Done'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Blog CMS + AI Draft */}
        <div className="p-5 rounded-xl bg-[#0e0e14] border border-white/10 space-y-4">
          <h3 className="text-sm font-display font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#B68AFF]" />
            <span>Content Marketing &amp; Blog CMS ({blogs.length} posts)</span>
          </h3>

          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Blog topic for AI / structured outline draft..."
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              className="flex-1 min-w-[220px] bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
            />
            <button
              onClick={handleGenerateBlogDraft}
              disabled={aiDrafting || !aiTopic.trim()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 disabled:opacity-40 text-xs text-white font-semibold cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#B68AFF]" />
              <span>{aiDrafting ? 'Drafting...' : 'Generate Draft Outline'}</span>
            </button>
          </div>

          <form onSubmit={handlePublishBlog} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Article Title *"
                value={blogTitle}
                onChange={(e) => setBlogTitle(e.target.value)}
                className="md:col-span-2 bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-white"
              />
              <select
                value={blogCategory}
                onChange={(e) => setBlogCategory(e.target.value)}
                className="bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-white"
              >
                <option value="Guides">Guides</option>
                <option value="SEO">SEO</option>
                <option value="Pricing">Pricing</option>
                <option value="Technology">Technology</option>
              </select>
            </div>
            <input
              type="text"
              placeholder="Short Excerpt / Meta Description"
              value={blogExcerpt}
              onChange={(e) => setBlogExcerpt(e.target.value)}
              className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-white"
            />
            <textarea
              rows={4}
              placeholder="Markdown article body *"
              value={blogContent}
              onChange={(e) => setBlogContent(e.target.value)}
              className="w-full bg-[#050505] border border-white/10 rounded-lg p-3 text-white"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#8B45FF] hover:bg-[#7830ee] text-white font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Publish Article</span>
            </button>
          </form>

          <div className="divide-y divide-white/5 max-h-56 overflow-y-auto text-xs">
            {blogs.map((b) => (
              <div key={b.id} className="py-2.5 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{b.title}</p>
                  <p className="text-[11px] text-gray-400">
                    /{b.slug} · {b.category} · {b.status || 'published'}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteBlog(b.id)}
                  className="p-1.5 rounded bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-300 cursor-pointer"
                  title="Delete Article"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. AUTOMATION SCHEDULER
  // =========================================================================
  if (section === 'scheduler') {
    const sched = discoveryLogs?.settings;
    return (
      <div className="space-y-6">
        <div className="p-5 rounded-xl bg-[#0e0e14] border border-white/10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-display font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#B68AFF]" />
                <span>Zero-Cost Automation Scheduler (Single Active Source)</span>
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                GitHub Actions Free and Cloudflare Worker Cron include a single-active-scheduler exclusion rule plus distributed lock protection to avoid duplicate discovery runs.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleTogglePause}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-white cursor-pointer"
              >
                {sched?.schedulerPaused ? (
                  <>
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Resume Scheduler</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pause Scheduler</span>
                  </>
                )}
              </button>
              <button
                onClick={onRunNow}
                disabled={isRunningNow}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#8B45FF] hover:bg-[#7830ee] disabled:opacity-50 text-xs font-semibold text-white cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRunningNow ? 'animate-spin' : ''}`} />
                <span>{isRunningNow ? 'Running Cycle...' : 'Run Discovery Cycle Now'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-[#050505] border border-white/10">
              <label className="text-gray-400 block mb-1.5">Active Scheduler Engine</label>
              <select
                value={sched?.activeScheduler || 'github_actions'}
                onChange={(e) => handleUpdateSettings({ activeScheduler: e.target.value as any })}
                className="w-full bg-[#0e0e14] border border-white/10 rounded px-2.5 py-1.5 text-white"
              >
                <option value="github_actions">GitHub Actions Free (.github/workflows/discovery-cron.yml)</option>
                <option value="cloudflare_worker">Cloudflare Worker Cron (worker/cron-worker.ts)</option>
                <option value="local_server">Local Server Dev Loop</option>
              </select>
            </div>
            <div className="p-3.5 rounded-lg bg-[#050505] border border-white/10 space-y-1">
              <span className="text-gray-400 block">Scheduler State</span>
              <p className="text-white font-semibold">
                {sched?.schedulerPaused ? 'PAUSED' : 'ACTIVE (Every 15 Minutes)'}
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-[#050505] border border-white/10 space-y-1">
              <span className="text-gray-400 block">Execution Lock Guard</span>
              <p className="text-white font-semibold">
                {discoveryLogs?.runLock?.locked ? 'Locked (Run in progress)' : 'Unlocked (Ready)'}
              </p>
            </div>
          </div>
        </div>

        {/* Source Sync Checkpoints */}
        <div className="p-5 rounded-xl bg-[#0e0e14] border border-white/10 space-y-3">
          <h3 className="text-sm font-display font-bold text-white">Source Compliance &amp; Sync Checkpoints</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-gray-400">
                  <th className="py-2 px-3">Source</th>
                  <th className="py-2 px-3">Min Interval</th>
                  <th className="py-2 px-3">Daily Requests</th>
                  <th className="py-2 px-3">Last Status</th>
                  <th className="py-2 px-3">Last Synced</th>
                  <th className="py-2 px-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 tabular-nums">
                {(discoveryLogs?.sourceSyncState || []).map((s) => (
                  <tr key={s.sourceId}>
                    <td className="py-2.5 px-3 font-semibold text-white">{s.sourceName}</td>
                    <td className="py-2.5 px-3 text-gray-300">{s.minIntervalMinutes} min</td>
                    <td className="py-2.5 px-3 text-white">
                      {s.requestsToday} / {s.dailyLimit}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          s.lastStatus === 'ok' || s.lastStatus === 'ready'
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : 'bg-amber-500/15 text-amber-300'
                        }`}
                      >
                        {s.lastStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-gray-400">
                      {s.lastSyncedAt ? new Date(s.lastSyncedAt).toLocaleString() : 'Never'}
                    </td>
                    <td className="py-2.5 px-3 text-gray-400 text-[11px]">{s.lastError || s.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. FREE-TIER USAGE MONITOR
  // =========================================================================
  if (section === 'free-tier') {
    const services = freeTier?.services || [];
    return (
      <div className="space-y-6">
        <div className="p-5 rounded-xl bg-[#0e0e14] border border-white/10">
          <h2 className="text-base font-display font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#B68AFF]" />
            <span>Free-Tier Quota &amp; Zero-Cost Service Monitor</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Automatic throttling protects free quotas. Never silently upgrades to paid billing. Deterministic fallbacks stay active whenever any external quota pauses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((srv) => {
            const pct = srv.dailyLimit > 0 ? Math.min(100, Math.round((srv.usedToday / srv.dailyLimit) * 100)) : 0;
            const statusClass =
              srv.status === 'Free and active'
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : srv.status === 'Free quota exhausted'
                ? 'bg-red-500/15 text-red-300 border-red-500/30'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30';

            return (
              <div key={srv.id} className="p-4 rounded-xl bg-[#0e0e14] border border-white/10 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white">{srv.serviceName}</h3>
                    <p className="text-[11px] text-gray-400">{srv.provider}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${statusClass}`}>
                    {srv.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-300 tabular-nums">
                    <span>
                      Used: {srv.usedToday} / {srv.dailyLimit} {srv.unit}
                    </span>
                    <span>{pct}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        pct >= srv.warningThresholdPct ? 'bg-amber-400' : 'bg-[#8B45FF]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <p className="text-[11px] text-gray-300">
                  <strong className="text-white">Fallback:</strong> {srv.fallbackBehavior}
                </p>
                <p className="text-[11px] text-gray-500">{srv.setupGuide}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. SYSTEM LOGS (EXECUTION HISTORY)
  // =========================================================================
  if (section === 'logs') {
    const runs = discoveryLogs?.runs || [];
    return (
      <div className="space-y-4">
        <div className="p-5 rounded-xl bg-[#0e0e14] border border-white/10">
          <h2 className="text-base font-display font-bold text-white">
            Automation Execution Logs ({runs.length})
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Real execution trace of GitHub Actions, Cloudflare Worker, or manual discovery runs. Never logs private credentials.
          </p>
        </div>

        {runs.length === 0 ? (
          <div className="p-10 text-center rounded-xl bg-[#0e0e14] border border-dashed border-white/10 text-xs text-gray-400">
            No automation runs recorded yet. Trigger a manual cycle from Overview or Automation Scheduler.
          </div>
        ) : (
          <div className="space-y-2.5">
            {runs.map((run) => {
              const isOpen = expandedRunId === run.id;
              return (
                <div key={run.id} className="p-4 rounded-xl bg-[#0e0e14] border border-white/10 space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          run.status === 'success'
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : run.status === 'failed'
                            ? 'bg-red-500/15 text-red-300'
                            : 'bg-amber-500/15 text-amber-300'
                        }`}
                      >
                        {run.status}
                      </span>
                      <span className="font-mono text-white font-semibold">{run.triggerType}</span>
                      <span className="text-gray-400 tabular-nums">
                        {new Date(run.startedAt).toLocaleString()} · {run.durationMs}ms
                      </span>
                    </div>

                    <div className="flex items-center gap-3 tabular-nums text-gray-300">
                      <span>Biz: +{run.businessAdded}/{run.businessEvaluated}</span>
                      <span>Jobs: +{run.jobsAdded}/{run.jobsEvaluated}</span>
                      <span>Dupes: {run.duplicatesSkipped}</span>
                      <button
                        onClick={() => setExpandedRunId(isOpen ? null : run.id)}
                        className="p-1 rounded bg-white/5 hover:bg-white/10 text-white cursor-pointer"
                      >
                        {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {run.errorMessage && (
                    <p className="text-amber-300 text-[11px] flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{run.errorMessage}</span>
                    </p>
                  )}

                  {isOpen && (
                    <div className="p-3 rounded-lg bg-[#050505] border border-white/5 font-mono text-[11px] text-gray-300 space-y-1">
                      {run.steps.map((st, idx) => (
                        <div key={idx}>• {st}</div>
                      ))}
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
  // 5. SETTINGS, RETENTION, STORAGE & BACKUP
  // =========================================================================
  return (
    <div className="space-y-6">
      <div className="p-5 rounded-xl bg-[#0e0e14] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-display font-bold text-white flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-[#B68AFF]" />
            <span>Platform Preferences, Data Retention &amp; Applicant Profile</span>
          </h2>
          {settingsSavedMsg && (
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {settingsSavedMsg}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="text-gray-400 block mb-1">Business Discovery Geographic Priority</label>
            <select
              value={currentSettings?.businessDiscoveryPriority || 'Priority 1: Mumbai'}
              onChange={(e) =>
                handleUpdateSettings({ businessDiscoveryPriority: e.target.value as any })
              }
              className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-white"
            >
              <option value="Priority 1: Mumbai">Priority 1: Mumbai</option>
              <option value="Priority 2: Maharashtra">Priority 2: Maharashtra</option>
              <option value="Priority 3: India">Priority 3: Other Indian Cities</option>
            </select>
          </div>
          <div>
            <label className="text-gray-400 block mb-1">Unqualified Lead Retention (Days)</label>
            <input
              type="number"
              min={7}
              max={365}
              value={currentSettings?.leadRetentionDays ?? 90}
              onChange={(e) => handleUpdateSettings({ leadRetentionDays: Number(e.target.value) })}
              className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-white tabular-nums"
            />
          </div>
          <div>
            <label className="text-gray-400 block mb-1">Unsaved Remote Job Retention (Days)</label>
            <input
              type="number"
              min={7}
              max={180}
              value={currentSettings?.jobRetentionDays ?? 45}
              onChange={(e) => handleUpdateSettings({ jobRetentionDays: Number(e.target.value) })}
              className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-white tabular-nums"
            />
          </div>
          <div>
            <label className="text-gray-400 block mb-1">Execution Log Cap (Records)</label>
            <input
              type="number"
              min={20}
              max={500}
              value={currentSettings?.logRetentionCount ?? 150}
              onChange={(e) => handleUpdateSettings({ logRetentionCount: Number(e.target.value) })}
              className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-white tabular-nums"
            />
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <label className="text-gray-400 block">
            Applicant Verified Skills (Used transparently for Job Suitability &amp; Honest CV suggestions)
          </label>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              className="flex-1 min-w-[260px] bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-white"
            />
            <button
              onClick={() =>
                handleUpdateSettings({
                  applicantSkills: skillsInput
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              className="px-4 py-2 rounded-lg bg-[#8B45FF] hover:bg-[#7830ee] text-white font-semibold cursor-pointer"
            >
              Save Skills Profile
            </button>
          </div>
        </div>
      </div>

      {/* Cloudflare D1/KV Storage Status, Schema & Backup Export */}
      <div className="p-5 rounded-xl bg-[#0e0e14] border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-display font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-[#B68AFF]" />
              <span>Private Automation Storage &amp; Backups</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {settingsData?.storageStatus.statusLabel}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleLoadSchema}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white cursor-pointer"
            >
              Inspect D1 SQL Schema
            </button>
            <button
              onClick={handleDownloadBackup}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8B45FF] hover:bg-[#7830ee] text-xs font-semibold text-white cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>1-Click JSON Backup</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-[#050505] border border-white/5">
            <span className="text-gray-400 block">Cloudflare D1</span>
            <strong className={settingsData?.storageStatus.d1Configured ? 'text-emerald-400' : 'text-amber-300'}>
              {settingsData?.storageStatus.d1Configured ? 'Configured & Connected' : 'Local Fallback Active'}
            </strong>
          </div>
          <div className="p-3 rounded-lg bg-[#050505] border border-white/5">
            <span className="text-gray-400 block">Cloudflare KV</span>
            <strong className={settingsData?.storageStatus.kvConfigured ? 'text-emerald-400' : 'text-amber-300'}>
              {settingsData?.storageStatus.kvConfigured ? 'Configured & Connected' : 'Local Fallback Active'}
            </strong>
          </div>
          <div className="p-3 rounded-lg bg-[#050505] border border-white/5">
            <span className="text-gray-400 block">Last Exported Backup</span>
            <strong className="text-white tabular-nums">
              {settingsData?.storageStatus.lastBackupAt
                ? new Date(settingsData.storageStatus.lastBackupAt).toLocaleString()
                : 'Not exported yet'}
            </strong>
          </div>
        </div>

        {schemaPreview && (
          <pre className="p-4 rounded-xl bg-[#050505] border border-white/10 text-[11px] font-mono text-gray-300 max-h-80 overflow-y-auto">
            {schemaPreview}
          </pre>
        )}
      </div>
    </div>
  );
};
