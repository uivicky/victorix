import React from 'react';
import { BRAND_INFO, SERVICES, CASE_STUDIES } from '../data/agencyData';
import { SEOHead } from '../components/SEOHead';
import { Breadcrumb } from '../components/Breadcrumb';
import {
  MapPin,
  MessageCircle,
  CheckCircle2,
  Zap,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Building2,
} from 'lucide-react';

interface MumbaiLocationPageProps {
  onNavigate: (page: string, slug?: string) => void;
}

export const MumbaiLocationPage: React.FC<MumbaiLocationPageProps> = ({ onNavigate }) => {
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'VICTORIX – Website Development Mumbai',
    image: 'https://victorix.in/logo.svg',
    '@id': 'https://victorix.in/#mumbai-service',
    url: 'https://victorix.in/website-developer-mumbai',
    telephone: '+91-6387661594',
    priceRange: '₹5,999 - ₹45,000',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Mumbai',
      addressRegion: 'Maharashtra',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 19.076,
      longitude: 72.8777,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '20:00',
    },
    founder: {
      '@type': 'Person',
      name: 'Vicky Vishwakarma',
      jobTitle: 'Founder & Lead Architect',
    },
    sameAs: ['https://wa.me/916387661594'],
  };

  return (
    <div className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <SEOHead
        title="Website Developer in Mumbai – Fast, Custom Web Development | VICTORIX"
        description="Looking for a professional website developer in Mumbai? VICTORIX builds sub-second, mobile-responsive, and SEO-friendly websites for Mumbai businesses and schools."
        canonicalPath="/website-developer-mumbai"
        schema={localBusinessSchema}
      />

      <Breadcrumb
        items={[{ label: 'Website Developer in Mumbai', active: true }]}
        onNavigate={onNavigate}
      />

      {/* Hero Section */}
      <div className="max-w-4xl space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B45FF]/10 text-xs font-mono text-[#B68AFF] border border-[#8B45FF]/30">
          <MapPin className="w-3.5 h-3.5 text-[#8B45FF]" />
          <span>MUMBAI &amp; MAHARASHTRA • LOCAL WEB ENGINEERING</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-display font-extrabold text-white tracking-tight leading-tight">
          Professional Website Developer in Mumbai That Helps Your Business Grow.
        </h1>

        <p className="text-base sm:text-xl text-gray-300 leading-relaxed font-normal">
          Founded and led by <strong className="text-white">Vicky Vishwakarma</strong> in Mumbai, VICTORIX crafts custom-coded, ultra-fast, and SEO-optimized web platforms for businesses, educational institutions, clinics, and professionals across the Mumbai Metropolitan Region.
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <a
            href={`${BRAND_INFO.whatsappUrl}?text=${encodeURIComponent(
              'Hi Vicky, I am looking for a website developer in Mumbai for my business. Can we discuss requirements?'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-black font-extrabold text-xs px-6 py-4 rounded-xl shadow-lg transition-transform hover:scale-105"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Consult on WhatsApp ({BRAND_INFO.whatsappNumber})</span>
          </a>

          <button
            onClick={() => onNavigate('portfolio')}
            className="inline-flex items-center gap-2 bg-[#101014] hover:bg-white/10 text-white font-semibold text-xs px-6 py-4 rounded-xl border border-white/10 transition-colors"
          >
            <span>View Verified Live Work</span>
            <ArrowRight className="w-4 h-4 text-[#B68AFF]" />
          </button>
        </div>
      </div>

      {/* Local Mumbai Focus Areas */}
      <div className="rounded-3xl bg-[#0e0e14] border border-white/10 p-8 sm:p-12 space-y-8">
        <div>
          <span className="text-xs font-mono uppercase text-[#B68AFF] font-bold">
            Local Coverage &amp; Availability
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mt-1">
            Serving Businesses Across Mumbai &amp; MMR
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-2xl leading-relaxed">
            We collaborate with clients across South Mumbai, Western Suburbs, Central Mumbai, Thane, and Navi Mumbai for in-person project discovery or seamless WhatsApp communication.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {[
            'Bandra & Khar',
            'Andheri East/West',
            'Powai & Kanjurmarg',
            'South Mumbai & BKC',
            'Thane & Mulund',
            'Navi Mumbai & Vashi',
          ].map((area, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-[#050505] border border-white/5 text-gray-300 font-medium text-center flex items-center justify-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5 text-[#8B45FF] flex-shrink-0" />
              <span>{area}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose a Local Engineer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-2xl bg-[#0d0d12] border border-white/5 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-[#8B45FF] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-display font-bold text-white">Direct Founder Interaction</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Communicate directly with founder Vicky Vishwakarma and lead web specialist Abhishek. No third-party outsourcing or account manager runarounds.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-[#0d0d12] border border-white/5 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-display font-bold text-white">Sub-Second Mobile Speeds</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Over 80% of Mumbai internet users browse on mobile 4G/5G connections. Our lean Next.js code loads in under 1.5 seconds without lag.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-[#0d0d12] border border-white/5 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-display font-bold text-white">Local SEO &amp; Schema Foundations</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            We implement valid LocalBusiness, Service, and BreadcrumbList schemas so Mumbai customers find your business for local commercial queries.
          </p>
        </div>
      </div>

      {/* Featured Local Proof */}
      <div className="space-y-6">
        <div>
          <span className="text-xs font-mono uppercase text-[#B68AFF] font-bold">
            Real Live Work
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mt-1">
            Proven Client Deployments
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CASE_STUDIES.map((cs) => (
            <div
              key={cs.id}
              className="p-6 rounded-2xl bg-[#0e0e14] border border-white/10 space-y-4 flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-mono text-[#B68AFF] font-bold uppercase">{cs.category}</span>
                <h3 className="text-xl font-display font-bold text-white mt-1">{cs.title}</h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">{cs.summary}</p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <a
                  href={cs.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-white hover:text-[#B68AFF] flex items-center gap-1 font-semibold"
                >
                  <span>Inspect Live Site</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => onNavigate(cs.id === 'little-world-school' ? 'case-study-little-world-school' : 'case-study-fixdesk')}
                  className="text-xs text-[#B68AFF] hover:underline"
                >
                  View Case Study
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
