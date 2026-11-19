import {
  JobVerificationEvidence,
  JobRiskClassification,
  JobSuitabilityScore,
  DeviceCompatibility,
  WorkType,
  ExperienceLevel,
  SalaryBucket,
  IndiaEligibilityStatus,
} from '../src/types/index.js';

const PROHIBITED_PAYMENT_PATTERNS = [
  /registration\s*fee/i,
  /security\s*deposit/i,
  /refundable\s*deposit/i,
  /training\s*fee/i,
  /mandatory\s*paid\s*training/i,
  /pay\s*to\s*(start|unlock|apply|join|register)/i,
  /guaranteed\s*placement\s*fee/i,
  /bank\s*(password|pin|login|credentials)/i,
  /send\s*(otp|cvv|atm\s*pin)/i,
  /processing\s*fee/i,
  /id\s*card\s*charges/i,
];

const SUSPICIOUS_SCAM_INDICATORS = [
  /earn\s*[₹$]\s*\d{4,}\s*(per|\/)\s*(day|hour)/i,
  /daily\s*payout\s*₹\s*[3-9]\d{3}/i,
  /telegram\s*(only|me|@)/i,
  /whatsapp\s*only\s*interview/i,
  /no\s*skills?\s*required.*high\s*pay/i,
  /captcha\s*typing\s*job/i,
  /copy\s*paste\s*typing.*₹/i,
  /form\s*filling\s*job/i,
];

const FREE_WEBMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'rediffmail.com'];

const TRUSTED_JOB_HOSTS = [
  'remoteok.com',
  'remotive.com',
  'weworkremotely.com',
  'jobicy.com',
  'himalayas.app',
  'workingnomads.com',
  'arbeitnow.com',
  'ncs.gov.in',
  'greenhouse.io',
  'lever.co',
  'ashbyhq.com',
  'recruitee.com',
  'workable.com',
  'personio.de',
  'personio.com',
  'wellfound.com',
];

export function detectDeviceCompatibility(text: string): DeviceCompatibility {
  const lower = text.toLowerCase();
  if (lower.includes('mobile friendly') || lower.includes('smartphone only') || lower.includes('via phone')) {
    if (lower.includes('laptop') || lower.includes('desktop')) return 'Both supported';
    return 'Mobile friendly';
  }
  if (
    lower.includes('react') ||
    lower.includes('wordpress') ||
    lower.includes('html') ||
    lower.includes('css') ||
    lower.includes('typescript') ||
    lower.includes('javascript') ||
    lower.includes('developer') ||
    lower.includes('engineer') ||
    lower.includes('qa') ||
    lower.includes('testing') ||
    lower.includes('code') ||
    lower.includes('canva') ||
    lower.includes('seo') ||
    lower.includes('design')
  ) {
    return 'Laptop required';
  }
  if (
    lower.includes('virtual assistant') ||
    lower.includes('chat support') ||
    lower.includes('email support') ||
    lower.includes('customer support') ||
    lower.includes('social media') ||
    lower.includes('data entry') ||
    lower.includes('research') ||
    lower.includes('annotation')
  ) {
    return 'Laptop preferred';
  }
  return 'Not specified';
}

export function classifyIndiaEligibility(
  countryEligibility: string,
  description = ''
): IndiaEligibilityStatus {
  const loc = (countryEligibility || '').toLowerCase().trim();
  const combined = `${loc} ${description.slice(0, 800).toLowerCase()}`;

  const explicitExclusionPatterns = [
    /\busa?\s*only\b/i,
    /\bunited\s*states\s*only\b/i,
    /\bmust\s*(be\s*based|reside|live)\s*in\s*(the\s*)?(us|usa|united states|uk|canada|eu|europe|germany|australia)\b/i,
    /\bauthorized\s*to\s*work\s*in\s*(the\s*)?(us|usa|united states|canada|uk|eu)\b/i,
    /\bno\s*visa\s*sponsorship.*us\s*citizens\b/i,
    /\buk\s*only\b/i,
    /\beurope\s*only\b/i,
    /\beu\s*only\b/i,
    /\bcanada\s*only\b/i,
    /\baustralia\s*only\b/i,
    /\bgermany\s*only\b/i,
    /\bnot\s*available\s*in\s*india\b/i,
    /\bexcluding\s*india\b/i,
  ];

  // Check explicit India acceptance first (unless explicitly excluded)
  const acceptsIndiaExplicitly =
    /\bindia\b/i.test(loc) ||
    /\bmumbai\b|\bbengaluru\b|\bbangalore\b|\bdelhi\b|\bhyderabad\b|\bpune\b|\bchennai\b/i.test(loc) ||
    /\bist\b|\butc\s*\+\s*5:30\b/i.test(loc);

  if (acceptsIndiaExplicitly && !/\bexcluding\s*india\b|\bnot\s*available\s*in\s*india\b/i.test(combined)) {
    return 'Explicitly accepts India applicants';
  }

  for (const pat of explicitExclusionPatterns) {
    if (pat.test(loc)) {
      return 'Not eligible for India applicants';
    }
  }

  if (
    /\bworldwide\b|\banywhere\b|\bglobal\b|\binternational\b|\bwork from anywhere\b|\bremote\s*-\s*anywhere\b/i.test(
      loc
    )
  ) {
    // Double check description didn't secretly restrict to US/EU only
    if (explicitExclusionPatterns.slice(0, 5).some((p) => p.test(description.slice(0, 1200)))) {
      return 'Region restricted';
    }
    return 'Worldwide applicants';
  }

  if (/\bapac\b|\basia\b/i.test(loc)) {
    return 'Explicitly accepts India applicants';
  }

  if (
    /\b(usa|united states|us|uk|united kingdom|canada|australia|germany|france|netherlands|singapore|uae|dubai|europe|emea|latam|latin america|africa|north america)\b/i.test(
      loc
    )
  ) {
    return 'Region restricted';
  }

  return 'India eligibility unclear';
}

export function classifyCountryBucket(countryEligibility: string): string {
  const loc = (countryEligibility || '').toLowerCase();
  if (/\bindia\b|\bmumbai\b|\bbengaluru\b|\bbangalore\b|\bdelhi\b|\bhyderabad\b|\bpune\b/i.test(loc)) {
    return 'India';
  }
  if (/\bworldwide\b|\banywhere\b|\bglobal\b|\binternational\b/i.test(loc)) {
    return 'Worldwide / Anywhere';
  }
  if (/\bunited states\b|\busa\b|\b\bus\b\b/i.test(loc)) return 'USA';
  if (/\bunited kingdom\b|\b\buk\b\b|\bengland\b|\blondon\b/i.test(loc)) return 'UK';
  if (/\bcanada\b|\btoronto\b|\bvancouver\b/i.test(loc)) return 'Canada';
  if (/\baustralia\b|\bsydney\b|\bmelbourne\b/i.test(loc)) return 'Australia';
  if (/\bgermany\b|\bberlin\b|\bmunich\b|\bdeutschland\b/i.test(loc)) return 'Germany';
  if (/\bfrance\b|\bparis\b/i.test(loc)) return 'France';
  if (/\bnetherlands\b|\bamsterdam\b|\bholland\b/i.test(loc)) return 'Netherlands';
  if (/\bsingapore\b/i.test(loc)) return 'Singapore';
  if (/\buae\b|\bdubai\b|\babu dhabi\b|\bunited arab emirates\b/i.test(loc)) return 'UAE';
  if (/\beurope\b|\bemea\b|\beu\b/i.test(loc)) return 'Europe';
  if (/\basia\b|\bapac\b/i.test(loc)) return 'Asia';
  if (/\bafrica\b/i.test(loc)) return 'Africa';
  if (/\blatin america\b|\blatam\b|\bbrazil\b|\bmexico\b|\bargentina\b/i.test(loc)) return 'Latin America';
  return 'Worldwide / Anywhere';
}

export function classifyWorkType(rawType: string, title: string, desc: string): WorkType {
  const combined = `${rawType} ${title}`.toLowerCase();
  const full = `${combined} ${desc.slice(0, 500).toLowerCase()}`;
  if (combined.includes('intern')) return 'Internship';
  if (combined.includes('freelance') || combined.includes('gig')) return 'Freelance';
  if (combined.includes('contract')) return 'Contract';
  if (combined.includes('part-time') || combined.includes('part_time') || combined.includes('part time')) {
    return 'Part-time';
  }
  if (combined.includes('temporary') || combined.includes('temp')) return 'Temporary';
  if (combined.includes('hybrid')) return 'Hybrid';
  if (
    combined.includes('full-time') ||
    combined.includes('full_time') ||
    combined.includes('full time') ||
    combined.includes('permanent')
  ) {
    return 'Full-time';
  }
  if (full.includes('fully remote') || full.includes('100% remote') || full.includes('remote')) {
    return 'Fully remote';
  }
  return 'Not specified';
}

export function classifyExperienceLevel(rawLevel: string, title: string, desc: string): ExperienceLevel {
  const combined = `${rawLevel} ${title}`.toLowerCase();
  if (/\bno\s*experience\b|\bfresher\b|\bzero\s*experience\b/i.test(combined)) return 'No experience';
  if (/\bentry[\s-]*level\b|\bintern\b|\btrainee\b|\bgraduate\b/i.test(combined)) return 'Entry level';
  if (/\bjunior\b|\bjr\.?\b|\bassociate\b/i.test(combined)) return 'Junior';
  if (/\bsenior\b|\bsr\.?\b|\blead\b|\bprincipal\b|\bstaff\b|\bhead of\b|\barchitect\b/i.test(combined)) {
    return 'Senior';
  }
  if (/\bmid[\s-]*level\b|\bintermediate\b/i.test(combined)) return 'Mid-level';

  const d = desc.slice(0, 800).toLowerCase();
  if (/\b0-1\s*year|\b0\s*years\b|\bno prior experience\b/i.test(d)) return 'No experience';
  if (/\b1-2\s*years\b|\bentry level\b/i.test(d)) return 'Entry level';
  if (/\b5\+\s*years|\b6\+\s*years|\b7\+\s*years/i.test(d)) return 'Senior';
  if (/\b2-4\s*years|\b3\+\s*years/i.test(d)) return 'Mid-level';
  return 'Not specified';
}

// Strict currency honesty rule: NEVER invent USD conversions for non-USD currencies!
export function classifySalaryBucket(salaryRange?: string | null): SalaryBucket {
  if (!salaryRange || !salaryRange.trim()) return 'Unpaid / not disclosed';
  const raw = salaryRange.trim();
  const lower = raw.toLowerCase();

  // Only numeric USD parsing if explicitly USD / $
  const isUsd = lower.includes('$') || lower.includes('usd') || lower.includes('us$');
  if (!isUsd) {
    // Disclosed in INR, EUR, GBP, etc. -> never invent conversion
    if (/\d/.test(raw)) return 'Other / non-USD disclosed';
    return 'Unpaid / not disclosed';
  }

  // Extract numeric values from USD string (handling e.g. "$50k - $80k", "$1,500/mo", "$25/hr")
  const nums: number[] = [];
  const matches = raw.matchAll(/(\d+(?:[.,]\d+)?)\s*(k)?/gi);
  for (const m of matches) {
    let val = parseFloat(m[1].replace(/,/g, ''));
    if (Number.isNaN(val) || val <= 0) continue;
    if (m[2] && m[2].toLowerCase() === 'k') val *= 1000;
    nums.push(val);
  }
  if (nums.length === 0) return 'Unpaid / not disclosed';

  // Use average of range if min & max given
  const avg = nums.length >= 2 ? (nums[0] + nums[1]) / 2 : nums[0];
  let monthlyUsd = avg;

  if (lower.includes('/hr') || lower.includes('per hour') || lower.includes('hourly')) {
    monthlyUsd = avg * 160;
  } else if (lower.includes('/wk') || lower.includes('per week') || lower.includes('weekly')) {
    monthlyUsd = avg * 4.33;
  } else if (
    lower.includes('/yr') ||
    lower.includes('per year') ||
    lower.includes('annual') ||
    lower.includes('year') ||
    avg >= 12000 // standard annual salary threshold when unit omitted in USD job boards
  ) {
    monthlyUsd = avg / 12;
  }

  if (monthlyUsd < 500) return 'Under $500/month';
  if (monthlyUsd < 1000) return '$500–$1,000/month';
  if (monthlyUsd < 2000) return '$1,000–$2,000/month';
  if (monthlyUsd <= 5000) return '$2,000–$5,000/month';
  return 'Above $5,000/month';
}

export function evaluateJobScamAndSuitability(input: {
  jobId: string;
  jobTitle: string;
  employerName: string;
  companyWebsite?: string;
  description: string;
  originalPostingUrl: string;
  applicationUrl: string;
  source: string;
  publishedAt: string;
  applicationDeadline?: string | null;
  salaryRange?: string | null;
  employmentType?: string;
  experienceRequired?: string | null;
  countryEligibility: string;
  category: string;
  applicantSkills: string[];
}): {
  evidence: JobVerificationEvidence;
  suitability: JobSuitabilityScore;
  deviceCompatibility: DeviceCompatibility;
  indiaEligibility: IndiaEligibilityStatus;
  locationCountryBucket: string;
  workType: WorkType;
  experienceLevel: ExperienceLevel;
  salaryBucket: SalaryBucket;
  isExpired: boolean;
} {
  const combinedText = `${input.jobTitle}\n${input.employerName}\n${input.description}`;
  const paymentScamSignals: string[] = [];
  const riskFlags: string[] = [];
  const positiveEvidence: string[] = [];

  // 1. Check prohibited payment/credential requests
  for (const pat of PROHIBITED_PAYMENT_PATTERNS) {
    const match = combinedText.match(pat);
    if (match) {
      paymentScamSignals.push(`Prohibited payment/credential phrase detected: "${match[0]}"`);
    }
  }

  // 2. Check scam indicators
  for (const pat of SUSPICIOUS_SCAM_INDICATORS) {
    const match = combinedText.match(pat);
    if (match) {
      riskFlags.push(`Suspicious recruitment claim: "${match[0]}"`);
    }
  }

  // 3. Domain & URL authenticity inspection
  let postDomain = '';
  let appDomain = '';
  let compDomain = '';
  try {
    postDomain = new URL(input.originalPostingUrl).hostname.toLowerCase();
  } catch {
    riskFlags.push('Invalid original posting URL');
  }
  try {
    appDomain = new URL(input.applicationUrl).hostname.toLowerCase();
  } catch {
    riskFlags.push('Invalid application URL');
  }
  if (input.companyWebsite) {
    try {
      compDomain = new URL(input.companyWebsite).hostname.toLowerCase().replace(/^www\./, '');
    } catch {
      // ignore invalid optional website
    }
  }

  const isTrustedPostSource = TRUSTED_JOB_HOSTS.some((h) => postDomain.endsWith(h));
  const isTrustedAppHost = TRUSTED_JOB_HOSTS.some((h) => appDomain.endsWith(h));
  const employerDomainMatch = Boolean(
    compDomain &&
      (appDomain.includes(compDomain) || postDomain.includes(compDomain) || isTrustedAppHost)
  );

  if (isTrustedPostSource) {
    positiveEvidence.push(`Sourced from recognized platform (${postDomain})`);
  }
  if (employerDomainMatch && compDomain) {
    positiveEvidence.push(`Application/source matches employer domain (${compDomain}) or verified ATS`);
  } else if (!input.companyWebsite && !isTrustedPostSource) {
    riskFlags.push('No verifiable official employer website provided');
  }

  if (FREE_WEBMAIL_DOMAINS.some((d) => combinedText.toLowerCase().includes(`@${d}`))) {
    riskFlags.push('Recruiter contact uses free personal webmail instead of corporate domain');
  }

  // 4. Expiration check (> 45 days old OR past explicit applicationDeadline)
  const pubMs = new Date(input.publishedAt).getTime();
  const ageDays = Number.isNaN(pubMs) ? 0 : (Date.now() - pubMs) / (1000 * 86400);
  const deadlineMs = input.applicationDeadline ? new Date(input.applicationDeadline).getTime() : NaN;
  const pastDeadline = !Number.isNaN(deadlineMs) && deadlineMs < Date.now();
  const isExpired = ageDays > 45 || pastDeadline;

  if (pastDeadline) {
    riskFlags.push(`Application deadline expired on ${new Date(deadlineMs).toISOString().slice(0, 10)}`);
  } else if (ageDays > 45) {
    riskFlags.push(`Listing is ${Math.round(ageDays)} days old (likely expired > 45 days)`);
  } else if (!Number.isNaN(pubMs)) {
    positiveEvidence.push(`Active listing (${Math.max(0, Math.round(ageDays))} days old)`);
  }

  if (!input.employerName || input.employerName.toLowerCase() === 'unknown') {
    riskFlags.push('Missing clear employer identity');
  } else {
    positiveEvidence.push(`Employer stated: ${input.employerName}`);
  }

  // 5. Strict Classification Logic (NEVER say "100% genuine")
  let classification: JobRiskClassification = 'NEEDS REVIEW';
  let explanation = '';

  if (paymentScamSignals.length > 0 || isExpired) {
    classification = 'REJECTED';
    explanation =
      paymentScamSignals.length > 0
        ? 'Blocked due to prohibited upfront fee, deposit, or sensitive credential request.'
        : pastDeadline
        ? 'Listing rejected because the employer expiry/deadline date has passed.'
        : 'Listing rejected because posting age exceeds 45-day freshness policy.';
  } else if (riskFlags.length >= 2) {
    classification = 'SUSPICIOUS';
    explanation =
      'Multiple scam/credibility warning flags detected. Do not share personal data without independent verification.';
  } else if (positiveEvidence.length >= 3 && riskFlags.length === 0) {
    classification = 'VERIFIED';
    explanation =
      'Supporting verification evidence from recognized remote source with zero payment scam indicators (still verify contract terms independently).';
  } else {
    classification = 'NEEDS REVIEW';
    explanation =
      'No direct scam fee flags found, but independent verification of the employer website is recommended before applying.';
  }

  const evidence: JobVerificationEvidence = {
    id: `ev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    jobId: input.jobId,
    classification,
    employerDomainMatch,
    officialWebsiteReachable: Boolean(input.companyWebsite),
    paymentScamSignals,
    positiveEvidence,
    riskFlags,
    explanation,
    checkedAt: new Date().toISOString(),
  };

  // 6. Classify dimensions cleanly
  const deviceCompatibility = detectDeviceCompatibility(combinedText);
  const indiaEligibility = classifyIndiaEligibility(input.countryEligibility, input.description);
  const locationCountryBucket = classifyCountryBucket(input.countryEligibility);
  const workType = classifyWorkType(input.employmentType || '', input.jobTitle, input.description);
  const experienceLevel = classifyExperienceLevel(
    input.experienceRequired || '',
    input.jobTitle,
    input.description
  );
  const salaryBucket = classifySalaryBucket(input.salaryRange);

  // 7. Separate 7-Factor 0-100 Matching Score (NEVER overrides fraud risk!)
  const lowerDesc = combinedText.toLowerCase();
  const matchedSkills = input.applicantSkills.filter((sk) =>
    lowerDesc.includes(sk.toLowerCase())
  );

  // Skill relevance: 0-25
  const skillRelevance = Math.min(
    25,
    10 + matchedSkills.length * 4
  );

  // Location eligibility (India / Worldwide): 0-20
  let locationEligibility = 8;
  if (indiaEligibility === 'Explicitly accepts India applicants') locationEligibility = 20;
  else if (indiaEligibility === 'Worldwide applicants') locationEligibility = 16;
  else if (indiaEligibility === 'India eligibility unclear') locationEligibility = 9;
  else if (indiaEligibility === 'Region restricted') locationEligibility = 4;
  else locationEligibility = 1;

  // Remote compatibility: 0-15
  const remoteCompatibility =
    workType === 'Fully remote' ||
    workType === 'Freelance' ||
    workType === 'Full-time' ||
    workType === 'Part-time' ||
    workType === 'Contract'
      ? 14
      : workType === 'Hybrid'
      ? 7
      : 10;

  // Experience compatibility: 0-15
  const experienceCompatibility =
    experienceLevel === 'No experience' || experienceLevel === 'Entry level' || experienceLevel === 'Junior'
      ? 15
      : experienceLevel === 'Not specified'
      ? 12
      : experienceLevel === 'Mid-level'
      ? 10
      : 6;

  // Employer credibility: 0-15
  const employerCredibility =
    classification === 'VERIFIED'
      ? 15
      : classification === 'NEEDS REVIEW'
      ? 9
      : classification === 'SUSPICIOUS'
      ? 3
      : 0;

  // Compensation transparency: 0-5
  const compensationTransparency = input.salaryRange && input.salaryRange.trim().length > 0 ? 5 : 1;

  // Device compatibility: 0-5
  const deviceCompatibilityScore =
    deviceCompatibility === 'Both supported' ||
    deviceCompatibility === 'Mobile friendly' ||
    deviceCompatibility === 'Laptop preferred'
      ? 5
      : deviceCompatibility === 'Laptop required'
      ? 4
      : 3;

  const totalScore =
    skillRelevance +
    locationEligibility +
    remoteCompatibility +
    experienceCompatibility +
    employerCredibility +
    compensationTransparency +
    deviceCompatibilityScore;

  const suitability: JobSuitabilityScore = {
    totalScore,
    skillRelevance,
    locationEligibility,
    remoteCompatibility,
    experienceCompatibility,
    employerCredibility,
    compensationTransparency,
    deviceCompatibilityScore,
    factors: [
      {
        label: 'Skill Relevance',
        score: skillRelevance,
        max: 25,
        note: matchedSkills.length > 0 ? `Matched: ${matchedSkills.slice(0, 4).join(', ')}` : 'Transferable digital skills',
      },
      {
        label: 'Location Eligibility',
        score: locationEligibility,
        max: 20,
        note: `${indiaEligibility} (${input.countryEligibility})`,
      },
      {
        label: 'Remote Compatibility',
        score: remoteCompatibility,
        max: 15,
        note: `${workType} setup`,
      },
      {
        label: 'Experience Match',
        score: experienceCompatibility,
        max: 15,
        note: `Level: ${experienceLevel}`,
      },
      {
        label: 'Employer Credibility',
        score: employerCredibility,
        max: 15,
        note: `Scam status: ${classification}`,
      },
      {
        label: 'Compensation Transparency',
        score: compensationTransparency,
        max: 5,
        note: input.salaryRange ? `Disclosed: ${input.salaryRange}` : 'Not disclosed by employer',
      },
      {
        label: 'Device Compatibility',
        score: deviceCompatibilityScore,
        max: 5,
        note: deviceCompatibility,
      },
    ],
  };

  return {
    evidence,
    suitability,
    deviceCompatibility,
    indiaEligibility,
    locationCountryBucket,
    workType,
    experienceLevel,
    salaryBucket,
    isExpired,
  };
}
