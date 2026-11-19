import React, { useState } from 'react';
import {
  BusinessLead,
  CrmPipelineStage,
  WebsiteAudit,
  LeadScore,
} from '../../types';
import {
  Search,
  Globe,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Download,
  ExternalLink,
  MessageCircle,
  RefreshCw,
  FileText,
  X,
} from 'lucide-react';

const CRM_STAGES: CrmPipelineStage[] = [
  'new_lead',
  'analysed',
  'reviewed',
  'contacted',
  'interested',
  'meeting_scheduled',
  'proposal_sent',
  'negotiation',
  'won',
  'lost',
];

interface AdminBusinessPanelProps {
  mode: 'hunter' | 'auditor' | 'crm';
  leads: BusinessLead[];
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  onRefresh: () => void;
}

export const AdminBusinessPanel: React.FC<AdminBusinessPanelProps> = ({
  mode,
  leads,
  authFetch,
  onRefresh,
}) => {
  // Discovery state
  const [priority, setPriority] = useState<'Priority 1: Mumbai' | 'Priority 2: Maharashtra' | 'Priority 3: India'>('Priority 1: Mumbai');
  const [discovering, setDiscovering] = useState(false);
  const [discoveryMsg, setDiscoveryMsg] = useState<string>('');

  // Standalone Auditor / Add Lead state
  const [auditUrl, setAuditUrl] = useState('');
  const [auditName, setAuditName] = useState('');
  const [auditIndustry, setAuditIndustry] = useState('Restaurants');
  const [auditCity, setAuditCity] = useState('Mumbai, Maharashtra');
  const [auditPhone, setAuditPhone] = useState('');
  const [auditing, setAuditing] = useState(false);
  const [auditError, setAuditError] = useState('');
  const [previewAudit, setPreviewAudit] = useState<{
    audit: WebsiteAudit;
    score: LeadScore;
    recommendedService: string;
  } | null>(null);

  // CRM Filters & Selected Lead Modal
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [tierFilter, setTierFilter] = useState('All');
  const [selectedLead, setSelectedLead] = useState<BusinessLead | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [actionError, setActionError] = useState('');

  const handleDiscoverBusinesses = async () => {
    setDiscovering(true);
    setDiscoveryMsg('');
    try {
      const res = await authFetch('/api/discovery/business', {
        method: 'POST',
        body: JSON.stringify({ priority }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        const r = data.result;
        if (r.error) {
          setDiscoveryMsg(`Source notice (${r.sourceStatus}): ${r.error}`);
        } else {
          setDiscoveryMsg(
            `Inspected ${r.evaluated} real businesses from OpenStreetMap Overpass API. Added ${r.added} new leads, skipped ${r.duplicatesSkipped} duplicates.`
          );
        }
        onRefresh();
      } else {
        setDiscoveryMsg(data.error || 'Discovery could not complete');
      }
    } catch (err: any) {
      setDiscoveryMsg(err.message || 'Network error');
    } finally {
      setDiscovering(false);
    }
  };

  const handlePreviewAudit = async (saveToCrm: boolean) => {
    if (!auditUrl.trim()) return;
    setAuditing(true);
    setAuditError('');
    try {
      const endpoint = saveToCrm ? '/api/leads/audit' : '/api/audit/preview';
      const res = await authFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          url: auditUrl.trim(),
          businessName: auditName.trim() || undefined,
          category: auditIndustry,
          city: auditCity,
          phone: auditPhone.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuditError(data.error || 'Audit blocked or failed');
      } else if (saveToCrm && data.lead) {
        setSelectedLead(data.lead);
        setAuditUrl('');
        setAuditName('');
        onRefresh();
      } else {
        setPreviewAudit({
          audit: data.audit,
          score: data.score,
          recommendedService: data.recommendedService,
        });
      }
    } catch (err: any) {
      setAuditError(err.message);
    } finally {
      setAuditing(false);
    }
  };

  const handleStageUpdate = async (leadId: string, updates: any) => {
    setActionError('');
    const res = await authFetch(`/api/leads/${leadId}/stage`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) {
      setActionError(data.error || 'Failed to update stage');
      return;
    }
    if (selectedLead?.id === leadId) setSelectedLead(data.lead);
    onRefresh();
  };

  const handleApproveProposal = async (proposalId: string, status: 'approved' | 'sent') => {
    const res = await authFetch(`/api/proposals/${proposalId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reviewedBy: 'Vicky Vishwakarma' }),
    });
    const data = await res.json();
    if (data.success && data.lead) {
      setSelectedLead(data.lead);
      onRefresh();
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !noteInput.trim()) return;
    const res = await authFetch(`/api/leads/${selectedLead.id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ text: noteInput.trim(), author: 'Vicky' }),
    });
    const data = await res.json();
    if (data.success && data.lead) {
      setSelectedLead(data.lead);
      setNoteInput('');
      onRefresh();
    }
  };

  const handleDownloadCsv = async () => {
    const res = await authFetch('/api/leads/export/csv');
    if (!res.ok) return;
    const text = await res.text();
    const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'victorix_business_crm.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLeads = leads.filter((l) => {
    const matchSearch =
      !search ||
      l.businessName.toLowerCase().includes(search.toLowerCase()) ||
      l.city.toLowerCase().includes(search.toLowerCase()) ||
      l.category.toLowerCase().includes(search.toLowerCase()) ||
      l.websiteUrl.toLowerCase().includes(search.toLowerCase());
    const matchStage = stageFilter === 'All' || l.stage === stageFilter;
    const matchTier = tierFilter === 'All' || l.score?.tier === tierFilter;
    return matchSearch && matchStage && matchTier;
  });

  return (
    <div className="space-y-6">
      {/* Discovery Controls (shown in Hunter mode) */}
      {mode === 'hunter' && (
        <div className="p-5 rounded-xl bg-[#0e0e14] border border-white/10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-display font-bold text-white">
                Business Client Discovery Engine (OpenStreetMap Public Directory)
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Discovers real Indian businesses across restaurants, clinics, schools, salons, coaching, real estate &amp; shops, then runs safe HTTP audits.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
              >
                <option value="Priority 1: Mumbai">Priority 1: Mumbai</option>
                <option value="Priority 2: Maharashtra">Priority 2: Maharashtra</option>
                <option value="Priority 3: India">Priority 3: Other Indian Cities</option>
              </select>
              <button
                onClick={handleDiscoverBusinesses}
                disabled={discovering}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#8B45FF] hover:bg-[#7830ee] disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${discovering ? 'animate-spin' : ''}`} />
                <span>{discovering ? 'Querying Overpass...' : 'Discover Real Businesses'}</span>
              </button>
            </div>
          </div>

          {discoveryMsg && (
            <div className="p-3 rounded-lg bg-[#050505] border border-white/10 text-xs text-gray-200">
              {discoveryMsg}
            </div>
          )}
        </div>
      )}

      {/* Safe Website Opportunity Auditor (shown in Auditor and Hunter modes) */}
      {(mode === 'auditor' || mode === 'hunter') && (
        <div className="p-5 rounded-xl bg-[#0e0e14] border border-white/10 space-y-4">
          <div>
            <h2 className="text-base font-display font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#B68AFF]" />
              <span>Safe Read-Only Website Opportunity Auditor</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              SSRF-hardened (blocks private IPs, localhost, and unsafe redirects; 5s timeout, 1.5MB cap). Measures real HTTP response, headers, viewport, H1/H2, alt text &amp; broken links.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <input
              type="url"
              placeholder="https://example-business.in"
              value={auditUrl}
              onChange={(e) => setAuditUrl(e.target.value)}
              className="lg:col-span-2 bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
            />
            <input
              type="text"
              placeholder="Business Name (optional)"
              value={auditName}
              onChange={(e) => setAuditName(e.target.value)}
              className="bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
            />
            <select
              value={auditIndustry}
              onChange={(e) => setAuditIndustry(e.target.value)}
              className="bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
            >
              {[
                'Restaurants',
                'Clinics',
                'Doctors',
                'Schools',
                'Coaching Institutes',
                'Salons',
                'Real Estate',
                'Local Retailers',
                'Consultants',
                'Small Businesses',
              ].map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="City (e.g. Mumbai)"
              value={auditCity}
              onChange={(e) => setAuditCity(e.target.value)}
              className="bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Public Phone (optional, if listed on site)"
              value={auditPhone}
              onChange={(e) => setAuditPhone(e.target.value)}
              className="bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-xs text-white w-64"
            />
            <button
              onClick={() => handlePreviewAudit(false)}
              disabled={auditing || !auditUrl.trim()}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 text-xs font-semibold text-white cursor-pointer"
            >
              {auditing ? 'Inspecting...' : 'Run Read-Only Audit'}
            </button>
            <button
              onClick={() => handlePreviewAudit(true)}
              disabled={auditing || !auditUrl.trim()}
              className="px-4 py-2 rounded-lg bg-[#8B45FF] hover:bg-[#7830ee] disabled:opacity-40 text-xs font-semibold text-white cursor-pointer"
            >
              Audit &amp; Save to CRM
            </button>
          </div>

          {auditError && (
            <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{auditError}</span>
            </div>
          )}

          {previewAudit && (
            <div className="p-4 rounded-xl bg-[#050505] border border-white/10 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                <div className="text-xs font-semibold text-white">
                  Measured Audit: <span className="text-[#B68AFF]">{previewAudit.audit.url}</span>
                </div>
                <div className="text-xs font-mono tabular-nums text-gray-300">
                  HTTP {previewAudit.audit.httpStatus} · {previewAudit.audit.responseTimeMs}ms · Score: {previewAudit.score.totalScore}/100 ({previewAudit.score.tier})
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs tabular-nums">
                <div>HTTPS: <strong>{previewAudit.audit.isHttps ? 'Yes' : 'No'}</strong></div>
                <div>Viewport: <strong>{previewAudit.audit.hasViewportMeta ? 'Yes' : 'Missing'}</strong></div>
                <div>H1 / H2: <strong>{previewAudit.audit.h1Count} / {previewAudit.audit.h2Count}</strong></div>
                <div>Missing Img Alt: <strong>{previewAudit.audit.altTagsMissing}</strong></div>
                <div>Canonical: <strong>{previewAudit.audit.canonicalPresent ? 'Yes' : 'No'}</strong></div>
                <div>Sitemap / Robots: <strong>{previewAudit.audit.sitemapDetected ? 'Yes' : 'No'} / {previewAudit.audit.robotsDetected ? 'Yes' : 'No'}</strong></div>
                <div>Security Headers: <strong>{previewAudit.audit.securityHeadersScore}%</strong></div>
                <div>Broken Links: <strong>{previewAudit.audit.brokenLinksFound}/{previewAudit.audit.brokenLinksChecked}</strong></div>
              </div>
              {previewAudit.audit.observedIssues.length > 0 && (
                <div className="text-xs text-amber-300 space-y-1">
                  <p className="font-semibold">Observed Issues:</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-gray-300">
                    {previewAudit.audit.observedIssues.map((iss, i) => (
                      <li key={i}>{iss}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Leads / CRM Pipeline Table */}
      <div className="p-5 rounded-xl bg-[#0e0e14] border border-white/10 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-display font-bold text-white">
              {mode === 'crm' ? 'Client CRM Pipeline (Starting ₹5,999)' : 'Discovered & Audited Business Leads'}
            </h2>
            <p className="text-xs text-gray-400">
              Showing {filteredLeads.length} of {leads.length} verified records. Human approval mandatory prior to WhatsApp outreach.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search business or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#050505] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white"
              />
            </div>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-[#050505] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
            >
              <option value="All">All Tiers</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="bg-[#050505] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
            >
              <option value="All">All Stages</option>
              {CRM_STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {actionError && (
          <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200">
            {actionError}
          </div>
        )}

        {filteredLeads.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-white/10 rounded-xl space-y-2">
            <Globe className="w-6 h-6 text-gray-500 mx-auto" />
            <p className="text-xs text-gray-300 font-medium">No business leads stored yet.</p>
            <p className="text-[11px] text-gray-400">
              Use "Discover Real Businesses" above (OpenStreetMap) or enter a live URL in the Website Auditor to inspect a business website.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 text-gray-400">
                  <th className="py-2.5 px-3 font-medium">Business &amp; Location</th>
                  <th className="py-2.5 px-3 font-medium">Website &amp; Source</th>
                  <th className="py-2.5 px-3 font-medium text-right">Score</th>
                  <th className="py-2.5 px-3 font-medium">CRM Stage</th>
                  <th className="py-2.5 px-3 font-medium text-right">Deal (INR)</th>
                  <th className="py-2.5 px-3 font-medium">Owner</th>
                  <th className="py-2.5 px-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-3">
                      <p className="font-semibold text-white">{lead.businessName}</p>
                      <p className="text-[11px] text-gray-400">
                        {lead.category} · {lead.city}
                      </p>
                    </td>
                    <td className="py-3 px-3">
                      <a
                        href={lead.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#B68AFF] hover:underline inline-flex items-center gap-1"
                      >
                        <span className="truncate max-w-[180px]">{lead.websiteUrl}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                      <p className="text-[11px] text-gray-500">
                        {lead.source} · {lead.audit?.httpStatus ? `HTTP ${lead.audit.httpStatus} (${lead.audit.responseTimeMs}ms)` : lead.audit?.auditType}
                      </p>
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums">
                      <span className="font-bold text-white">{lead.score?.totalScore ?? 0}</span>
                      <span className="text-gray-400">/100</span>
                      <p className="text-[11px] text-gray-400">{lead.score?.tier || 'Low'}</p>
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={lead.stage}
                        onChange={(e) => handleStageUpdate(lead.id, { stage: e.target.value })}
                        className="bg-[#050505] border border-white/10 rounded px-2 py-1 text-[11px] text-white"
                      >
                        {CRM_STAGES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums font-medium text-white">
                      ₹{(lead.dealValue || 5999).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={lead.assignedTo}
                        onChange={(e) => handleStageUpdate(lead.id, { assignedTo: e.target.value })}
                        className="bg-[#050505] border border-white/10 rounded px-2 py-1 text-[11px] text-white"
                      >
                        <option value="Vicky Vishwakarma">Vicky</option>
                        <option value="Abhishek">Abhishek</option>
                      </select>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#8B45FF]/20 hover:bg-[#8B45FF]/30 text-[#B68AFF] text-[11px] font-semibold cursor-pointer"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lead Detail Drawer / Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0e0e14] border border-white/15 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-display font-bold text-white">{selectedLead.businessName}</h3>
                <p className="text-xs text-gray-400">
                  {selectedLead.category} · {selectedLead.city} · Source: {selectedLead.sourceUrl || selectedLead.source}
                </p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Score Breakdown */}
            {selectedLead.score && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">Lead Score Breakdown ({selectedLead.score.totalScore}/100)</span>
                  <span className="text-gray-400">{selectedLead.score.tier} Priority</span>
                </div>
                <p className="text-xs text-gray-400">{selectedLead.score.explanation}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedLead.score.factors.map((f, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-[#050505] border border-white/5 text-xs">
                      <div className="flex justify-between font-medium text-white tabular-nums">
                        <span>{f.label}</span>
                        <span>
                          {f.score}/{f.max}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">{f.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deal Value & Follow-up */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-gray-400 block mb-1">Deal Value (min ₹5,999)</label>
                <input
                  type="number"
                  min={5999}
                  value={selectedLead.dealValue || 5999}
                  onChange={(e) =>
                    handleStageUpdate(selectedLead.id, { dealValue: Number(e.target.value) })
                  }
                  className="w-full bg-[#050505] border border-white/10 rounded-lg px-2.5 py-1.5 text-white tabular-nums"
                />
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Follow-up Date</label>
                <input
                  type="date"
                  value={selectedLead.followUpDate?.slice(0, 10) || ''}
                  onChange={(e) => handleStageUpdate(selectedLead.id, { followUpDate: e.target.value })}
                  className="w-full bg-[#050505] border border-white/10 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Outreach Human Approval</label>
                <button
                  onClick={() =>
                    handleStageUpdate(selectedLead.id, {
                      humanApprovedForOutreach: !selectedLead.humanApprovedForOutreach,
                    })
                  }
                  className={`w-full py-1.5 px-3 rounded-lg font-semibold text-xs cursor-pointer ${
                    selectedLead.humanApprovedForOutreach
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-white/5 text-gray-300 border border-white/10'
                  }`}
                >
                  {selectedLead.humanApprovedForOutreach ? 'Approved for Outreach' : 'Approve Manually'}
                </button>
              </div>
            </div>

            {/* Human-Approved WhatsApp Proposal Draft */}
            {selectedLead.proposal && (
              <div className="p-4 rounded-xl bg-[#050505] border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">WhatsApp Proposal Draft ({selectedLead.proposal.status})</span>
                  {selectedLead.proposal.status !== 'approved' && selectedLead.proposal.status !== 'sent' && (
                    <button
                      onClick={() => handleApproveProposal(selectedLead.proposal!.id, 'approved')}
                      className="px-3 py-1 rounded-lg bg-[#8B45FF] text-white font-semibold cursor-pointer"
                    >
                      Approve Draft
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-300 whitespace-pre-wrap">{selectedLead.proposal.whatsappMessage}</p>
                {selectedLead.phone && selectedLead.humanApprovedForOutreach ? (
                  <a
                    href={`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      selectedLead.proposal.whatsappMessage
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleApproveProposal(selectedLead.proposal!.id, 'sent')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#25D366] text-black text-xs font-bold"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Open Approved WhatsApp Chat</span>
                  </a>
                ) : (
                  <p className="text-[11px] text-amber-300">
                    {selectedLead.phone
                      ? 'Human approval required before opening WhatsApp outreach.'
                      : 'No public WhatsApp phone on record; verify contact manually on website.'}
                  </p>
                )}
              </div>
            )}

            {/* Notes */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-white">CRM Notes</h4>
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add note (Vicky / Abhishek)..."
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  className="flex-1 bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#8B45FF] text-white text-xs font-semibold cursor-pointer"
                >
                  Save Note
                </button>
              </form>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {selectedLead.notes.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-lg bg-[#050505] text-xs text-gray-300">
                    <span className="text-[#B68AFF] font-semibold">{n.author}</span> ·{' '}
                    <span className="text-gray-500 text-[11px]">{new Date(n.createdAt).toLocaleString()}</span>
                    <p className="mt-0.5">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
