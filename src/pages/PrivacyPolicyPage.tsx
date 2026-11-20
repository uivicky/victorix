import React from 'react';
import { BRAND_INFO } from '../data/agencyData';
import { SEOHead } from '../components/SEOHead';
import { ArrowLeft, Shield, Lock, FileText, MessageCircle } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onBack: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onBack }) => {
  return (
    <div className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <SEOHead
        title="Privacy Policy – VICTORIX"
        description="Privacy policy and data retention practices of VICTORIX for victorixglobal.vercel.app."
        canonicalPath="/privacy-policy"
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
        <h1 className="text-3xl sm:text-5xl font-display font-bold text-white">Privacy Policy</h1>
        <p className="text-xs text-gray-400">Effective Date: January 1, 2025 • Website Domain: victorixglobal.vercel.app</p>
      </header>

      <div className="space-y-8 text-gray-300 text-xs sm:text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-display font-bold text-white">1. Overview</h2>
          <p>
            VICTORIX (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;), founded by Vicky Vishwakarma and operating from Mumbai, India, is committed to safeguarding your privacy. This Privacy Policy outlines how we collect, store, and utilize information when you browse our website (victorixglobal.vercel.app) or initiate communication through our official WhatsApp channels.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-display font-bold text-white">2. Information We Collect</h2>
          <p>
            We strictly limit data collection to what is necessary for delivering professional web development services:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-gray-400">
            <li><strong>Project Brief Submissions:</strong> Your name, WhatsApp phone number, requested service category, and project specifications submitted via our web portal.</li>
            <li><strong>Technical Website Audits:</strong> Public website URLs that you or our automated lead evaluation tools analyze for page speed, responsive viewport tags, HTTPS configuration, and structural SEO indicators.</li>
            <li><strong>Direct Messaging:</strong> Communication and file exchanges conducted voluntarily through WhatsApp.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-display font-bold text-white">3. How We Use Your Data</h2>
          <p>
            We use collected information solely for:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-gray-400">
            <li>Responding to website development quotes and scheduling consultations.</li>
            <li>Conducting technical website audits and preparing custom architectural proposals.</li>
            <li>Maintaining internal database records of client project requirements.</li>
          </ul>
          <p className="text-white font-medium pt-1">
            We never sell, rent, or trade your personal information to third-party marketing brokers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-display font-bold text-white">4. Cookies and Web Analytics</h2>
          <p>
            Our website uses minimal, privacy-conscious performance cookies and anonymous Google Analytics 4 sessions to gauge aggregate visitor behavior (such as most viewed services and page load performance). You can disable cookies at any time via your browser settings.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-display font-bold text-white">5. Contact Information</h2>
          <p>
            For any questions regarding your data or to request data removal from our project database, contact Vicky Vishwakarma via official WhatsApp at {BRAND_INFO.whatsappNumber}.
          </p>
        </section>
      </div>
    </div>
  );
};
