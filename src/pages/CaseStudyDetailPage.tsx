import React, { useState } from 'react';
import { CASE_STUDIES, BRAND_INFO } from '../data/agencyData';
import {
  ArrowLeft,
  ExternalLink,
  MessageCircle,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Layers,
  Sparkles,
  Smartphone,
  Eye,
} from 'lucide-react';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { Breadcrumb } from '../components/Breadcrumb';

interface CaseStudyDetailPageProps {
  projectId: string;
  onBack: () => void;
  onSelectCaseStudy?: (caseStudyId: string) => void;
  onNavigate?: (page: string) => void;
}

export const CaseStudyDetailPage: React.FC<CaseStudyDetailPageProps> = ({
  projectId,
  onBack,
  onSelectCaseStudy,
  onNavigate,
}) => {
  const project = CASE_STUDIES.find((p) => p.id === projectId) || CASE_STUDIES[0];
  const [showLivePreview, setShowLivePreview] = useState(false);

  const caseStudySchema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: `${project.title} Case Study`,
    headline: project.tagline,
    author: {
      '@type': 'Organization',
      name: 'VICTORIX',
      url: 'https://victorixglobal.vercel.app',
    },
    url: `https://victorixglobal.vercel.app/portfolio/${project.slug}`,
    description: project.summary,
  };

  return (
    <div className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <SEOHead
        title={`${project.title} Case Study – VICTORIX`}
        description={project.summary}
        canonicalPath={`/portfolio/${project.slug}`}
        schema={caseStudySchema}
      />

      <Breadcrumb
        items={[
          { label: 'Portfolio', path: 'portfolio' },
          { label: `${project.title} Case Study`, active: true },
        ]}
        onNavigate={onNavigate || onBack}
      />

      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portfolio</span>
        </button>
      </div>

      {/* Case Study Header */}
      <div className="max-w-4xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B45FF]/10 border border-[#8B45FF]/30 text-xs font-mono text-[#B68AFF]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>CLIENT CASE STUDY • {project.category}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-display font-extrabold text-white tracking-tight">
          {project.title}
        </h1>

        <p className="text-lg sm:text-2xl text-gray-300 font-medium leading-relaxed">
          {project.tagline}
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#8B45FF] hover:bg-[#7830ee] text-white font-bold text-xs px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-purple-900/30"
          >
            <span>Live Website</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            onClick={() => setShowLivePreview(!showLivePreview)}
            className="inline-flex items-center gap-2 bg-[#101014] hover:bg-[#181822] text-gray-200 hover:text-white text-xs font-semibold px-5 py-3.5 rounded-xl border border-white/10 transition-colors"
          >
            <Eye className="w-4 h-4 text-[#B68AFF]" />
            <span>{showLivePreview ? 'Hide Interactive Sandbox' : 'Toggle Live In-App Sandbox'}</span>
          </button>
        </div>
      </div>

      {/* Optional In-App Live Frame View */}
      {showLivePreview && (
        <div className="rounded-2xl border border-[#8B45FF]/40 bg-[#0a0a0f] p-4 shadow-2xl space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-400 px-2">
            <span className="font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Preview: {project.liveUrl}
            </span>
            <button
              onClick={() => setShowLivePreview(false)}
              className="hover:text-white text-xs underline"
            >
              Close Sandbox
            </button>
          </div>
          <div className="w-full h-[600px] rounded-xl overflow-hidden border border-white/10 bg-black">
            <iframe
              src={project.liveUrl}
              title={`${project.title} Live Sandbox`}
              className="w-full h-full border-none"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {project.metrics.map((m, idx) => (
          <div key={idx} className="p-6 rounded-2xl bg-[#0e0e14] border border-white/5 space-y-1">
            <p className="text-2xl sm:text-3xl font-display font-black text-white">{m.value}</p>
            <p className="text-xs text-gray-400 font-medium">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-8 space-y-10">
          {/* Challenge Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8B45FF]" />
              The Business Challenge
            </h2>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed bg-[#101014] p-6 rounded-2xl border border-white/5">
              {project.challenge}
            </p>
          </div>

          {/* Solution Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              The VICTORIX Solution &amp; Architecture
            </h2>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed bg-[#101014] p-6 rounded-2xl border border-white/5">
              {project.solution}
            </p>
          </div>

          {/* Key Implemented Capabilities */}
          <div className="space-y-4">
            <h2 className="text-2xl font-display font-bold text-white">
              Key Technical Features Delivered
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {project.keyFeatures.map((feat, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#0d0d12] border border-white/5 flex items-start gap-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-300">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Verified vs Unconfirmed Details Transparency Section */}
          {(project.verifiedProjectDetails || project.unconfirmedDetails) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {project.verifiedProjectDetails && (
                <div className="p-6 rounded-2xl bg-[#0e0e14] border border-emerald-500/25 space-y-3">
                  <h3 className="text-sm font-display font-bold text-emerald-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Verified Project Details</span>
                  </h3>
                  <ul className="space-y-2 text-xs text-gray-300">
                    {project.verifiedProjectDetails.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {project.unconfirmedDetails && (
                <div className="p-6 rounded-2xl bg-[#0e0e14] border border-amber-500/25 space-y-3">
                  <h3 className="text-sm font-display font-bold text-amber-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Information Not Confirmed</span>
                  </h3>
                  <ul className="space-y-2 text-xs text-gray-300">
                    {project.unconfirmedDetails.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-[#101014] border border-white/10 space-y-5">
            <h3 className="text-base font-display font-bold text-white">
              Project Specification
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Client</span>
                <span className="text-white font-medium">{project.client}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Category</span>
                <span className="text-white font-medium">{project.category}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Lead Engineer</span>
                <span className="text-white font-medium">Vicky Vishwakarma</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Live Status</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Active in Production
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-gray-400 block mb-2">Technologies Used:</span>
              <div className="flex flex-wrap gap-1.5">
                {project.technologies.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-mono bg-white/5 text-gray-300 px-2.5 py-1 rounded-md"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <a
              href={`${BRAND_INFO.whatsappUrl}?text=${encodeURIComponent(
                `Hi Vicky, I reviewed the ${project.title} case study on VICTORIX and would like to build a project with similar architecture.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-black font-bold text-xs py-3 px-4 rounded-xl hover:bg-[#20ba59] transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Inquire About Similar Architecture</span>
            </a>
          </div>
        </div>
      </div>

      {/* Internal Links to Other Case Studies & Portfolio */}
      <div className="pt-10 border-t border-white/10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-display font-bold text-white">
            Explore Other VICTORIX Case Studies
          </h2>
          <button
            onClick={onBack}
            className="text-xs font-semibold text-[#B68AFF] hover:text-white inline-flex items-center gap-1 cursor-pointer"
          >
            <span>All Portfolio Projects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CASE_STUDIES.filter((p) => p.id !== project.id).map((other) => (
            <div
              key={other.id}
              className="p-6 rounded-2xl bg-[#0e0e14] border border-white/10 hover:border-[#8B45FF]/40 flex flex-col justify-between gap-4 transition-colors"
            >
              <div>
                <span className="text-[11px] font-mono text-[#B68AFF] uppercase">{other.category}</span>
                <h3 className="text-lg font-display font-bold text-white mt-1">{other.title}</h3>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{other.summary}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() =>
                    onSelectCaseStudy
                      ? onSelectCaseStudy(other.id)
                      : onNavigate && onNavigate(`case-study-${other.id}`)
                  }
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#8B45FF] hover:bg-[#7830ee] px-4 py-2 rounded-lg cursor-pointer"
                >
                  <span>Read Case Study</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <a
                  href={other.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-gray-300 hover:text-white bg-white/5 px-3.5 py-2 rounded-lg border border-white/10"
                >
                  <span>Live Website</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#B68AFF]" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
