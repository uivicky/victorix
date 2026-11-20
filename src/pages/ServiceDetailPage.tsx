import React from 'react';
import { SERVICES, BRAND_INFO, CASE_STUDIES } from '../data/agencyData';
import {
  CheckCircle2,
  ArrowRight,
  MessageCircle,
  Clock,
  Sparkles,
  Layers,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { Breadcrumb } from '../components/Breadcrumb';

interface ServiceDetailPageProps {
  slug: string;
  onBack: () => void;
  onNavigateToCaseStudy: (caseStudyId: string) => void;
  onNavigate?: (page: string) => void;
}

export const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({
  slug,
  onBack,
  onNavigateToCaseStudy,
  onNavigate,
}) => {
  const service = SERVICES.find((s) => s.slug === slug) || SERVICES[0];

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: service.title,
    provider: {
      '@type': 'Organization',
      name: 'VICTORIX',
      url: 'https://victorixglobal.vercel.app',
    },
    description: service.fullDesc,
    areaServed: {
      '@type': 'Country',
      name: 'India',
    },
  };

  return (
    <div className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <SEOHead
        title={`${service.title} – VICTORIX Agency`}
        description={service.shortDesc}
        canonicalPath={`/services/${service.slug}`}
        schema={serviceSchema}
      />

      <Breadcrumb
        items={[
          { label: 'Services', path: 'services' },
          { label: service.title, active: true },
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
          <span>Back to All Services</span>
        </button>
      </div>

      {/* Main Service Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B45FF]/10 border border-[#8B45FF]/30 text-xs font-mono text-[#B68AFF]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SPECIALIZED SERVICE</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-display font-extrabold text-white tracking-tight">
            {service.title}
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 leading-relaxed font-normal">
            {service.fullDesc}
          </p>

          {/* Ideal For Box */}
          <div className="p-5 rounded-2xl bg-[#101014] border border-[#8B45FF]/20 text-xs sm:text-sm text-gray-300">
            <span className="font-bold text-white block mb-1 text-xs uppercase tracking-wider text-[#B68AFF]">
              Ideal For:
            </span>
            <p>{service.idealFor}</p>
          </div>

          {/* Key Deliverables */}
          <div className="space-y-4 pt-4">
            <h2 className="text-2xl font-display font-bold text-white">
              What Is Included In This Package
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {service.deliverables.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#0d0d12] border border-white/5 flex items-start gap-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tangible Business Advantages */}
          <div className="space-y-4 pt-4">
            <h2 className="text-2xl font-display font-bold text-white">
              Engineering Advantages
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {service.benefits.map((benefit, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#0d0d12] border border-white/5 flex items-start gap-3"
                >
                  <span className="w-2 h-2 rounded-full bg-[#8B45FF] mt-2 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sticky Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl bg-[#101014] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
            <h3 className="text-xl font-display font-bold text-white">
              Project Quick Facts
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-gray-400">Typical Timeline</span>
                <span className="text-white font-mono font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#8B45FF]" />
                  {service.typicalTimeline}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-gray-400">Lead Architect</span>
                <span className="text-white font-semibold">Vicky Vishwakarma</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-gray-400">Implementation</span>
                <span className="text-white font-semibold">Abhishek</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-gray-400">Communication</span>
                <span className="text-emerald-400 font-semibold">Official WhatsApp</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-gray-400 block">Technology Stack:</span>
              <div className="flex flex-wrap gap-1.5">
                {service.techStack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-mono bg-white/5 text-gray-300 px-2.5 py-1 rounded-md"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <a
              href={`${BRAND_INFO.whatsappUrl}?text=${encodeURIComponent(
                `Hi Vicky, I'm interested in ${service.title} for my project. Can we discuss scope and quote?`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-black font-bold text-xs py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Discuss {service.title} on WhatsApp</span>
            </a>
          </div>

          {/* Relevant Live Work */}
          <div className="p-6 rounded-2xl bg-[#0e0e14] border border-white/5 space-y-3">
            <span className="text-xs font-mono uppercase text-[#B68AFF]">Verified Proof</span>
            <h4 className="text-sm font-bold text-white">Relevant Live VICTORIX Work</h4>
            <p className="text-xs text-gray-400">
              Inspect how we applied these principles to real client applications:
            </p>
            <div className="space-y-2 pt-1">
              <button
                onClick={() => onNavigateToCaseStudy('little-world-school')}
                className="w-full text-left p-3 rounded-xl bg-[#050505] hover:bg-[#14141c] border border-white/5 transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-white">Little World School</p>
                  <p className="text-[10px] text-gray-400">School &amp; Admissions Platform</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#B68AFF]" />
              </button>
              <button
                onClick={() => onNavigateToCaseStudy('fixdesk')}
                className="w-full text-left p-3 rounded-xl bg-[#050505] hover:bg-[#14141c] border border-white/5 transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-white">FixDesk IT Portal</p>
                  <p className="text-[10px] text-gray-400">Service &amp; Repair Booking</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#B68AFF]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
