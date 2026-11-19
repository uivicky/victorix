import React from 'react';
import { BRAND_INFO, TEAM_MEMBERS } from '../data/agencyData';
import { MessageCircle, ShieldCheck, Zap, Sparkles, Code2, HeartHandshake, CheckCircle2 } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';

export const AboutPage: React.FC = () => {
  return (
    <div className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
      <SEOHead
        title="About VICTORIX – Our Story, Team & Vision"
        description="Learn about VICTORIX, founded by Vicky Vishwakarma, and our mission to build fast, SEO-friendly websites with AI-powered efficiency."
        canonicalPath="/about"
      />

      {/* Header Banner */}
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B45FF]/10 border border-[#8B45FF]/30 text-xs font-mono text-[#B68AFF]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ABOUT VICTORIX</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-display font-extrabold text-white tracking-tight">
          Engineering the Next Generation of High-Speed Web Solutions.
        </h1>
        <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
          VICTORIX was founded by <strong className="text-white">Vicky Vishwakarma</strong> with a single driving mission:{' '}
          <span className="text-[#B68AFF] font-medium">AI FOR A BETTER TOMORROW</span>. We build modern, responsive, fast-loading, and SEO-friendly websites that empower businesses, institutions, and professionals to thrive online.
        </p>
      </div>

      {/* Core Philosophy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-2xl bg-[#0e0e14] border border-white/5 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#8B45FF]/10 text-[#8B45FF] flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-display font-bold text-white">Speed Is Our Foundation</h3>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            Every millisecond a visitor waits is a lost client. We shun bloated themes and third-party page builders, crafting lean React and Next.js architectures that load instantly on any mobile device.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-[#0e0e14] border border-white/5 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-display font-bold text-white">Integrity &amp; Ethical SEO</h3>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            We never promise fake guarantees like &quot;#1 on Google overnight.&quot; Instead, we build rock-solid technical SEO foundations, semantic JSON-LD schemas, and fast Core Web Vitals that search algorithms genuinely reward.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-[#0e0e14] border border-white/5 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-display font-bold text-white">Direct Human Partnership</h3>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            No endless email threads or disconnected account executives. You collaborate directly with Vicky and Abhishek via official WhatsApp, ensuring fast turnarounds and total transparency.
          </p>
        </div>
      </div>

      {/* Meet The Leadership */}
      <div className="space-y-8 pt-8 border-t border-white/10">
        <div className="max-w-2xl">
          <span className="text-xs font-mono uppercase text-[#B68AFF]">Leadership</span>
          <h2 className="text-3xl font-display font-bold text-white mt-1">
            Meet the Team
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Dedicated developers who take personal pride in every website we deploy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {TEAM_MEMBERS.map((member, idx) => (
            <div
              key={idx}
              className="p-8 rounded-2xl bg-[#101014] border border-white/10 space-y-5"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#8B45FF] to-[#B68AFF] flex items-center justify-center text-white font-display font-bold text-2xl shadow-xl shadow-purple-900/40">
                  {member.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-white">{member.name}</h3>
                  <p className="text-xs font-semibold text-[#B68AFF] tracking-wide">{member.role}</p>
                </div>
              </div>

              <p className="text-sm text-gray-300 leading-relaxed">{member.bio}</p>

              <div className="p-4 rounded-xl bg-[#050505] border border-white/5 text-xs text-gray-400 space-y-1">
                <span className="font-semibold text-white block">Specialization:</span>
                <p>{member.focus}</p>
              </div>

              <div>
                <a
                  href={`${BRAND_INFO.whatsappUrl}?text=${encodeURIComponent(
                    `Hi ${member.name.split(' ')[0]}, I'm reaching out from the VICTORIX website to discuss a project.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Message {member.name.split(' ')[0]} on WhatsApp</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Our Standards */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#101014] to-[#14141c] border border-white/10 space-y-6">
        <h3 className="text-2xl font-display font-bold text-white">
          Our 5 Quality Commitments to Every Client
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-gray-300">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <span><strong>Full Code Ownership:</strong> You own 100% of your source code, design assets, and domain deployment.</span>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <span><strong>Zero Surprise Charges:</strong> All costs and deliverable scopes are confirmed upfront on WhatsApp.</span>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <span><strong>Core Web Vitals Verified:</strong> We test every project through Google Lighthouse before launch.</span>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <span><strong>Mobile Optimization:</strong> Hand-crafted touch ergonomics for seamless thumb navigation.</span>
          </div>
          <div className="flex items-start gap-3 sm:col-span-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <span><strong>30-Day Post-Launch Support:</strong> Complimentary bug fixes and assistance after going live.</span>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
          <a
            href={BRAND_INFO.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] text-black font-bold text-xs px-6 py-3.5 rounded-xl hover:bg-[#20ba59] transition-all"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Start a Conversation on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
