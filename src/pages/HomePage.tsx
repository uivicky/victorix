import React, { useState } from 'react';
import { BRAND_INFO, TEAM_MEMBERS, CASE_STUDIES, SERVICES, FAQS } from '../data/agencyData';
import {
  ArrowRight,
  MessageCircle,
  ExternalLink,
  Zap,
  Shield,
  Search,
  Code2,
  Sparkles,
  ChevronDown,
  Layers,
  Clock,
  CheckCircle2,
  Smartphone,
  Flame,
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';

interface HomePageProps {
  setActivePage: (page: string) => void;
  setActiveServiceSlug: (slug: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  setActivePage,
  setActiveServiceSlug,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const navigateTo = (page: string, serviceSlug?: string) => {
    setActivePage(page);
    if (serviceSlug) {
      setActiveServiceSlug(serviceSlug);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative overflow-hidden">
      <SEOHead
        title="VICTORIX – Professional Website Development That Helps Your Business Grow"
        description="VICTORIX builds modern, responsive, fast-loading and SEO-friendly websites for businesses, startups, schools and professionals."
        canonicalPath="/"
      />

      {/* Futuristic Background Glows */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-[#8B45FF]/20 to-[#B68AFF]/10 blur-[130px] -z-10 pointer-events-none rounded-full" />
      <div className="absolute top-[800px] right-0 w-[500px] h-[500px] bg-[#8B45FF]/10 blur-[150px] -z-10 pointer-events-none" />

      {/* 1. HERO SECTION */}
      <section className="pt-12 sm:pt-20 pb-20 sm:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Futuristic Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#101014] border border-[#8B45FF]/40 shadow-[0_0_15px_rgba(139,69,255,0.25)] text-xs font-medium text-[#B68AFF]">
            <Sparkles className="w-3.5 h-3.5 text-[#8B45FF]" />
            <span>AI FOR A BETTER TOMORROW</span>
            <span className="text-gray-500">•</span>
            <span className="text-white font-semibold">Custom Web Architecture</span>
          </div>

          {/* Master Hero Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tight text-white leading-[1.1]">
            Professional Website Development That Helps{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFFFFF] via-[#B68AFF] to-[#8B45FF]">
              Your Business Grow.
            </span>
          </h1>

          {/* Master Hero Description */}
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed font-normal">
            VICTORIX builds modern, responsive, fast-loading and SEO-friendly websites for businesses, startups, schools and professionals.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {/* Start Your Project WhatsApp Button */}
            <a
              href={BRAND_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#8B45FF] hover:bg-[#7830ee] text-white font-bold text-sm px-8 py-4 rounded-xl shadow-[0_0_30px_rgba(139,69,255,0.4)] hover:shadow-[0_0_35px_rgba(139,69,255,0.6)] transition-all hover:scale-105 active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Start Your Project</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            {/* Explore Our Work Button */}
            <button
              onClick={() => navigateTo('portfolio')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#101014] hover:bg-[#181820] text-gray-200 hover:text-white font-semibold text-sm px-8 py-4 rounded-xl border border-white/10 hover:border-[#8B45FF]/40 transition-all hover:scale-105 active:scale-95"
            >
              <span>Explore Our Work</span>
              <ExternalLink className="w-4 h-4 text-[#B68AFF]" />
            </button>
          </div>

          {/* Trust Highlights Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 text-left border-t border-white/5 mt-12">
            <div className="p-4 rounded-xl bg-[#101014]/60 border border-white/5">
              <div className="flex items-center gap-2 text-[#8B45FF] mb-1 font-display font-bold text-lg">
                <Zap className="w-4 h-4" />
                <span>&lt; 1.5s</span>
              </div>
              <p className="text-xs text-gray-400 font-medium">Sub-Second Load Speed</p>
            </div>
            <div className="p-4 rounded-xl bg-[#101014]/60 border border-white/5">
              <div className="flex items-center gap-2 text-[#B68AFF] mb-1 font-display font-bold text-lg">
                <Search className="w-4 h-4" />
                <span>100% Valid</span>
              </div>
              <p className="text-xs text-gray-400 font-medium">Semantic SEO &amp; Schema</p>
            </div>
            <div className="p-4 rounded-xl bg-[#101014]/60 border border-white/5">
              <div className="flex items-center gap-2 text-emerald-400 mb-1 font-display font-bold text-lg">
                <Smartphone className="w-4 h-4" />
                <span>Mobile-First</span>
              </div>
              <p className="text-xs text-gray-400 font-medium">Responsive Touch UX</p>
            </div>
            <div className="p-4 rounded-xl bg-[#101014]/60 border border-white/5">
              <div className="flex items-center gap-2 text-white mb-1 font-display font-bold text-lg">
                <Shield className="w-4 h-4 text-[#8B45FF]" />
                <span>Zero Plugins</span>
              </div>
              <p className="text-xs text-gray-400 font-medium">Custom Coded Stability</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ABOUT VICTORIX SECTION */}
      <section className="py-20 bg-[#0a0a0e] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#B68AFF]">
                <span>About VICTORIX</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">
                Engineered for Performance. Built for Real Business Conversions.
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Founded by <strong className="text-white">Vicky Vishwakarma</strong>, VICTORIX was created to solve a widespread problem: most business websites are either slow, vulnerable WordPress templates or overpriced corporate projects that take months to launch.
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                We take an engineering-first approach. Every website is built using modern technologies like React, Next.js architecture, and Tailwind CSS, paired with semantic JSON-LD structured schemas and official WhatsApp lead routing. The result is a fast, trustworthy digital presence that turns casual visitors into paying customers.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#101014] border border-white/5 space-y-1">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Direct Team Interaction
                  </span>
                  <p className="text-xs text-gray-400">
                    Work directly with Vicky and Abhishek on WhatsApp. No account manager telephone games.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#101014] border border-white/5 space-y-1">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    AI-Enhanced Discovery
                  </span>
                  <p className="text-xs text-gray-400">
                    Proprietary AI Client Finder tools that detect technical website gaps and craft personalized solutions.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigateTo('about')}
                  className="inline-flex items-center gap-2 text-sm text-[#B68AFF] hover:text-white font-semibold transition-colors"
                >
                  <span>Read our full agency story &amp; values</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-2xl bg-gradient-to-br from-[#101014] to-[#181822] p-8 border border-[#8B45FF]/30 shadow-2xl">
                <div className="space-y-6">
                  <div className="border-b border-white/10 pb-4">
                    <span className="text-xs font-mono uppercase text-[#B68AFF]">Founder &amp; Engineering</span>
                    <h3 className="text-xl font-display font-bold text-white mt-1">
                      Vicky Vishwakarma
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">Founder &amp; Lead Architect</p>
                  </div>
                  <div className="border-b border-white/10 pb-4">
                    <span className="text-xs font-mono uppercase text-[#B68AFF]">Frontend &amp; UX</span>
                    <h3 className="text-xl font-display font-bold text-white mt-1">
                      Abhishek
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">Team Member &amp; Web Specialist</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#050505] border border-white/5">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-gray-400">Direct Consultation</span>
                      <span className="text-emerald-400 font-mono font-bold">Active</span>
                    </div>
                    <a
                      href={BRAND_INFO.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#25D366] text-black font-bold text-xs hover:bg-[#20ba59] transition-all"
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                      <span>Message on Official WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED PROJECTS (REAL CASE STUDIES) */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#B68AFF] font-semibold">
            Real Verified Client Work
          </span>
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-white">
            Featured Case Studies
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            We don&apos;t show mockups. Explore live production web applications built by VICTORIX that real clients use every single day.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {CASE_STUDIES.map((project) => (
            <div
              key={project.id}
              className="group rounded-2xl bg-[#0e0e13] border border-white/10 hover:border-[#8B45FF]/50 transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between shadow-xl hover:shadow-[0_0_35px_rgba(139,69,255,0.15)]"
            >
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#8B45FF]/10 text-[#B68AFF] border border-[#8B45FF]/30">
                    {project.category}
                  </span>
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
                  >
                    <span>Live Website</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#B68AFF]" />
                  </a>
                </div>

                <h3 className="text-2xl font-display font-bold text-white group-hover:text-[#B68AFF] transition-colors">
                  {project.title}
                </h3>
                <p className="text-sm text-gray-400 mt-1 font-medium">{project.tagline}</p>

                <p className="text-xs sm:text-sm text-gray-300 mt-4 leading-relaxed">
                  {project.summary}
                </p>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3 my-6 pt-4 border-t border-white/5">
                  {project.metrics.map((m, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-[#050505] border border-white/5">
                      <p className="text-sm font-display font-bold text-white">{m.value}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{m.label}</p>
                    </div>
                  ))}
                </div>

                {/* Tech Pills */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {project.technologies.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2.5 py-1 rounded-md bg-white/5 text-gray-300 font-mono"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={() => navigateTo(`case-study-${project.id}`)}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[#B68AFF] hover:text-white transition-colors"
                >
                  <span>Read Case Study</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <a
                  href={`${BRAND_INFO.whatsappUrl}?text=${encodeURIComponent(
                    `Hi Vicky, I checked out your ${project.title} project and would like to build something similar for my business.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Build Similar</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => navigateTo('portfolio')}
            className="inline-flex items-center gap-2 bg-[#101014] hover:bg-[#181822] text-white px-6 py-3 rounded-xl border border-white/10 text-xs font-semibold transition-all hover:scale-105"
          >
            <span>View All Portfolio Details &amp; Previews</span>
            <ArrowRight className="w-4 h-4 text-[#8B45FF]" />
          </button>
        </div>
      </section>

      {/* 4. SERVICES OVERVIEW SECTION */}
      <section className="py-24 bg-[#08080c] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#B68AFF] font-semibold">
              Comprehensive Web Engineering
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-bold text-white">
              Tailored Services for Every Stage of Growth
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              From foundational business storefronts to complex educational portals and intelligent AI-assisted web apps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service) => (
              <div
                key={service.id}
                className="group relative rounded-2xl bg-[#0d0d12] border border-white/10 hover:border-[#8B45FF]/40 p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(139,69,255,0.15)]"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#8B45FF]/10 border border-[#8B45FF]/30 flex items-center justify-center text-[#B68AFF] mb-5 group-hover:bg-[#8B45FF] group-hover:text-white transition-all">
                    {service.id === 'website-development' && <Code2 className="w-6 h-6" />}
                    {service.id === 'business-website-development' && <Shield className="w-6 h-6" />}
                    {service.id === 'ecommerce-development' && <Zap className="w-6 h-6" />}
                    {service.id === 'school-website-development' && <Layers className="w-6 h-6" />}
                    {service.id === 'portfolio-website-development' && <Sparkles className="w-6 h-6" />}
                    {service.id === 'ai-web-solutions' && <Flame className="w-6 h-6" />}
                  </div>

                  <h3 className="text-xl font-display font-bold text-white mb-2 group-hover:text-[#B68AFF] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-4">
                    {service.shortDesc}
                  </p>

                  <ul className="space-y-1.5 mb-6 text-xs text-gray-300">
                    {service.benefits.slice(0, 3).map((b, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                  <button
                    onClick={() => navigateTo('service-detail', service.slug)}
                    className="font-semibold text-[#B68AFF] hover:text-white transition-colors flex items-center gap-1"
                  >
                    <span>Full Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] text-gray-500 font-mono">
                    {service.typicalTimeline}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => navigateTo('services')}
              className="inline-flex items-center gap-2 text-sm text-white hover:text-[#B68AFF] font-semibold transition-colors"
            >
              <span>Explore all service specifications and deliverables</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE VICTORIX */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#B68AFF] font-semibold">
            The VICTORIX Difference
          </span>
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-white">
            Why Businesses Trust Us Over Generic Agencies
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            We replace outdated agency bloat with direct engineering excellence, guaranteed speed, and conversion focus.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-[#0d0d12] border border-white/5 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-[#B68AFF] flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-display font-bold text-white">
              Extreme Page Speed &amp; Clean Code
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              We never use slow drag-and-drop page builders or plugin-heavy templates that drag down your PageSpeed score. Clean React and Next.js architecture ensures sub-second rendering.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[#0d0d12] border border-white/5 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-display font-bold text-white">
              Semantic SEO &amp; Schema Foundations
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              We build search engine crawlers a red carpet with complete Schema.org JSON-LD tags, mobile-first layouts, canonical URLs, and clean semantic heading hierarchies.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[#0d0d12] border border-white/5 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-display font-bold text-white">
              Official WhatsApp Conversion Funnel
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Your prospects prefer instant WhatsApp chats over tedious email forms. Every site we build is wired to route qualified prospect enquiries directly to your WhatsApp desk.
            </p>
          </div>
        </div>
      </section>

      {/* 6. OUR 5-STEP DEVELOPMENT PROCESS */}
      <section className="py-24 bg-[#0a0a0f] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#B68AFF] font-semibold">
              Transparent Execution
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-bold text-white">
              Our 5-Step Development Process
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              A structured, stress-free path from initial conversation to live deployment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[
              {
                step: '01',
                title: 'Discovery & Goals',
                desc: 'We discuss your business model, target audience, and primary website objectives over WhatsApp.',
              },
              {
                step: '02',
                title: 'Custom Architecture',
                desc: 'We design the responsive user flows, typography, brand palette, and interactive page layouts.',
              },
              {
                step: '03',
                title: 'Performance Build',
                desc: 'We code the application with modern frameworks, ensuring mobile responsiveness and fast load times.',
              },
              {
                step: '04',
                title: 'SEO & Verification',
                desc: 'Rigorous testing of metadata, schema tags, cross-device responsiveness, and WhatsApp routing.',
              },
              {
                step: '05',
                title: 'Launch & Evolution',
                desc: 'Live deployment on global CDN edge networks with 30-day post-launch technical support.',
              },
            ].map((p, idx) => (
              <div
                key={idx}
                className="relative p-6 rounded-2xl bg-[#101014] border border-white/5 space-y-3"
              >
                <span className="text-3xl font-display font-black text-[#8B45FF]/40">
                  {p.step}
                </span>
                <h3 className="text-base font-display font-bold text-white">{p.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. TEAM SECTION */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#B68AFF] font-semibold">
            Core Leadership
          </span>
          <h2 className="text-3xl sm:text-5xl font-display font-bold text-white">
            The Engineers Behind VICTORIX
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            No anonymous freelancers. Speak directly with the creators building your digital platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {TEAM_MEMBERS.map((member, idx) => (
            <div
              key={idx}
              className="p-8 rounded-2xl bg-[#0e0e14] border border-white/10 hover:border-[#8B45FF]/40 transition-all space-y-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#8B45FF] to-[#B68AFF] flex items-center justify-center text-white font-display font-bold text-xl shadow-lg shadow-purple-900/30">
                  {member.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-white">{member.name}</h3>
                  <p className="text-xs text-[#B68AFF] font-medium">{member.role}</p>
                </div>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed">{member.bio}</p>

              <div className="p-3 rounded-xl bg-[#050505] border border-white/5 text-xs text-gray-400">
                <span className="text-white font-semibold block mb-0.5">Core Focus:</span>
                {member.focus}
              </div>

              <div className="pt-2">
                <a
                  href={`${BRAND_INFO.whatsappUrl}?text=${encodeURIComponent(
                    `Hi ${member.name.split(' ')[0]}, I would like to consult with you regarding a new website project.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Connect directly on WhatsApp</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. FAQS ACCORDION */}
      <section className="py-24 bg-[#08080c] border-y border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#B68AFF] font-semibold">
              Got Questions?
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-bold text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-400 text-sm">
              Transparent answers regarding cost, timelines, Google search visibility, and our workflow.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl bg-[#101014] border border-white/5 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-white/5 transition-colors"
                  >
                    <span className="font-display font-semibold text-white text-sm sm:text-base">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#B68AFF] transition-transform duration-200 flex-shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-300 leading-relaxed border-t border-white/5">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. FINAL HIGH-CONVERSION CTA */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-b from-[#14141e] to-[#0d0d14] border border-[#8B45FF]/40 p-8 sm:p-14 text-center overflow-hidden shadow-2xl shadow-purple-950/40">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#8B45FF]/15 blur-3xl rounded-full pointer-events-none" />

          <div className="max-w-3xl mx-auto space-y-6 relative z-10">
            <span className="text-xs font-mono uppercase tracking-widest text-[#B68AFF] font-semibold">
              No Forms. No Middlemen.
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white">
              Start Your Website Project Today With VICTORIX.
            </h2>
            <p className="text-gray-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Message Vicky directly on WhatsApp with your project ideas. We will analyze your requirements and provide an honest, actionable estimate.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <a
                href={BRAND_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] text-black font-extrabold text-sm px-8 py-4 rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>Chat on WhatsApp ({BRAND_INFO.whatsappNumber})</span>
              </a>
              <button
                onClick={() => navigateTo('contact')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#050505] hover:bg-[#101014] text-white font-semibold text-sm px-8 py-4 rounded-xl border border-white/10 hover:border-white/30 transition-all"
              >
                <span>View Contact Details</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
