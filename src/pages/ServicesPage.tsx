import React from 'react';
import { SERVICES, BRAND_INFO } from '../data/agencyData';
import {
  Code2,
  Shield,
  Zap,
  Layers,
  Sparkles,
  Flame,
  ArrowRight,
  CheckCircle2,
  MessageCircle,
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';

interface ServicesPageProps {
  onSelectService: (slug: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ onSelectService }) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'website-development':
        return <Code2 className="w-7 h-7 text-[#8B45FF]" />;
      case 'business-website-development':
        return <Shield className="w-7 h-7 text-[#8B45FF]" />;
      case 'ecommerce-development':
        return <Zap className="w-7 h-7 text-[#8B45FF]" />;
      case 'school-website-development':
        return <Layers className="w-7 h-7 text-[#8B45FF]" />;
      case 'portfolio-website-development':
        return <Sparkles className="w-7 h-7 text-[#8B45FF]" />;
      case 'ai-web-solutions':
        return <Flame className="w-7 h-7 text-[#8B45FF]" />;
      default:
        return <Code2 className="w-7 h-7 text-[#8B45FF]" />;
    }
  };

  return (
    <div className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <SEOHead
        title="Web Development Services – Custom Websites, Ecommerce & AI"
        description="Explore VICTORIX's custom web development services: business websites, school portals, ecommerce, portfolio platforms, and AI web solutions."
        canonicalPath="/services"
      />

      <div className="max-w-3xl space-y-4">
        <span className="text-xs font-mono uppercase tracking-widest text-[#B68AFF] font-bold">
          High-Performance Engineering
        </span>
        <h1 className="text-4xl sm:text-6xl font-display font-extrabold text-white tracking-tight">
          Web Development Services Engineered to Grow Your Business.
        </h1>
        <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
          From high-converting small business storefronts to scalable school portals and AI-assisted workflows, VICTORIX delivers clean, modern code built for speed and search engine discovery.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {SERVICES.map((service) => (
          <div
            key={service.id}
            className="group rounded-2xl bg-[#0d0d12] border border-white/10 hover:border-[#8B45FF]/40 p-8 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-[0_10px_35px_rgba(139,69,255,0.15)]"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#8B45FF]/10 border border-[#8B45FF]/20 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                {getIcon(service.id)}
              </div>

              <h2 className="text-2xl font-display font-bold text-white mb-2 group-hover:text-[#B68AFF] transition-colors">
                {service.title}
              </h2>

              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-6">
                {service.shortDesc}
              </p>

              <div className="space-y-2 mb-6">
                <span className="text-xs font-bold text-white block">Key Advantages:</span>
                <ul className="space-y-1.5 text-xs text-gray-300">
                  {service.benefits.map((b, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">Estimated Timeline</span>
                <span className="text-[#B68AFF] font-mono font-semibold">{service.typicalTimeline}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelectService(service.slug)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 text-center transition-colors"
                >
                  View Full Scope
                </button>
                <a
                  href={`${BRAND_INFO.whatsappUrl}?text=${encodeURIComponent(
                    `Hi Vicky, I want to inquire about ${service.title} with VICTORIX.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-[#25D366] text-black hover:bg-[#20ba59] transition-colors"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Direct Quote Banner */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#101018] to-[#161622] border border-[#8B45FF]/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <h3 className="text-2xl font-display font-bold text-white">
            Unsure which service fits your requirements?
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 max-w-xl">
            Chat with Vicky or Abhishek directly on WhatsApp. We will evaluate your current presence and recommend the most effective, budget-friendly strategy.
          </p>
        </div>
        <a
          href={BRAND_INFO.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#8B45FF] hover:bg-[#7830ee] text-white font-bold text-xs px-6 py-3.5 rounded-xl transition-all flex-shrink-0"
        >
          <MessageCircle className="w-4 h-4 fill-white" />
          <span>Consult on WhatsApp</span>
        </a>
      </div>
    </div>
  );
};
