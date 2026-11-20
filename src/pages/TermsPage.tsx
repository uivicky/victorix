import React from 'react';
import { BRAND_INFO } from '../data/agencyData';
import { SEOHead } from '../components/SEOHead';
import { ArrowLeft } from 'lucide-react';

interface TermsPageProps {
  onBack: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onBack }) => {
  return (
    <div className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <SEOHead
        title="Terms and Conditions – VICTORIX"
        description="Terms and conditions governing web development services and deliverables provided by VICTORIX."
        canonicalPath="/terms"
      />

      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      </div>

      <header className="space-y-3 border-b border-white/10 pb-6">
        <span className="text-xs font-mono uppercase text-[#B68AFF]">Legal &amp; Compliance</span>
        <h1 className="text-3xl sm:text-5xl font-display font-bold text-white">Terms &amp; Conditions</h1>
        <p className="text-xs text-gray-400">Effective Date: January 1, 2025 • Website Domain: victorixglobal.vercel.app</p>
      </header>

      <div className="space-y-8 text-gray-300 text-xs sm:text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-display font-bold text-white">1. Agreement to Terms</h2>
          <p>
            By engaging VICTORIX for custom website development, ecommerce engineering, or consulting services, you agree to abide by these terms. All project milestones, scopes, and pricing are documented and confirmed via our official channels.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-display font-bold text-white">2. Scope of Services &amp; Milestones</h2>
          <p>
            VICTORIX delivers custom digital assets based on the deliverables specified in your approved project brief. Work commences upon payment of the agreed kickoff deposit. Final handover and domain deployment occur upon project approval and settlement of the remaining balance.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-display font-bold text-white">3. Search Engine Optimization Disclaimer</h2>
          <p className="p-4 rounded-xl bg-[#101014] border border-white/5 text-gray-300">
            <strong>Important Notice:</strong> While VICTORIX implements industry-standard semantic HTML, JSON-LD Schema structured data, mobile-first responsiveness, and sub-2-second Core Web Vitals optimizations, search ranking algorithms are controlled independently by Google and external engines. <strong>VICTORIX does not guarantee a #1 position or any specific rank on search engines.</strong>
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-display font-bold text-white">4. Intellectual Property &amp; Code Ownership</h2>
          <p>
            Upon settlement of all project invoices, the client receives 100% intellectual property ownership of the custom frontend codebase, graphic layouts, and written copy developed specifically for their project. VICTORIX retains the right to display the completed deployment in its portfolio and case studies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-display font-bold text-white">5. Governing Law</h2>
          <p>
            These terms are governed by the laws of Maharashtra, India. Any disputes arising shall be subject to the exclusive jurisdiction of the courts in Mumbai, India.
          </p>
        </section>
      </div>
    </div>
  );
};
