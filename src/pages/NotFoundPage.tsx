import React from 'react';
import { BRAND_INFO } from '../data/agencyData';
import { SEOHead } from '../components/SEOHead';
import { Home, ArrowRight, MessageCircle, Search } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (page: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-20 text-center">
      <SEOHead
        title="Page Not Found (404) – VICTORIX"
        description="The requested page could not be found on victorix.in. Explore our web development services, real portfolio case studies, or chat on WhatsApp."
        canonicalPath="/404"
      />

      <div className="max-w-xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B45FF]/10 text-xs font-mono text-[#B68AFF] border border-[#8B45FF]/30">
          <span>ERROR 404 • ROUTE NOT FOUND</span>
        </div>

        <h1 className="text-6xl sm:text-8xl font-display font-extrabold text-white tracking-tight">
          40<span className="text-[#8B45FF]">4</span>
        </h1>

        <p className="text-lg sm:text-xl font-display font-bold text-gray-200">
          The page you are looking for has been moved, renamed, or does not exist.
        </p>

        <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
          Return to the VICTORIX homepage, browse our verified client case studies, or message Vicky directly on official WhatsApp for immediate assistance.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={() => onNavigate('home')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#8B45FF] hover:bg-[#7830ee] text-white font-bold text-xs px-6 py-3.5 rounded-xl shadow-lg transition-transform hover:scale-105"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </button>

          <a
            href={BRAND_INFO.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-black font-bold text-xs px-6 py-3.5 rounded-xl transition-transform hover:scale-105"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>

        <div className="pt-8 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-400">
          <button
            onClick={() => onNavigate('services')}
            className="p-2.5 rounded-lg bg-[#101014] hover:bg-white/5 hover:text-white transition-colors"
          >
            All Services
          </button>
          <button
            onClick={() => onNavigate('portfolio')}
            className="p-2.5 rounded-lg bg-[#101014] hover:bg-white/5 hover:text-white transition-colors"
          >
            Portfolio
          </button>
          <button
            onClick={() => onNavigate('pricing')}
            className="p-2.5 rounded-lg bg-[#101014] hover:bg-white/5 hover:text-white transition-colors"
          >
            Pricing
          </button>
          <button
            onClick={() => onNavigate('blog')}
            className="p-2.5 rounded-lg bg-[#101014] hover:bg-white/5 hover:text-white transition-colors"
          >
            Blog
          </button>
        </div>
      </div>
    </div>
  );
};
