import { GoogleGenAI } from '@google/genai';
import { storage } from './storage.js';
import { ProposalDraft, RemoteJob } from '../src/types/index.js';

const GEMINI_DAILY_LIMIT = 1500;

function getAiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'YOUR_GEMINI_API_KEY' || key === 'MY_GEMINI_API_KEY' || key.trim().length < 10) {
    return null;
  }

  storage.rolloverQuotasIfNeeded();
  const throttlePct = storage.state.userSettings.autoThrottleAiAtPct || 85;
  const maxAllowed = Math.floor((GEMINI_DAILY_LIMIT * throttlePct) / 100);
  if (storage.state.quotas.geminiRequestsToday >= maxAllowed) {
    return null; // Free-tier cost & quota guardrail: switch to deterministic fallback
  }

  return new GoogleGenAI({
    apiKey: key.trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export async function generateAiProposal(lead: {
  businessName: string;
  websiteUrl: string;
  category: string;
  recommendedService: string;
  observedIssues: string[];
}): Promise<ProposalDraft> {
  const referenceProject =
    lead.recommendedService === 'School Website Development'
      ? 'Little World School (https://little-world-school.vercel.app/)'
      : 'FixDesk (https://fixdesk-3.vercel.app/)';

  const ai = getAiClient();
  if (ai) {
    try {
      storage.state.quotas.geminiRequestsToday += 1;
      const prompt = `You are Vicky Vishwakarma, founder of VICTORIX, a digital agency in Mumbai (domain: victorix.in, WhatsApp: +91 6387661594).
Draft a concise, strictly honest, non-spammy proposal for:
Business Name: ${lead.businessName}
Category: ${lead.category}
Website URL: ${lead.websiteUrl}
Recommended Service: ${lead.recommendedService}
Observed Technical Gaps: ${lead.observedIssues.join('; ') || 'Mobile & technical SEO optimization opportunity'}
Relevant Verified Work: ${referenceProject}

Rules:
- Never promise #1 Google rankings or guaranteed leads/traffic.
- Mention static fast-loading website packages starting from ₹5,999 with zero database hosting cost.
- Return valid JSON only:
{
  "subjectLine": "Concise subject",
  "intro": "Warm 1-2 sentence greeting from Vicky at VICTORIX",
  "observedGaps": ["Gap 1", "Gap 2"],
  "solutionProposal": "Concrete 2-sentence static edge solution",
  "suggestedNextStep": "Polite invitation to reply on WhatsApp",
  "whatsappMessage": "Short respectful 2-3 sentence WhatsApp message ready for Vicky to review and send"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        storage.save();
        return {
          id: `prop-${Date.now()}`,
          leadId: '',
          businessName: lead.businessName,
          websiteUrl: lead.websiteUrl,
          recommendedService: lead.recommendedService,
          relevantVictorixProjects: [referenceProject],
          subjectLine: parsed.subjectLine || `Website Performance & SEO Proposal for ${lead.businessName}`,
          intro: parsed.intro || `Hi ${lead.businessName} Team, Vicky from VICTORIX here.`,
          observedGaps: Array.isArray(parsed.observedGaps) ? parsed.observedGaps : lead.observedIssues.slice(0, 3),
          solutionProposal:
            parsed.solutionProposal ||
            `We can modernize your site on zero-cost static edge hosting (packages starting ₹5,999) modeled after ${referenceProject}.`,
          suggestedNextStep: parsed.suggestedNextStep || 'Would you like us to send a proposal demo link via WhatsApp?',
          whatsappMessage:
            parsed.whatsappMessage ||
            `Hi ${lead.businessName} Team, Vicky from VICTORIX here. We checked your website and noticed opportunities to improve mobile speed and SEO. We build fast static websites starting at ₹5,999. Would you like to see a demo preview?`,
          status: 'draft',
          updatedAt: new Date().toISOString(),
        };
      }
    } catch (err) {
      console.warn('Gemini fallback triggered for proposal:', (err as Error).message);
    }
  }

  return {
    id: `prop-${Date.now()}`,
    leadId: '',
    businessName: lead.businessName,
    websiteUrl: lead.websiteUrl,
    recommendedService: lead.recommendedService,
    relevantVictorixProjects: [referenceProject],
    subjectLine: `Modernizing Web Speed & Local SEO for ${lead.businessName}`,
    intro: `Hi ${lead.businessName} Team, Vicky from VICTORIX (Mumbai) here. We reviewed your public web presence in ${lead.category} and noted a few practical technical improvements.`,
    observedGaps:
      lead.observedIssues.length > 0
        ? lead.observedIssues.slice(0, 3)
        : ['Opportunity to strengthen mobile viewport optimization, Schema.org markup, and WhatsApp lead routing.'],
    solutionProposal: `VICTORIX can deploy a clean, database-free static website on global CDN starting at ₹5,999 (inspired by our verified deployment ${referenceProject}), helping customers contact you directly via WhatsApp.`,
    suggestedNextStep: 'Would you like us to prepare a static proposal demo preview for your review?',
    whatsappMessage: `Hi ${lead.businessName} Team, Vicky from VICTORIX here. We noticed a few speed & mobile SEO improvements for your website. We build fast static business websites starting at ₹5,999 (examples: ${referenceProject}). Would you like to view a quick proposal preview?`,
    status: 'draft',
    updatedAt: new Date().toISOString(),
  };
}

export async function generateJobApplicationAssist(
  job: RemoteJob,
  applicantSkills: string[]
): Promise<{
  messageDraft: string;
  cvSuggestions: string[];
}> {
  const ai = getAiClient();
  const matchedSkills = applicantSkills.filter((skill) =>
    `${job.jobTitle} ${job.category} ${job.description}`.toLowerCase().includes(skill.toLowerCase())
  );

  if (ai) {
    try {
      storage.state.quotas.geminiRequestsToday += 1;
      const prompt = `Draft a concise, truthful application message and honest CV checklist for this remote job.
STRICT RULES:
- Applicant uses a laptop and mobile phone in India.
- Applicant verified skills: ${applicantSkills.join(', ')}.
- NEVER fabricate skills, past employers, degrees, or experience not listed above.
- Suggest only honest CV tailoring tips (e.g., highlighting relevant real projects or wording clarity).

Job Title: ${job.jobTitle}
Employer: ${job.employerName}
Category: ${job.category}
Excerpt: ${job.description.slice(0, 600)}

Return JSON:
{
  "messageDraft": "Short 3-4 sentence truthful cover message",
  "cvSuggestions": ["Actionable honest CV suggestion 1", "Suggestion 2", "Suggestion 3"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        storage.save();
        return {
          messageDraft: parsed.messageDraft,
          cvSuggestions: Array.isArray(parsed.cvSuggestions) ? parsed.cvSuggestions : [],
        };
      }
    } catch (err) {
      console.warn('Gemini fallback triggered for job assist:', (err as Error).message);
    }
  }

  const skillFocus =
    matchedSkills.length > 0
      ? matchedSkills.slice(0, 4).join(', ')
      : applicantSkills.slice(0, 4).join(', ');

  return {
    messageDraft: `Hello ${job.employerName} Hiring Team,\n\nI am writing to apply for the ${job.jobTitle} role (${job.remoteStatus}). Based in India with a dedicated laptop and reliable mobile setup, I have hands-on experience in ${skillFocus} and building responsive, SEO-friendly web interfaces.\n\nI would welcome the opportunity to contribute to your team. Thank you for reviewing my application.`,
    cvSuggestions: [
      `Place your relevant verified skills (${skillFocus}) clearly in the top Summary section of your CV.`,
      `Include verifiable live links to completed work (such as Little World School and FixDesk if relevant to web/digital roles) rather than generic statements.`,
      `Verify your CV matches keywords from "${job.jobTitle}" truthfully without adding unverified claims.`,
      `Confirm your timezone (IST / UTC+5:30) and remote workstation availability (laptop + stable internet) upfront.`,
    ],
  };
}

export async function generateBlogAiDraft(
  topic: string,
  targetKeywords: string,
  category: string
): Promise<{
  title: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
  keywords: string[];
  content: string;
}> {
  const ai = getAiClient();
  if (ai) {
    try {
      storage.state.quotas.geminiRequestsToday += 1;
      const prompt = `You are Vicky Vishwakarma, founder of VICTORIX (https://victorix.in). Write a practical engineering & SEO article.
Topic: ${topic}
Keywords: ${targetKeywords || 'website developer in Mumbai'}
Category: ${category || 'Guides'}
Rules: Never promise #1 Google rankings. Mention starting website price ₹5,999 for static sites on Cloudflare Pages Free and reference Little World School / FixDesk truthfully.
Return valid JSON:
{
  "title": "...",
  "seoTitle": "...",
  "seoDescription": "...",
  "excerpt": "...",
  "keywords": ["..."],
  "content": "Markdown content with ### headings"
}`;
      const aiResp = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });
      if (aiResp.text) {
        storage.save();
        return JSON.parse(aiResp.text);
      }
    } catch (err) {
      console.warn('Gemini fallback triggered for blog draft:', (err as Error).message);
    }
  }

  return {
    title: `${topic}: Practical Guide for Indian Businesses`,
    seoTitle: `${topic} | VICTORIX Engineering`,
    seoDescription: `Learn practical ${topic} architecture for fast, static, SEO-ready business websites starting at ₹5,999.`,
    excerpt: `An engineering breakdown of ${topic} designed for small businesses seeking fast static websites without monthly hosting overhead.`,
    keywords: (targetKeywords || 'website development, technical SEO, Mumbai web developer')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    content: `### Overview: ${topic}\n\nModern Indian businesses need clean, mobile-first websites that load quickly on 4G/5G connections without expensive server fees.\n\n#### Why Static Architecture Matters\n- Zero compulsory database overhead for brochure & business sites\n- Deployed on Cloudflare Pages Free with global CDN and HTTPS\n- Direct WhatsApp lead routing (+91 6387661594)\n\n#### Verified Production Benchmarks\nExplore our verified work on **Little World School** and **FixDesk**, starting from ₹5,999 for Starter Static websites.`,
  };
}
