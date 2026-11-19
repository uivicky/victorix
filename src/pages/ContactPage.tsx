import React, { useState } from 'react';
import { BRAND_INFO, SERVICES } from '../data/agencyData';
import { MessageCircle, CheckCircle2, Send, Clock, ShieldCheck, Sparkles, MapPin } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: 'Business Website Development',
    timeline: '1-2 Weeks',
    projectDetails: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEnquiry, setSubmittedEnquiry] = useState<{
    id: string;
    whatsappMessageUrl: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim() || !formData.phone.trim()) {
      setErrorMessage('Please provide your name and WhatsApp contact number.');
      return;
    }

    setIsSubmitting(true);

    try {
      // POST to backend /api/enquiries to save inquiry into server database
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmittedEnquiry({
          id: data.enquiry.id,
          whatsappMessageUrl: data.whatsappUrl,
        });
      } else {
        // Fallback local format
        const formattedMsg = encodeURIComponent(
          `Hi Vicky, my name is ${formData.name}.\n\nService Needed: ${formData.service}\nTimeline: ${formData.timeline}\nPhone: ${formData.phone}\nProject Overview: ${formData.projectDetails || 'Discussing new project'}`
        );
        setSubmittedEnquiry({
          id: `local-${Date.now()}`,
          whatsappMessageUrl: `${BRAND_INFO.whatsappUrl}?text=${formattedMsg}`,
        });
      }
    } catch (err) {
      // If offline/network glitch, still construct the direct WhatsApp bridge
      const formattedMsg = encodeURIComponent(
        `Hi Vicky, my name is ${formData.name}.\n\nService: ${formData.service}\nPhone: ${formData.phone}\nDetails: ${formData.projectDetails}`
      );
      setSubmittedEnquiry({
        id: `local-${Date.now()}`,
        whatsappMessageUrl: `${BRAND_INFO.whatsappUrl}?text=${formattedMsg}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <SEOHead
        title="Contact VICTORIX – Official WhatsApp Channel"
        description="Connect directly with Vicky Vishwakarma & Abhishek on WhatsApp (+91 6387661594). Fast project consultations for websites and AI web solutions."
        canonicalPath="/contact"
      />

      {/* Header */}
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B45FF]/10 border border-[#8B45FF]/30 text-xs font-mono text-[#B68AFF]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>DIRECT WHATSAPP CHANNEL</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-display font-extrabold text-white tracking-tight">
          Let&apos;s Discuss Your Website Project.
        </h1>
        <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
          At VICTORIX, we don&apos;t make you wait days for slow email replies. Reach Vicky and Abhishek directly on our official WhatsApp desk for fast, friendly, and actionable guidance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Direct WhatsApp Contact Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl bg-[#0e0e14] border border-[#8B45FF]/30 p-8 space-y-6 shadow-2xl">
            <span className="text-xs font-mono uppercase text-[#B68AFF] font-bold">
              Primary Communication Desk
            </span>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#050505] border border-white/5 space-y-2">
                <span className="text-xs text-gray-400 block font-medium">Official WhatsApp Number:</span>
                <p className="text-2xl font-display font-extrabold text-white tracking-wider font-mono">
                  {BRAND_INFO.whatsappNumber}
                </p>
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Direct Team Access (Vicky &amp; Abhishek)</span>
                </div>
              </div>

              <div className="space-y-3 text-xs text-gray-300">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>Instant voice notes or chat directly with the engineers.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>No corporate delays, automated bot menus, or spam queues.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>Send reference links, sketches, or voice notes anytime.</span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={BRAND_INFO.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] text-black font-extrabold text-sm py-4 px-6 rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>Open WhatsApp Direct Chat</span>
                </a>
              </div>
            </div>
          </div>

          {/* Location & Planned Domain */}
          <div className="p-6 rounded-2xl bg-[#0a0a0f] border border-white/5 space-y-3 text-xs text-gray-400">
            <div className="flex items-center gap-2.5 text-white">
              <MapPin className="w-4 h-4 text-[#8B45FF]" />
              <span className="font-semibold">{BRAND_INFO.location}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Official Planned Domain: <strong className="text-white">{BRAND_INFO.plannedDomain}</strong></span>
            </div>
            <p className="text-[11px] text-gray-500 pt-1">
              Note: To maintain rapid client response times and prevent email scraping, WhatsApp is our exclusive public contact channel.
            </p>
          </div>
        </div>

        {/* Right Column: Project Brief Form */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl bg-[#0d0d12] border border-white/10 p-8 sm:p-10 space-y-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-white">
                Submit a Project Brief
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Share your requirements below. Your enquiry will be securely registered in our system and formatted for instant WhatsApp dispatch.
              </p>
            </div>

            {submittedEnquiry ? (
              <div className="p-8 rounded-2xl bg-[#101814] border border-emerald-500/40 text-center space-y-5 animate-in fade-in duration-300">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-display font-bold text-white">
                    Enquiry Saved Successfully!
                  </h3>
                  <p className="text-xs text-gray-300 max-w-md mx-auto">
                    Your project details have been logged in our secure database. Tap below to send this formatted brief directly to Vicky on WhatsApp to begin the conversation.
                  </p>
                </div>

                <div className="pt-2">
                  <a
                    href={submittedEnquiry.whatsappMessageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-black font-extrabold text-xs px-6 py-3.5 rounded-xl shadow-lg transition-transform hover:scale-105"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Launch Pre-Filled WhatsApp Message</span>
                  </a>
                </div>

                <div>
                  <button
                    onClick={() => {
                      setSubmittedEnquiry(null);
                      setFormData({
                        name: '',
                        phone: '',
                        service: 'Business Website Development',
                        timeline: '1-2 Weeks',
                        projectDetails: '',
                      });
                    }}
                    className="text-xs text-gray-400 hover:text-white underline mt-2"
                  >
                    Submit another project enquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs">
                    {errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300 block">
                      Your Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#101014] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#8B45FF]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300 block">
                      WhatsApp Contact Number <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#101014] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#8B45FF]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300 block">
                      Service Required
                    </label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full bg-[#101014] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#8B45FF]"
                    >
                      {SERVICES.map((s) => (
                        <option key={s.id} value={s.title} className="bg-[#101014]">
                          {s.title}
                        </option>
                      ))}
                      <option value="General Consultation" className="bg-[#101014]">
                        General Web Consultation
                      </option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300 block">
                      Expected Timeline
                    </label>
                    <select
                      value={formData.timeline}
                      onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                      className="w-full bg-[#101014] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#8B45FF]"
                    >
                      <option value="ASAP (within 1 week)" className="bg-[#101014]">
                        Urgent (Within 1 Week)
                      </option>
                      <option value="1-2 Weeks" className="bg-[#101014]">
                        Standard (1-2 Weeks)
                      </option>
                      <option value="1 Month" className="bg-[#101014]">
                        Flexible (Within a Month)
                      </option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 block">
                    Project Overview &amp; Goals
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us about your business, what pages you envision, any reference websites, or specific features you need..."
                    value={formData.projectDetails}
                    onChange={(e) => setFormData({ ...formData, projectDetails: e.target.value })}
                    className="w-full bg-[#101014] border border-white/10 rounded-xl p-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#8B45FF]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-[#8B45FF] hover:bg-[#7830ee] disabled:opacity-50 text-white font-bold text-xs py-4 px-6 rounded-xl shadow-lg shadow-purple-900/30 transition-all hover:scale-[1.01]"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Saving Enquiry...' : 'Save & Open in WhatsApp'}</span>
                </button>

                <p className="text-[11px] text-gray-500 text-center">
                  Your enquiry will be saved to VICTORIX&apos;s database and then opened in WhatsApp for instant conversation.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
