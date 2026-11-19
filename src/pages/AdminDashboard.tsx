import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Building2,
  ShieldCheck,
  Briefcase,
  ShieldAlert,
  Bookmark,
  Send,
  Kanban,
  Sparkles,
  Globe,
  FileCode2,
  Clock,
  Activity,
  Terminal,
  Settings,
  Lock,
  LogOut,
  RefreshCw,
  Menu,
  X,
} from 'lucide-react';
import { AdminOverview } from '../components/admin/AdminOverview';
import { AdminBusinessPanel } from '../components/admin/AdminBusinessPanel';
import { AdminJobPanel } from '../components/admin/AdminJobPanel';
import { AdminWebFactoryPanel } from '../components/admin/AdminWebFactoryPanel';
import { AdminOpsAndSeoPanel } from '../components/admin/AdminOpsAndSeoPanel';

type AdminTab =
  | 'overview'
  | 'business-hunter'
  | 'website-auditor'
  | 'job-finder'
  | 'job-scam-checker'
  | 'saved-jobs'
  | 'applications'
  | 'client-crm'
  | 'demo-generator'
  | 'seo-monitor'
  | 'website-factory'
  | 'scheduler'
  | 'free-tier'
  | 'logs'
  | 'settings';

const NAV_ITEMS: { id: AdminTab; label: string; group: string; icon: React.ComponentType<any> }[] = [
  { id: 'overview', label: 'Overview', group: 'Command', icon: LayoutDashboard },
  { id: 'business-hunter', label: 'Business Lead Hunter', group: 'Business Engine', icon: Building2 },
  { id: 'website-auditor', label: 'Website Auditor', group: 'Business Engine', icon: ShieldCheck },
  { id: 'client-crm', label: 'Client CRM', group: 'Business Engine', icon: Kanban },
  { id: 'demo-generator', label: 'Website Demo Generator', group: 'Business Engine', icon: Sparkles },
  { id: 'website-factory', label: 'Client Website Factory', group: 'Business Engine', icon: FileCode2 },
  { id: 'job-finder', label: 'Global Remote Job Hunter', group: 'Job Engine', icon: Briefcase },
  { id: 'job-scam-checker', label: 'Job Scam Checker', group: 'Job Engine', icon: ShieldAlert },
  { id: 'saved-jobs', label: 'Saved Jobs', group: 'Job Engine', icon: Bookmark },
  { id: 'applications', label: 'Application Tracker', group: 'Job Engine', icon: Send },
  { id: 'seo-monitor', label: 'SEO Growth Monitor', group: 'Growth & Ops', icon: Globe },
  { id: 'scheduler', label: 'Automation Scheduler', group: 'Growth & Ops', icon: Clock },
  { id: 'free-tier', label: 'Free-Tier Usage Monitor', group: 'Growth & Ops', icon: Activity },
  { id: 'logs', label: 'System Logs', group: 'Growth & Ops', icon: Terminal },
  { id: 'settings', label: 'Settings', group: 'Growth & Ops', icon: Settings },
];

export const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [authConfigured, setAuthConfigured] = useState(true);
  const [authPassphraseInput, setAuthPassphraseInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [isRunningNow, setIsRunningNow] = useState(false);
  const [runNotice, setRunNotice] = useState('');

  // State buckets populated strictly from authenticated API routes
  const [overview, setOverview] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [jobsData, setJobsData] = useState<{
    jobs: any[];
    summary: any;
    alerts: any[];
    syncState: any[];
    officialPortals: any[];
  }>({ jobs: [], summary: null, alerts: [], syncState: [], officialPortals: [] });
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [discoveryLogs, setDiscoveryLogs] = useState<any>(null);
  const [freeTier, setFreeTier] = useState<any>(null);
  const [settingsData, setSettingsData] = useState<any>(null);
  const [seoData, setSeoData] = useState<any>(null);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);

  const authFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const res = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    if (res.status === 401) {
      setIsAuthenticated(false);
    }
    return res;
  }, []);

  const checkSession = useCallback(async () => {
    setCheckingSession(true);
    try {
      const res = await fetch('/api/admin/session', {
        credentials: 'include',
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.configured === false) {
        setAuthConfigured(false);
        setIsAuthenticated(false);
        setAuthError(
          data.error ||
            'Admin authentication is not configured. Check server environment variables.'
        );
      } else {
        setAuthConfigured(true);
        setIsAuthenticated(Boolean(data.authenticated));
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setCheckingSession(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const loadAllData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingData(true);
    try {
      const [
        ovRes,
        leadsRes,
        jobsRes,
        savedRes,
        appsRes,
        logsRes,
        ftRes,
        setRes,
        seoRes,
        blogsRes,
        enqRes,
      ] = await Promise.all([
        authFetch('/api/overview'),
        authFetch('/api/leads'),
        authFetch('/api/jobs'),
        authFetch('/api/saved-jobs'),
        authFetch('/api/applications'),
        authFetch('/api/discovery/logs'),
        authFetch('/api/free-tier'),
        authFetch('/api/settings'),
        authFetch('/api/admin/seo'),
        authFetch('/api/admin/blogs'),
        authFetch('/api/enquiries'),
      ]);

      const [ov, ld, jb, sv, ap, lg, ft, st, se, bl, eq] = await Promise.all([
        ovRes.json(),
        leadsRes.json(),
        jobsRes.json(),
        savedRes.json(),
        appsRes.json(),
        logsRes.json(),
        ftRes.json(),
        setRes.json(),
        seoRes.json(),
        blogsRes.json(),
        enqRes.json(),
      ]);

      if (ov.success) setOverview(ov);
      if (ld.success) setLeads(ld.leads || []);
      if (jb.success) {
        setJobsData({
          jobs: jb.jobs || [],
          summary: jb.summary || null,
          alerts: jb.alerts || [],
          syncState: jb.syncState || [],
          officialPortals: jb.officialPortals || [],
        });
      }
      if (sv.success) setSavedJobs(sv.savedJobs || []);
      if (ap.success) setApplications(ap.applications || []);
      if (lg.success) setDiscoveryLogs(lg);
      if (ft.success) setFreeTier(ft);
      if (st.success) setSettingsData(st);
      if (se.success) setSeoData(se);
      if (bl.success) setBlogs(bl.blogs || []);
      if (eq.success) setEnquiries(eq.enquiries || []);
    } catch (err) {
      console.error('Failed to sync dashboard state:', err);
    } finally {
      setLoadingData(false);
    }
  }, [isAuthenticated, authFetch]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
      const timer = setInterval(loadAllData, 45000);
      return () => clearInterval(timer);
    }
  }, [isAuthenticated, loadAllData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passphrase: authPassphraseInput }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.authenticated) {
        setIsAuthenticated(true);
        setAuthConfigured(true);
        setAuthPassphraseInput('');
      } else {
        setAuthError(data.error || 'Authentication failed.');
      }
    } catch {
      setAuthError('Connection error during login.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // ignore network error on logout
    }
    setIsAuthenticated(false);
    setOverview(null);
    setLeads([]);
    setJobsData({ jobs: [], summary: null, alerts: [], syncState: [], officialPortals: [] });
    setSavedJobs([]);
    setApplications([]);
  };

  const handleRunDiscoveryCycle = async () => {
    setIsRunningNow(true);
    setRunNotice('');
    try {
      const res = await authFetch('/api/discovery/trigger', {
        method: 'POST',
        body: JSON.stringify({ mode: 'full' }),
      });
      const data = await res.json();
      if (data.success && data.run) {
        setRunNotice(
          `Cycle ${data.run.status}: Businesses +${data.run.businessAdded}/${data.run.businessEvaluated}, Remote Jobs +${data.run.jobsAdded}/${data.run.jobsEvaluated} (${data.run.durationMs}ms).`
        );
        loadAllData();
      } else {
        setRunNotice(data.reason || data.error || 'Run skipped or failed.');
      }
    } finally {
      setIsRunningNow(false);
    }
  };

  // =========================================================================
  // LOGIN GATE
  // =========================================================================
  if (checkingSession) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-2xl bg-[#0e0e14] border border-[#8B45FF]/35 p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#8B45FF]/20 text-[#B68AFF] flex items-center justify-center mx-auto border border-[#8B45FF]/30">
            <ShieldCheck className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-xl font-display font-bold text-white">VICTORIX 3.0 Workspace</h1>
          <p className="text-xs text-gray-400">Verifying encrypted session cookie...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-2xl bg-[#0e0e14] border border-[#8B45FF]/35 p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-[#8B45FF]/20 text-[#B68AFF] flex items-center justify-center mx-auto border border-[#8B45FF]/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-display font-bold text-white">VICTORIX 3.0 Workspace</h1>
            <p className="text-xs text-gray-400">
              Private team portal for Vicky Vishwakarma &amp; Abhishek. Protected by signed HttpOnly session auth.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {authError && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-xs text-red-200">
                {authError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 block">Admin Passphrase</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  disabled={!authConfigured}
                  autoComplete="current-password"
                  placeholder="Enter admin passphrase"
                  value={authPassphraseInput}
                  onChange={(e) => setAuthPassphraseInput(e.target.value)}
                  className="w-full bg-[#050505] border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#8B45FF] disabled:opacity-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading || !authConfigured}
              className="w-full py-2.5 px-4 rounded-lg bg-[#8B45FF] hover:bg-[#7830ee] disabled:opacity-50 text-white font-bold text-xs cursor-pointer"
            >
              {authLoading ? 'Verifying...' : 'Sign In to Workspace'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const activeNav = NAV_ITEMS.find((n) => n.id === activeTab) || NAV_ITEMS[0];
  const groups = ['Command', 'Business Engine', 'Job Engine', 'Growth & Ops'];

  // =========================================================================
  // AUTHENTICATED 15-SECTION WORKSPACE
  // =========================================================================
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation (Desktop) */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 shrink-0 rounded-2xl bg-[#0b0b10] border border-white/10 p-4 h-fit sticky top-24">
          <div className="pb-3 mb-3 border-b border-white/10">
            <p className="text-[11px] font-mono text-[#B68AFF] uppercase tracking-wider">VICTORIX 3.0 OS</p>
            <p className="text-sm font-display font-bold text-white mt-0.5">Operations Console</p>
          </div>

          <nav className="space-y-4">
            {groups.map((grp) => (
              <div key={grp} className="space-y-1">
                <p className="px-2.5 text-[10px] font-mono uppercase tracking-wider text-gray-500">
                  {grp}
                </p>
                {NAV_ITEMS.filter((item) => item.group === grp).map((item) => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#8B45FF] text-white font-semibold'
                          : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="pt-4 mt-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/5 hover:bg-red-500/20 text-xs text-gray-300 hover:text-red-300 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Workspace Content */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Workspace Header */}
          <div className="p-4 rounded-xl bg-[#0e0e14] border border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="lg:hidden p-2 rounded-lg bg-white/5 text-white cursor-pointer"
                aria-label="Toggle workspace menu"
              >
                {mobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
              <div>
                <h1 className="text-lg font-display font-bold text-white">{activeNav.label}</h1>
                <p className="text-[11px] text-gray-400">
                  Zero-Cost Architecture · Human Approval Enforced · Zero Fabricated Data
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadAllData}
                disabled={loadingData}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleLogout}
                className="lg:hidden p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-300 cursor-pointer"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Drawer Menu */}
          {mobileNavOpen && (
            <div className="lg:hidden p-3 rounded-xl bg-[#0b0b10] border border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileNavOpen(false);
                    }}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-left cursor-pointer ${
                      activeTab === item.id ? 'bg-[#8B45FF] text-white font-semibold' : 'text-gray-300 bg-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {runNotice && (
            <div className="p-3 rounded-xl bg-[#8B45FF]/15 border border-[#8B45FF]/35 text-xs text-white">
              {runNotice}
            </div>
          )}

          {/* Active Section Renderer */}
          {activeTab === 'overview' && (
            <AdminOverview
              overview={overview}
              enquiries={enquiries}
              authFetch={authFetch}
              onRefresh={loadAllData}
              onRunNow={handleRunDiscoveryCycle}
              isRunningNow={isRunningNow}
              onNavigateTab={(tab) => setActiveTab(tab as AdminTab)}
            />
          )}

          {activeTab === 'business-hunter' && (
            <AdminBusinessPanel
              mode="hunter"
              leads={leads}
              authFetch={authFetch}
              onRefresh={loadAllData}
            />
          )}

          {activeTab === 'website-auditor' && (
            <AdminBusinessPanel
              mode="auditor"
              leads={leads}
              authFetch={authFetch}
              onRefresh={loadAllData}
            />
          )}

          {activeTab === 'client-crm' && (
            <AdminBusinessPanel
              mode="crm"
              leads={leads}
              authFetch={authFetch}
              onRefresh={loadAllData}
            />
          )}

          {activeTab === 'job-finder' && (
            <AdminJobPanel
              mode="finder"
              jobs={jobsData.jobs}
              summary={jobsData.summary}
              alerts={jobsData.alerts}
              savedJobs={savedJobs}
              applications={applications}
              officialPortals={jobsData.officialPortals}
              syncState={jobsData.syncState}
              authFetch={authFetch}
              onRefresh={loadAllData}
            />
          )}

          {activeTab === 'job-scam-checker' && (
            <AdminJobPanel
              mode="scam-checker"
              jobs={jobsData.jobs}
              summary={jobsData.summary}
              alerts={jobsData.alerts}
              savedJobs={savedJobs}
              applications={applications}
              officialPortals={jobsData.officialPortals}
              syncState={jobsData.syncState}
              authFetch={authFetch}
              onRefresh={loadAllData}
            />
          )}

          {activeTab === 'saved-jobs' && (
            <AdminJobPanel
              mode="saved"
              jobs={jobsData.jobs}
              summary={jobsData.summary}
              alerts={jobsData.alerts}
              savedJobs={savedJobs}
              applications={applications}
              officialPortals={jobsData.officialPortals}
              syncState={jobsData.syncState}
              authFetch={authFetch}
              onRefresh={loadAllData}
            />
          )}

          {activeTab === 'applications' && (
            <AdminJobPanel
              mode="applications"
              jobs={jobsData.jobs}
              summary={jobsData.summary}
              alerts={jobsData.alerts}
              savedJobs={savedJobs}
              applications={applications}
              officialPortals={jobsData.officialPortals}
              syncState={jobsData.syncState}
              authFetch={authFetch}
              onRefresh={loadAllData}
            />
          )}

          {activeTab === 'demo-generator' && (
            <AdminWebFactoryPanel
              mode="demo"
              leads={leads}
              authFetch={authFetch}
              onRefresh={loadAllData}
            />
          )}

          {activeTab === 'website-factory' && (
            <AdminWebFactoryPanel
              mode="factory"
              leads={leads}
              authFetch={authFetch}
              onRefresh={loadAllData}
            />
          )}

          {activeTab === 'seo-monitor' && (
            <AdminOpsAndSeoPanel
              section="seo"
              seoData={seoData}
              blogs={blogs}
              discoveryLogs={discoveryLogs}
              freeTier={freeTier}
              settingsData={settingsData}
              authFetch={authFetch}
              onRefresh={loadAllData}
              onRunNow={handleRunDiscoveryCycle}
              isRunningNow={isRunningNow}
            />
          )}

          {activeTab === 'scheduler' && (
            <AdminOpsAndSeoPanel
              section="scheduler"
              seoData={seoData}
              blogs={blogs}
              discoveryLogs={discoveryLogs}
              freeTier={freeTier}
              settingsData={settingsData}
              authFetch={authFetch}
              onRefresh={loadAllData}
              onRunNow={handleRunDiscoveryCycle}
              isRunningNow={isRunningNow}
            />
          )}

          {activeTab === 'free-tier' && (
            <AdminOpsAndSeoPanel
              section="free-tier"
              seoData={seoData}
              blogs={blogs}
              discoveryLogs={discoveryLogs}
              freeTier={freeTier}
              settingsData={settingsData}
              authFetch={authFetch}
              onRefresh={loadAllData}
              onRunNow={handleRunDiscoveryCycle}
              isRunningNow={isRunningNow}
            />
          )}

          {activeTab === 'logs' && (
            <AdminOpsAndSeoPanel
              section="logs"
              seoData={seoData}
              blogs={blogs}
              discoveryLogs={discoveryLogs}
              freeTier={freeTier}
              settingsData={settingsData}
              authFetch={authFetch}
              onRefresh={loadAllData}
              onRunNow={handleRunDiscoveryCycle}
              isRunningNow={isRunningNow}
            />
          )}

          {activeTab === 'settings' && (
            <AdminOpsAndSeoPanel
              section="settings"
              seoData={seoData}
              blogs={blogs}
              discoveryLogs={discoveryLogs}
              freeTier={freeTier}
              settingsData={settingsData}
              authFetch={authFetch}
              onRefresh={loadAllData}
              onRunNow={handleRunDiscoveryCycle}
              isRunningNow={isRunningNow}
            />
          )}
        </div>
      </div>
    </div>
  );
};
