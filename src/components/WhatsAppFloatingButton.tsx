import React, { useState } from 'react';
import { MessageCircle, X, ArrowUpRight } from 'lucide-react';
import { BRAND_INFO } from '../data/agencyData';

export const WhatsAppFloatingButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const defaultMessage = encodeURIComponent(
    'Hi Vicky, I would like to discuss a website development project with VICTORIX.'
  );
  const whatsappUrl = `${BRAND_INFO.whatsappUrl}?text=${defaultMessage}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Mini Chat Card Popup when clicked */}
      {isOpen && (
        <div className="mb-3 w-72 sm:w-80 rounded-2xl bg-[#101014] border border-[#8B45FF]/30 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#8B45FF] to-[#25D366] flex items-center justify-center text-white font-bold text-sm shadow-md">
                  VX
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#101014]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">VICTORIX Direct</p>
                <p className="text-[11px] text-emerald-400">Vicky & Abhishek Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors"
              aria-label="Close WhatsApp chat popup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-[#050505] rounded-xl p-3 border border-white/5 mb-3 text-xs text-gray-300 leading-relaxed">
            <p>
              Need a modern, fast, and SEO-friendly website for your business or school? Chat directly with us on WhatsApp.
            </p>
            <p className="text-[11px] text-gray-500 mt-1 font-mono">
              Official: {BRAND_INFO.whatsappNumber}
            </p>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-black font-semibold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Chat on WhatsApp Now</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-black font-bold p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-[0_4px_25px_rgba(37,211,102,0.4)] hover:shadow-[0_4px_30px_rgba(37,211,102,0.6)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
        aria-label="Chat with VICTORIX on WhatsApp"
      >
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-white"></span>
        </span>
        <MessageCircle className="w-6 h-6 fill-current text-black" />
        <span className="hidden sm:inline-block text-xs font-extrabold uppercase tracking-wider text-black">
          Chat on WhatsApp
        </span>
      </button>
    </div>
  );
};
