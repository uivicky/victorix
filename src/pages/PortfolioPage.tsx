import React from 'react';
import { CASE_STUDIES, BRAND_INFO } from '../data/agencyData';
import { ExternalLink, ArrowRight, MessageCircle, Sparkles, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';

interface PortfolioPageProps {
  onSelectCaseStudy: (caseStudyId: string) => void;
}

export const PortfolioPage: React.FC<PortfolioPageProps> = ({ onSelectCaseStudy }) => {
  return (
    <div className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <SEOHead
        title="Portfolio & Case Studies – Real Live Projects by VICTORIX"
        description="Verify live web platforms built by VICTORIX including Little World School, FixDesk, and IT SUPPORT. Real deployments with transparent verification disclosures."
        canonicalPath="/portfolio"
      />

      <div className="max-w-3xl space-y-4">
        <span className="text-xs font-mono uppercase tracking-widest text-[#B68AFF] font-bold">
          Proven Engineering
        </span>
        <h1 className="text-4xl sm:text-6xl font-display font-extrabold text-white tracking-tight">
          Real Websites. Real Clients. Real Live Deployments.
        </h1>
        <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
          We believe in verifiable proof. Explore actual production applications designed, coded, and deployed by VICTORIX. Click through to open and inspect each project in real-time.
        </p>
      </div>

      <div className="space-y-12">
        {CASE_STUDIES.map((project, index) => (
          <div
            key={project.id}
            className="rounded-3xl bg-[#0e0e14] border border-white/10 hover:border-[#8B45FF]/40 p-8 sm:p-12 transition-all duration-300 shadow-2xl space-y-8"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-6">
              <div>
                <span className="text-xs font-mono uppercase text-[#B68AFF] font-bold tracking-wider">
                  Case Study 0{index + 1} • {project.category}
                </span>
                <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mt-1">
                  {project.title}
                </h2>
                <p className="text-sm text-gray-400 mt-1 font-medium">{project.tagline}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#1a1628] hover:bg-[#251f3a] text-white font-bold text-xs px-5 py-3 rounded-xl border border-[#8B45FF]/40 transition-all hover:scale-105 cursor-pointer"
                >
                  <span>Live Website</span>
                  <ExternalLink className="w-4 h-4 text-[#B68AFF]" />
                </a>

                <button
                  onClick={() => onSelectCaseStudy(project.id)}
                  className="inline-flex items-center gap-2 bg-[#8B45FF] hover:bg-[#7830ee] text-white font-semibold text-xs px-5 py-3 rounded-xl transition-all hover:scale-105 cursor-pointer"
                >
                  <span>Full Case Study</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content & Metrics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h3 className="text-xs font-mono uppercase text-gray-400 font-bold mb-1">
                    The Challenge &amp; Solution
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed">{project.summary}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Core Technical Implementations:
                  </h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-gray-300">
                    {project.keyFeatures.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2">
                  <span className="text-xs text-gray-500 font-mono block mb-2">Technologies Used:</span>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-xs font-mono bg-[#050505] text-gray-300 px-3 py-1 rounded-lg border border-white/5"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Metrics & Verified Badges */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-6 rounded-2xl bg-[#050505] border border-white/5 space-y-4">
                  <span className="text-xs font-mono uppercase text-[#B68AFF] font-bold">
                    Performance &amp; Engineering Metrics
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    {project.metrics.map((m, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#101014] border border-white/5">
                        <p className="text-xl font-display font-bold text-white">{m.value}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{m.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#101014] border border-emerald-500/20 text-xs text-gray-300 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Verified Live Deployment</span>
                  </div>
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#B68AFF] hover:underline font-mono text-[11px] flex items-center gap-1"
                  >
                    <span>{project.liveUrl.replace('https://', '')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {project.unconfirmedDetails && project.unconfirmedDetails.length > 0 && (
                  <div className="p-4 rounded-xl bg-[#050505] border border-amber-500/20 text-[11px] text-amber-200/90 space-y-1">
                    <p className="font-semibold text-amber-300">Scope &amp; Verification Disclosure</p>
                    <p className="text-gray-400 leading-relaxed">
                      Technical features listed above were directly verified on the live deployment. Business outcomes, external client claims, traffic, and revenue remain undisclosed.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Want to build a similar project? */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#101014] to-[#181824] border border-[#8B45FF]/30 text-center space-y-6">
        <h3 className="text-2xl sm:text-3xl font-display font-bold text-white">
          Inspired by Little World School, FixDesk, or IT SUPPORT?
        </h3>
        <p className="text-gray-400 text-xs sm:text-sm max-w-xl mx-auto">
          We can architect a tailored digital platform for your business with the same high standards of speed, reliability, and mobile responsiveness.
        </p>
        <div className="flex justify-center">
          <a
            href={`${BRAND_INFO.whatsappUrl}?text=${encodeURIComponent(
              "Hi Vicky, I looked through your portfolio and would like to build a new website for my company."
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] text-black font-bold text-xs px-8 py-3.5 rounded-xl hover:bg-[#20ba59] transition-all"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Discuss Your Project on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
