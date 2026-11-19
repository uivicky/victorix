import React, { useState } from 'react';
import {
  FollowUpTask,
  StorageStatus,
  AutomationRun,
  ContactEnquiry,
} from '../../types';
import {
  Building2,
  Briefcase,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Database,
  Plus,
  MessageCircle,
  Play,
  ArrowRight,
} from 'lucide-react';

interface AdminOverviewProps {
  overview: {
    storageStatus: StorageStatus;
    kpis: {
      totalLeads: number;
      highPriorityLeads: number;
      activeCrmPipeline: number;
      wonDeals: number;
      wonRevenueInr: number;
      totalRemoteJobs: number;
      verifiedJobs: number;
      suspiciousOrRejectedJobs: number;
      savedJobsCount: number;
      activeApplicationsCount: number;
      inboundEnquiries: number;
    };
    automation: {
      activeScheduler: string;
      paused: boolean;
      lockActive: boolean;
      lastSuccessRun: AutomationRun | null;
      lastFailedRun: AutomationRun | null;
      nextScheduledEstimate: string | null;
    };
    followUpTasks: FollowUpTask[];
  } | null;
  enquiries: ContactEnquiry[];
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  onRefresh: () => void;
  onRunNow: () => void;
  isRunningNow: boolean;
  onNavigateTab: (tab: string) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  overview,
  enquiries,
  authFetch,
  onRefresh,
  onRunNow,
  isRunningNow,
  onNavigateTab,
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDue, setNewTaskDue] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [newTaskAssignee, setNewTaskAssignee] = useState<'Vicky Vishwakarma' | 'Abhishek'>('Vicky Vishwakarma');

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await authFetch('/api/follow-ups', {
      method: 'POST',
      body: JSON.stringify({
        relatedType: 'business_lead',
        title: newTaskTitle.trim(),
        dueDate: newTaskDue,
        assignedTo: newTaskAssignee,
      }),
    });
    setNewTaskTitle('');
    onRefresh();
  };

  const toggleTask = async (task: FollowUpTask) => {
    await authFetch(`/api/follow-ups/${task.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: task.status === 'completed' ? 'pending' : 'completed' }),
    });
    onRefresh();
  };

  const kpis = overview?.kpis;
  const storage = overview?.storageStatus;
  const auto = overview?.automation;

  return (
    <div className="space-y-6">
      {/* Storage & Automation Status Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-[#0e0e14] border border-white/10 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Database className="w-4 h-4 text-[#B68AFF]" />
              <span>Private Automation Storage</span>
            </div>
            <p className="text-xs text-gray-300">
              {storage?.statusLabel || 'Checking persistence state...'}
            </p>
            <p className="text-[11px] text-gray-400">
              Client static sites remain 100% database-free. Schema ready: <code className="text-[#B68AFF]">{storage?.migrationsFile || 'migrations/0001_initial_d1_schema.sql'}</code> ({storage?.tablesCount || 10} tables).
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('settings')}
            className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white whitespace-nowrap shrink-0 cursor-pointer"
          >
            Configure
          </button>
        </div>

        <div className="p-4 rounded-xl bg-[#0e0e14] border border-white/10 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Clock className="w-4 h-4 text-[#B68AFF]" />
              <span>15-Min Automation ({auto?.activeScheduler || 'github_actions'})</span>
            </div>
            <p className="text-xs text-gray-300 tabular-nums">
              {auto?.lastSuccessRun
                ? `Last run: ${new Date(auto.lastSuccessRun.startedAt).toLocaleString()} (${auto.lastSuccessRun.status})`
                : 'No automated run recorded yet. Click Run Discovery Cycle to fetch live data.'}
            </p>
            {auto?.lastFailedRun && (
              <p className="text-[11px] text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Last error: {auto.lastFailedRun.errorMessage || 'Check System Logs'}
              </p>
            )}
          </div>
          <button
            onClick={onRunNow}
            disabled={isRunningNow}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#8B45FF] hover:bg-[#7830ee] disabled:opacity-50 text-white text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isRunningNow ? 'Running...' : 'Run Now'}</span>
          </button>
        </div>
      </div>

      {/* Real Database-Backed KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => onNavigateTab('business-hunter')}
          className="p-4 rounded-xl bg-[#0e0e14] border border-white/10 hover:border-[#8B45FF]/40 text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Business Leads</span>
            <Building2 className="w-4 h-4 text-[#B68AFF]" />
          </div>
          <p className="text-2xl font-display font-bold text-white mt-2 tabular-nums">
            {kpis?.totalLeads ?? 0}
          </p>
          <p className="text-[11px] text-gray-400 mt-1 tabular-nums">
            {kpis?.highPriorityLeads ?? 0} High Priority · {kpis?.activeCrmPipeline ?? 0} Active CRM
          </p>
        </button>

        <button
          onClick={() => onNavigateTab('client-crm')}
          className="p-4 rounded-xl bg-[#0e0e14] border border-white/10 hover:border-[#8B45FF]/40 text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Won Revenue (INR)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-display font-bold text-white mt-2 tabular-nums">
            ₹{(kpis?.wonRevenueInr ?? 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-gray-400 mt-1 tabular-nums">
            {kpis?.wonDeals ?? 0} Closed Deals · Starts ₹5,999
          </p>
        </button>

        <button
          onClick={() => onNavigateTab('job-finder')}
          className="p-4 rounded-xl bg-[#0e0e14] border border-white/10 hover:border-[#8B45FF]/40 text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Remote Jobs Indexed</span>
            <Briefcase className="w-4 h-4 text-[#B68AFF]" />
          </div>
          <p className="text-2xl font-display font-bold text-white mt-2 tabular-nums">
            {kpis?.totalRemoteJobs ?? 0}
          </p>
          <p className="text-[11px] text-gray-400 mt-1 tabular-nums">
            {kpis?.verifiedJobs ?? 0} Verified · {kpis?.suspiciousOrRejectedJobs ?? 0} Flagged
          </p>
        </button>

        <button
          onClick={() => onNavigateTab('applications')}
          className="p-4 rounded-xl bg-[#0e0e14] border border-white/10 hover:border-[#8B45FF]/40 text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Job Applications</span>
            <ArrowRight className="w-4 h-4 text-[#B68AFF]" />
          </div>
          <p className="text-2xl font-display font-bold text-white mt-2 tabular-nums">
            {kpis?.activeApplicationsCount ?? 0}
          </p>
          <p className="text-[11px] text-gray-400 mt-1 tabular-nums">
            {kpis?.savedJobsCount ?? 0} Saved Jobs · {kpis?.inboundEnquiries ?? 0} Enquiries
          </p>
        </button>
      </div>

      {/* Follow-Up Tasks & Recent Public WhatsApp Enquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Follow-Up Tasks */}
        <div className="p-5 rounded-xl bg-[#0e0e14] border border-white/10 space-y-4">
          <h3 className="text-sm font-display font-bold text-white">Follow-Up Tasks</h3>

          <form onSubmit={handleAddTask} className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Add follow-up reminder..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 min-w-[180px] bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#8B45FF]"
            />
            <input
              type="date"
              value={newTaskDue}
              onChange={(e) => setNewTaskDue(e.target.value)}
              className="bg-[#050505] border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white"
            />
            <select
              value={newTaskAssignee}
              onChange={(e) => setNewTaskAssignee(e.target.value as any)}
              className="bg-[#050505] border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white"
            >
              <option value="Vicky Vishwakarma">Vicky</option>
              <option value="Abhishek">Abhishek</option>
            </select>
            <button
              type="submit"
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[#8B45FF] text-white text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          {(!overview?.followUpTasks || overview.followUpTasks.length === 0) ? (
            <p className="text-xs text-gray-400 py-4 text-center border border-dashed border-white/10 rounded-lg">
              No pending follow-up tasks. Add client or job application reminders above.
            </p>
          ) : (
            <div className="divide-y divide-white/5 max-h-64 overflow-y-auto">
              {overview.followUpTasks.map((t) => (
                <div key={t.id} className="py-2.5 flex items-center justify-between gap-3">
                  <button
                    onClick={() => toggleTask(t)}
                    className="flex items-start gap-2.5 text-left cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={t.status === 'completed'}
                      readOnly
                      className="mt-0.5 accent-[#8B45FF]"
                    />
                    <div>
                      <p className={`text-xs font-medium ${t.status === 'completed' ? 'line-through text-gray-500' : 'text-white'}`}>
                        {t.title}
                      </p>
                      <p className="text-[11px] text-gray-400 tabular-nums">
                        Due {t.dueDate} · {t.assignedTo}
                      </p>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inbound Website Enquiries */}
        <div className="p-5 rounded-xl bg-[#0e0e14] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-display font-bold text-white">Public Website Enquiries</h3>
            <span className="text-xs text-gray-400 tabular-nums">{enquiries.length} recorded</span>
          </div>

          {enquiries.length === 0 ? (
            <p className="text-xs text-gray-400 py-8 text-center border border-dashed border-white/10 rounded-lg">
              No public project briefs submitted yet.
            </p>
          ) : (
            <div className="divide-y divide-white/5 max-h-64 overflow-y-auto">
              {enquiries.map((eq) => (
                <div key={eq.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-white">
                      {eq.name} · <span className="text-gray-400 font-normal">{eq.service}</span>
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {eq.projectDetails || 'No additional notes'} · {eq.timeline}
                    </p>
                    <p className="text-[11px] text-gray-500 font-mono tabular-nums">
                      {eq.phone} · {new Date(eq.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <a
                    href={`https://wa.me/${eq.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 text-[11px] font-semibold whitespace-nowrap shrink-0"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
