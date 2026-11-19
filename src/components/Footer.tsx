import React from 'react';
import { Logo } from './Logo';
import { SERVICES, BRAND_INFO, TEAM_MEMBERS } from '../data/agencyData';
import { MessageCircle, ShieldCheck, ArrowUpRight, MapPin, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  setActivePage: (page: string) => void;
  setActiveServiceSlug?: (slug: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActivePage, setActiveServiceSlug }) => {
  const navigateTo = (page: string, serviceSlug?: string) => {
    setActivePage(page);
    if (serviceSlug && setActiveServiceSlug) {
      setActiveServiceSlug(serviceSlug);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#08080c] border-t border-white/10 text-gray-400 text-xs mt-24">
      {/* Top Banner Callout */}
      <div className="border-b border-white/5 py-10 bg-gradient-to-b from-[#101014] to-[#08080c]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#B68AFF] font-bold">
              Ready to Upgrade Your Digital Presence?
            </span>
            <h3 className="text-xl sm:text-2xl font-display font-bold text-white mt-1">
              Let&apos;s build a fast, high-converting website together.
            </h3>
            <p className="text-gray-400 text-xs mt-1">
              Direct consultation with Vicky &amp; Abhishek on official WhatsApp. No sales pressure.
            </p>
          </div>
          <a
            href={BRAND_INFO.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] text-black font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>Chat on WhatsApp ({BRAND_INFO.whatsappNumber})</span>
          </a>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="md" />
            <p className="text-gray-400 text-xs leading-relaxed max-w-sm">
              VICTORIX builds modern, responsive, fast-loading and SEO-friendly websites for businesses, startups, schools and professionals. Engineered with precision in Mumbai, India.
            </p>

            <div className="pt-2 space-y-2">
              <div className="flex items-center gap-2 text-white">
                <MapPin className="w-4 h-4 text-[#8B45FF]" />
                <span className="text-xs">Mumbai, Maharashtra, India</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span className="text-xs font-mono">{BRAND_INFO.whatsappNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs">Planned Domain: {BRAND_INFO.plannedDomain}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#101014] border border-white/5 text-[11px] text-gray-400">
              <span className="font-semibold text-white block mb-0.5">Direct Founder Access:</span>
              Speak directly with <span className="text-[#B68AFF]">Vicky Vishwakarma</span> (Founder) or <span className="text-[#B68AFF]">Abhishek</span> (Team Member) for any website scope or technical questions.
            </div>
          </div>

          {/* Services Column */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-white uppercase tracking-wider font-display">
              Services
            </p>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => navigateTo('mumbai-location')}
                  className="text-[#B68AFF] font-medium hover:text-white transition-colors text-left flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3" />
                  <span>Website Developer in Mumbai</span>
                </button>
              </li>
              {SERVICES.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => navigateTo('service-detail', s.slug)}
                    className="hover:text-white transition-colors text-left"
                  >
                    {s.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Real Work & Resources Column */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-white uppercase tracking-wider font-display">
              Real Work &amp; Insights
            </p>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => navigateTo('case-study-little-world-school')}
                  className="hover:text-[#B68AFF] transition-colors text-left flex items-center gap-1"
                >
                  <span>Little World School Case Study</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('case-study-fixdesk')}
                  className="hover:text-[#B68AFF] transition-colors text-left flex items-center gap-1"
                >
                  <span>FixDesk Case Study</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('case-study-it-support')}
                  className="hover:text-[#B68AFF] transition-colors text-left flex items-center gap-1"
                >
                  <span>IT SUPPORT Case Study</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('portfolio')}
                  className="hover:text-white transition-colors text-left"
                >
                  All Portfolio Projects
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('blog')}
                  className="hover:text-white transition-colors text-left"
                >
                  Engineering &amp; SEO Blog
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('pricing')}
                  className="hover:text-white transition-colors text-left"
                >
                  Transparent Pricing
                </button>
              </li>
            </ul>
          </div>

          {/* Company & Legal Column */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-white uppercase tracking-wider font-display">
              Company &amp; Legal
            </p>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => navigateTo('about')}
                  className="hover:text-white transition-colors text-left"
                >
                  About VICTORIX
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('contact')}
                  className="hover:text-white transition-colors text-left"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('privacy-policy')}
                  className="hover:text-white transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('terms')}
                  className="hover:text-white transition-colors text-left"
                >
                  Terms and Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('admin')}
                  className="text-gray-500 hover:text-[#B68AFF] transition-colors text-left flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Team Portal (Admin)</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Ethical SEO & Algorithm Disclaimer */}
        <div className="mt-12 pt-6 border-t border-white/5 text-[11px] text-gray-500 leading-relaxed">
          <p>
            <strong className="text-gray-400">Search Engine Policy &amp; Commitment:</strong> VICTORIX provides legitimate, professional technical website engineering, semantic JSON-LD structured schemas, mobile optimization, and Core Web Vitals performance tuning. In accordance with ethical web practices, we never guarantee first-position Google rankings, as external search algorithms and competitor activities fluctuate. All live projects showcased (Little World School, FixDesk, and IT SUPPORT) link directly to verifiable deployments with unconfirmed business metrics transparently disclosed.
          </p>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} VICTORIX. All rights reserved. Founded by Vicky Vishwakarma.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-[#8B45FF] font-medium">AI FOR A BETTER TOMORROW</span>
            <span>•</span>
            <a
              href={BRAND_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#25D366] hover:underline"
            >
              WhatsApp Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
