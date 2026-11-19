import React, { useState } from 'react';
import { Logo } from './Logo';
import { SERVICES, BRAND_INFO } from '../data/agencyData';
import {
  Menu,
  X,
  ChevronDown,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  activeServiceSlug?: string;
  setActiveServiceSlug?: (slug: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  setActivePage,
  setActiveServiceSlug,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);

  const navigateTo = (page: string, serviceSlug?: string) => {
    setActivePage(page);
    if (serviceSlug && setActiveServiceSlug) {
      setActiveServiceSlug(serviceSlug);
    }
    setMobileMenuOpen(false);
    setServicesDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#050505]/85 backdrop-blur-md border-b border-white/5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => navigateTo('home')}
          className="text-left focus:outline-none cursor-pointer"
          aria-label="VICTORIX Home"
        >
          <Logo size="md" />
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2">
          <button
            onClick={() => navigateTo('home')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activePage === 'home'
                ? 'text-white bg-white/10'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => navigateTo('about')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activePage === 'about'
                ? 'text-white bg-white/10'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            About
          </button>

          {/* Services Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setServicesDropdownOpen(true)}
            onMouseLeave={() => setServicesDropdownOpen(false)}
          >
            <button
              onClick={() => navigateTo('services')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activePage === 'services' || activePage === 'service-detail'
                  ? 'text-[#B68AFF] bg-[#8B45FF]/10'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>Services</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  servicesDropdownOpen ? 'rotate-180 text-[#8B45FF]' : ''
                }`}
              />
            </button>

            {servicesDropdownOpen && (
              <div className="absolute top-full left-0 w-80 pt-2 z-50">
                <div className="bg-[#101014] border border-[#8B45FF]/20 rounded-2xl p-2.5 shadow-2xl shadow-purple-950/40 backdrop-blur-xl">
                  <div className="px-3 py-1.5 mb-1.5 border-b border-white/5 flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      Our Specializations
                    </span>
                    <button
                      onClick={() => navigateTo('services')}
                      className="text-[11px] text-[#B68AFF] hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  <div className="grid gap-1">
                    <button
                      onClick={() => navigateTo('mumbai-location')}
                      className="text-left w-full px-3 py-2 rounded-xl bg-[#8B45FF]/10 hover:bg-[#8B45FF]/20 border border-[#8B45FF]/30 transition-colors group flex items-start justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-[#B68AFF]">
                            Website Developer in Mumbai
                          </span>
                          <span className="text-[9px] bg-[#8B45FF] text-white px-1.5 py-0.2 rounded font-mono">
                            LOCAL SEO
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-300 line-clamp-1 mt-0.5">
                          Top-rated custom web solutions for Mumbai businesses
                        </p>
                      </div>
                    </button>
                    {SERVICES.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => navigateTo('service-detail', s.slug)}
                        className="text-left w-full px-3 py-2 rounded-xl hover:bg-white/5 transition-colors group flex items-start justify-between"
                      >
                        <div>
                          <p className="text-xs font-semibold text-white group-hover:text-[#B68AFF] transition-colors">
                            {s.title}
                          </p>
                          <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                            {s.shortDesc}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => navigateTo('portfolio')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activePage === 'portfolio' || activePage === 'case-study'
                ? 'text-white bg-white/10'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Portfolio
          </button>

          <button
            onClick={() => navigateTo('pricing')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activePage === 'pricing'
                ? 'text-white bg-white/10'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Pricing
          </button>

          <button
            onClick={() => navigateTo('blog')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activePage === 'blog' || activePage === 'blog-detail'
                ? 'text-white bg-white/10'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Blog
          </button>

          <button
            onClick={() => navigateTo('contact')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activePage === 'contact'
                ? 'text-white bg-white/10'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Contact
          </button>
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Admin link button with lock icon */}
          <button
            onClick={() => navigateTo('admin')}
            title="Private Team Admin & AI Client Discovery"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#B68AFF] px-2.5 py-1.5 rounded-lg border border-white/5 hover:border-[#8B45FF]/30 transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#8B45FF]" />
            <span>Admin</span>
          </button>

          {/* WhatsApp Direct CTA */}
          <a
            href={BRAND_INFO.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#8B45FF] hover:bg-[#7932ee] text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-[0_0_20px_rgba(139,69,255,0.4)] hover:shadow-[0_0_25px_rgba(139,69,255,0.6)] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Start Your Project</span>
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex lg:hidden items-center gap-2">
          <a
            href={BRAND_INFO.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-emerald-400 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
            aria-label="WhatsApp"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0a0a0f] border-b border-white/10 px-4 pt-3 pb-6 max-h-[85vh] overflow-y-auto animate-in fade-in slide-in-from-top-2">
          <div className="grid gap-1.5 mb-5">
            <button
              onClick={() => navigateTo('home')}
              className="text-left py-2.5 px-3 rounded-lg text-sm font-semibold text-white hover:bg-white/5"
            >
              Home
            </button>
            <button
              onClick={() => navigateTo('about')}
              className="text-left py-2.5 px-3 rounded-lg text-sm font-semibold text-white hover:bg-white/5"
            >
              About VICTORIX
            </button>
            <button
              onClick={() => navigateTo('services')}
              className="text-left py-2.5 px-3 rounded-lg text-sm font-semibold text-[#B68AFF] hover:bg-white/5 flex items-center justify-between"
            >
              <span>All Services</span>
              <span className="text-[10px] bg-[#8B45FF]/20 px-2 py-0.5 rounded-full">6 Areas</span>
            </button>

            <div className="pl-4 grid gap-1 border-l border-white/10 my-1">
              <button
                onClick={() => navigateTo('mumbai-location')}
                className="text-left py-1.5 px-2 text-xs text-[#B68AFF] font-medium hover:text-white"
              >
                📍 Website Developer in Mumbai
              </button>
              {SERVICES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => navigateTo('service-detail', s.slug)}
                  className="text-left py-1.5 px-2 text-xs text-gray-300 hover:text-white"
                >
                  {s.title}
                </button>
              ))}
            </div>

            <button
              onClick={() => navigateTo('portfolio')}
              className="text-left py-2.5 px-3 rounded-lg text-sm font-semibold text-white hover:bg-white/5"
            >
              Portfolio (Case Studies)
            </button>
            <button
              onClick={() => navigateTo('pricing')}
              className="text-left py-2.5 px-3 rounded-lg text-sm font-semibold text-white hover:bg-white/5"
            >
              Pricing Packages
            </button>
            <button
              onClick={() => navigateTo('blog')}
              className="text-left py-2.5 px-3 rounded-lg text-sm font-semibold text-white hover:bg-white/5"
            >
              Engineering Blog
            </button>
            <button
              onClick={() => navigateTo('contact')}
              className="text-left py-2.5 px-3 rounded-lg text-sm font-semibold text-white hover:bg-white/5"
            >
              Contact Us (WhatsApp)
            </button>
            <button
              onClick={() => navigateTo('admin')}
              className="text-left py-2.5 px-3 rounded-lg text-xs font-semibold text-gray-400 hover:text-[#B68AFF] flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-[#8B45FF]" />
              <span>Admin & AI Client Finder</span>
            </button>
          </div>

          <div className="pt-3 border-t border-white/10">
            <a
              href={BRAND_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-black font-bold py-3 px-4 rounded-xl text-sm"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Chat with Vicky on WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
