import React from 'react';
import { PRICING_PLANS, BRAND_INFO } from '../data/agencyData';
import { CheckCircle2, MessageCircle, Sparkles, Shield, Clock, HelpCircle } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';

export const PricingPage: React.FC = () => {
  return (
    <div className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <SEOHead
        title="Transparent Website Development Pricing – VICTORIX"
        description="Clear, honest web development pricing in India. Fixed quotes, zero hidden plugin fees, and direct engineering access with Vicky & Abhishek."
        canonicalPath="/pricing"
      />

      <div className="max-w-3xl space-y-4">
        <span className="text-xs font-mono uppercase tracking-widest text-[#B68AFF] font-bold">
          Starting at ₹5,999 · Zero Database Bloat · Static Edge Deployments
        </span>
        <h1 className="text-4xl sm:text-6xl font-display font-extrabold text-white tracking-tight">
          Transparent Pricing Starting at ₹5,999.
        </h1>
        <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
          We build lean, static client websites hosted on Cloudflare Pages Free with free HTTPS and zero compulsory monthly server or database expenses. Optional monthly maintenance &amp; SEO reporting plans start at ₹999/month.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {PRICING_PLANS.map((plan, idx) => (
          <div
            key={idx}
            className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
              plan.popular
                ? 'bg-gradient-to-b from-[#181224] to-[#101018] border-2 border-[#8B45FF] shadow-[0_0_40px_rgba(139,69,255,0.25)] -translate-y-2'
                : 'bg-[#0d0d12] border border-white/10 hover:border-white/20'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#8B45FF] text-white text-[11px] font-bold uppercase tracking-wider shadow-lg">
                Most Popular for Growth
              </div>
            )}

            <div>
              <div className="space-y-2 mb-6">
                <h2 className="text-2xl font-display font-bold text-white">{plan.name}</h2>
                <p className="text-xs text-gray-400 leading-relaxed min-h-[32px]">
                  {plan.tagline}
                </p>
              </div>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-display font-black text-white tabular-nums">{plan.price}</span>
                {(plan.price.startsWith('₹') || plan.price.startsWith('From ₹')) && (
                  <span className="text-xs text-gray-400 font-medium">One-Time Build</span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#B68AFF] font-mono mb-8 pb-6 border-b border-white/10">
                <Clock className="w-3.5 h-3.5" />
                <span>Turnaround: {plan.timeline}</span>
              </div>

              <div className="space-y-3 mb-8">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Included Features:
                </span>
                <ul className="space-y-2.5 text-xs sm:text-sm text-gray-300">
                  {plan.features.map((f, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4">
              <a
                href={`${BRAND_INFO.whatsappUrl}?text=${encodeURIComponent(
                  `Hi Vicky, I want to discuss the ${plan.name} package (${plan.price}) for my business.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-xs transition-all ${
                  plan.popular
                    ? 'bg-[#8B45FF] hover:bg-[#7830ee] text-white shadow-lg shadow-purple-900/40 hover:scale-[1.02]'
                    : 'bg-[#25D366] hover:bg-[#20ba59] text-black hover:scale-[1.02]'
                }`}
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>{plan.cta} on WhatsApp</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing Clarification Box */}
      <div className="p-8 sm:p-10 rounded-2xl bg-[#101014] border border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-gray-300">
        <div className="space-y-1.5">
          <span className="text-white font-bold block text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#8B45FF]" /> No Vendor Lock-in
          </span>
          <p className="text-gray-400">
            You receive complete repository access and ownership of all code and visual assets upon project completion.
          </p>
        </div>

        <div className="space-y-1.5">
          <span className="text-white font-bold block text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#8B45FF]" /> Milestone Payments
          </span>
          <p className="text-gray-400">
            Standard structure is 50% upon project kickoff and 50% only after full review and launch on your domain.
          </p>
        </div>

        <div className="space-y-1.5">
          <span className="text-white font-bold block text-sm flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#8B45FF]" /> Ongoing Support
          </span>
          <p className="text-gray-400">
            30 days of comprehensive technical support and warranty included with every tier.
          </p>
        </div>
      </div>
    </div>
  );
};
