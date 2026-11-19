import React, { useState, useEffect } from 'react';
import { BusinessLead, StaticTemplateCategory } from '../../types';
import {
  FileCode2,
  Download,
  Monitor,
  Smartphone,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  AlertTriangle,
} from 'lucide-react';

const TEMPLATE_CATEGORIES: StaticTemplateCategory[] = [
  'Restaurants',
  'Clinics',
  'Schools',
  'Coaching Institutes',
  'Salons',
  'Real Estate',
  'Local Shops',
  'Consultants',
  'Small Businesses',
];

function mapLeadCategoryToTemplate(raw: string): StaticTemplateCategory {
  const s = raw.toLowerCase();
  if (s.includes('restaur') || s.includes('cafe') || s.includes('food')) return 'Restaurants';
  if (s.includes('clinic') || s.includes('health') || s.includes('doctor') || s.includes('dent')) return 'Clinics';
  if (s.includes('school')) return 'Schools';
  if (s.includes('coach') || s.includes('tutor')) return 'Coaching Institutes';
  if (s.includes('salon') || s.includes('beauty')) return 'Salons';
  if (s.includes('real estate') || s.includes('property')) return 'Real Estate';
  if (s.includes('shop') || s.includes('retail') || s.includes('store')) return 'Local Shops';
  if (s.includes('consult')) return 'Consultants';
  return 'Small Businesses';
}

interface GeneratedBundle {
  indexHtml: string;
  sitemapXml: string;
  robotsTxt: string;
  deployInstructions: string;
  subdomainSlug: string;
  filesManifest: string[];
}

interface AdminWebFactoryPanelProps {
  mode: 'demo' | 'factory';
  leads: BusinessLead[];
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  onRefresh: () => void;
}

export const AdminWebFactoryPanel: React.FC<AdminWebFactoryPanelProps> = ({
  mode,
  leads,
  authFetch,
  onRefresh,
}) => {
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState<StaticTemplateCategory>('Restaurants');
  const [city, setCity] = useState('Mumbai, Maharashtra');
  const [servicesText, setServicesText] = useState('');
  const [publicPhone, setPublicPhone] = useState('');
  const [accentColor, setAccentColor] = useState('#7C3AED');
  const [targetSubdomain, setTargetSubdomain] = useState('');
  const [isDemoProposal, setIsDemoProposal] = useState(mode === 'demo');

  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [bundle, setBundle] = useState<GeneratedBundle | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [copiedDeploy, setCopiedDeploy] = useState(false);

  useEffect(() => {
    setIsDemoProposal(mode === 'demo');
  }, [mode]);

  const handleLoadFromLead = (leadId: string) => {
    setSelectedLeadId(leadId);
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;
    setBusinessName(lead.businessName);
    setIndustry(mapLeadCategoryToTemplate(lead.category));
    setCity(lead.city || 'Mumbai, Maharashtra');
    setPublicPhone(lead.phone || '');
    setTargetSubdomain(
      lead.businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    );
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      setErrorMsg('Business Name is required.');
      return;
    }
    setGenerating(true);
    setErrorMsg('');
    try {
      const res = await authFetch('/api/factory/generate', {
        method: 'POST',
        body: JSON.stringify({
          businessName: businessName.trim(),
          industry,
          city: city.trim() || 'Mumbai, Maharashtra',
          services: servicesText,
          publicContactPhone: publicPhone.trim() || undefined,
          accentColor,
          targetSubdomain: targetSubdomain.trim() || undefined,
          isDemoProposal,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Generation failed');
      } else {
        setBundle(data.bundle);
        onRefresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error');
    } finally {
      setGenerating(false);
    }
  };

  const downloadFile = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyInstructions = () => {
    if (!bundle) return;
    navigator.clipboard.writeText(bundle.deployInstructions);
    setCopiedDeploy(true);
    setTimeout(() => setCopiedDeploy(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Architecture Banner */}
      <div className="p-5 rounded-xl bg-[#0e0e14] border border-white/10 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-display font-bold text-white flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-[#B68AFF]" />
            <span>
              {mode === 'demo'
                ? 'Website Demo Proposal Generator (Watermarked)'
                : 'Client Static Website Factory (Cloudflare Pages Free)'}
            </span>
          </h2>
          <span className="px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold">
            Zero Database Required (Static HTML5 + Schema + WhatsApp)
          </span>
        </div>
        <p className="text-xs text-gray-400">
          Generates complete static client websites starting from our ₹5,999 Starter Business Static architecture. Outputs clean <code className="text-[#B68AFF]">index.html</code>, <code className="text-[#B68AFF]">sitemap.xml</code>, and <code className="text-[#B68AFF]">robots.txt</code> without D1, KV, or PostgreSQL. Deploy only after client approval.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Builder Form */}
        <form
          onSubmit={handleGenerate}
          className="lg:col-span-5 p-5 rounded-xl bg-[#0e0e14] border border-white/10 space-y-4 text-xs"
        >
          {leads.length > 0 && (
            <div>
              <label className="text-gray-400 block mb-1">Prefill from Discovered CRM Lead (Optional)</label>
              <select
                value={selectedLeadId}
                onChange={(e) => handleLoadFromLead(e.target.value)}
                className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-white"
              >
                <option value="">-- Select a business lead --</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.businessName} ({l.city})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-gray-300 font-semibold block mb-1">Business Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Anand Care Clinic"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-300 font-semibold block mb-1">Industry Template *</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value as StaticTemplateCategory)}
                className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-white"
              >
                {TEMPLATE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-gray-300 font-semibold block mb-1">City / Locality</label>
              <input
                type="text"
                placeholder="Mumbai, Maharashtra"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-gray-300 font-semibold block mb-1">
              Services (comma-separated, optional)
            </label>
            <input
              type="text"
              placeholder="Leave blank for smart industry presets"
              value={servicesText}
              onChange={(e) => setServicesText(e.target.value)}
              className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-300 font-semibold block mb-1">Public WhatsApp Phone</label>
              <input
                type="text"
                placeholder="Defaults to VICTORIX if proposal"
                value={publicPhone}
                onChange={(e) => setPublicPhone(e.target.value)}
                className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-gray-300 font-semibold block mb-1">Pages.dev Slug</label>
              <input
                type="text"
                placeholder="business-name"
                value={targetSubdomain}
                onChange={(e) => setTargetSubdomain(e.target.value)}
                className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <label className="text-gray-300 font-semibold">Accent Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-8 h-8 rounded bg-transparent border border-white/10 cursor-pointer"
              />
              <span className="font-mono text-gray-300">{accentColor}</span>
            </div>
          </div>

          <label className="flex items-start gap-2.5 p-3 rounded-lg bg-[#050505] border border-white/10 cursor-pointer">
            <input
              type="checkbox"
              checked={isDemoProposal}
              onChange={(e) => setIsDemoProposal(e.target.checked)}
              className="mt-0.5 accent-[#8B45FF]"
            />
            <span className="text-gray-300 leading-relaxed">
              <strong className="text-white">Proposal Demo Watermark:</strong> Clearly labels preview as a proposal demo rather than an official published client site.
            </span>
          </label>

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-500/30 text-red-300">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={generating}
            className="w-full py-2.5 px-4 rounded-lg bg-[#8B45FF] hover:bg-[#7830ee] disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{generating ? 'Generating Bundle...' : 'Generate Static Website Bundle'}</span>
          </button>
        </form>

        {/* Live Responsive Preview & Cloudflare Pages Output */}
        <div className="lg:col-span-7 space-y-4">
          {!bundle ? (
            <div className="h-full min-h-[400px] rounded-xl bg-[#0e0e14] border border-dashed border-white/10 flex flex-col items-center justify-center p-8 text-center space-y-2">
              <FileCode2 className="w-8 h-8 text-gray-500" />
              <p className="text-sm font-semibold text-white">Static Website Preview Ready</p>
              <p className="text-xs text-gray-400 max-w-sm">
                Fill out the business details on the left and click Generate to inspect the responsive HTML5 build, sitemap, robots.txt, and Cloudflare Pages CLI instructions.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#0e0e14] border border-white/10 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      previewDevice === 'desktop'
                        ? 'bg-[#8B45FF] text-white'
                        : 'bg-white/5 text-gray-300'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Desktop</span>
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      previewDevice === 'mobile'
                        ? 'bg-[#8B45FF] text-white'
                        : 'bg-white/5 text-gray-300'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile (375px)</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => downloadFile('index.html', bundle.indexHtml, 'text/html')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>index.html</span>
                  </button>
                  <button
                    onClick={() => downloadFile('sitemap.xml', bundle.sitemapXml, 'application/xml')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>sitemap.xml</span>
                  </button>
                  <button
                    onClick={() => downloadFile('robots.txt', bundle.robotsTxt, 'text/plain')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>robots.txt</span>
                  </button>
                </div>
              </div>

              {/* Iframe Preview */}
              <div className="bg-[#050505] border border-white/10 rounded-xl p-2 flex justify-center">
                <iframe
                  title={`Static Preview for ${bundle.subdomainSlug}`}
                  srcDoc={bundle.indexHtml}
                  sandbox="allow-popups"
                  className={`bg-white rounded-lg transition-all duration-200 ${
                    previewDevice === 'mobile' ? 'w-[375px] h-[520px]' : 'w-full h-[520px]'
                  }`}
                />
              </div>

              {/* Cloudflare Pages Deployment & Ownership Instructions */}
              <div className="p-4 rounded-xl bg-[#050505] border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Cloudflare Pages Free Deployment ({bundle.subdomainSlug}.pages.dev)</span>
                  </span>
                  <button
                    onClick={handleCopyInstructions}
                    className="inline-flex items-center gap-1 text-[11px] text-[#B68AFF] hover:text-white cursor-pointer"
                  >
                    {copiedDeploy ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedDeploy ? 'Copied' : 'Copy CLI Steps'}</span>
                  </button>
                </div>
                <pre className="text-[11px] font-mono text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {bundle.deployInstructions}
                </pre>
                {!isDemoProposal && (
                  <p className="text-[11px] text-amber-300 flex items-center gap-1.5 pt-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Deploy only with explicit client authorization. Attach client&apos;s own domain for full ownership.
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
