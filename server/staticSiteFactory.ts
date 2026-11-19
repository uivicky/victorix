import { StaticTemplateCategory } from '../src/types/index.js';

export interface StaticSiteInput {
  businessName: string;
  industry: StaticTemplateCategory;
  city: string;
  services: string[];
  publicContactPhone?: string;
  accentColor?: string;
  targetSubdomain?: string;
  isDemoProposal: boolean;
}

const INDUSTRY_PRESETS: Record<
  StaticTemplateCategory,
  {
    schemaType: string;
    heroTag: string;
    defaultHeadline: string;
    defaultServices: string[];
    ctaLabel: string;
  }
> = {
  Restaurants: {
    schemaType: 'Restaurant',
    heroTag: 'Fresh Kitchen · Dine-In & Takeaway',
    defaultHeadline: 'Authentic Dining & Fresh Flavors Every Day.',
    defaultServices: ['Dine-In Family Seating', 'Direct Takeaway Orders', 'Party & Event Catering', 'Weekend Chef Specials'],
    ctaLabel: 'Book Table / Order on WhatsApp',
  },
  Clinics: {
    schemaType: 'MedicalClinic',
    heroTag: 'Trusted Healthcare · Patient-First Care',
    defaultHeadline: 'Experienced Medical Care & Same-Day Appointments.',
    defaultServices: ['General Physician Consultation', 'Preventive Health Checkups', 'Diagnostic Lab Coordination', 'Follow-Up Care Plans'],
    ctaLabel: 'Book Appointment on WhatsApp',
  },
  Schools: {
    schemaType: 'School',
    heroTag: 'Admissions Open · Holistic Learning',
    defaultHeadline: 'Nurturing Curious Minds With Strong Academic Foundations.',
    defaultServices: ['Structured Grade Curriculum', 'Science & Computer Labs', 'Safe Campus & Sports', 'Parent-Teacher Communication'],
    ctaLabel: 'Admissions Enquiry on WhatsApp',
  },
  'Coaching Institutes': {
    schemaType: 'EducationalOrganization',
    heroTag: 'Focused Exam & Skill Mentoring',
    defaultHeadline: 'Small-Batch Coaching Designed for Measurable Student Progress.',
    defaultServices: ['Small Batch Classroom Coaching', 'Weekly Practice Assessments', 'Doubt-Clearing Sessions', 'Exam Strategy Guidance'],
    ctaLabel: 'Request Demo Class on WhatsApp',
  },
  Salons: {
    schemaType: 'BeautySalon',
    heroTag: 'Hair · Skin · Grooming Studio',
    defaultHeadline: 'Modern Styling, Hygiene & Personal Care Specialists.',
    defaultServices: ['Haircut & Styling', 'Skin & Facial Treatments', 'Bridal & Occasion Packages', 'Express Grooming Appointments'],
    ctaLabel: 'Reserve Slot on WhatsApp',
  },
  'Real Estate': {
    schemaType: 'RealEstateAgent',
    heroTag: 'Verified Properties · Local Market Guidance',
    defaultHeadline: 'Transparent Property Advisory for Homes & Commercial Spaces.',
    defaultServices: ['Residential Buying & Leasing', 'Commercial Office Spaces', 'Site Visit Coordination', 'Documentation Assistance'],
    ctaLabel: 'Schedule Site Visit on WhatsApp',
  },
  'Local Shops': {
    schemaType: 'Store',
    heroTag: 'Trusted Local Store · Fast Delivery',
    defaultHeadline: 'Quality Products & Direct Neighborhood Service.',
    defaultServices: ['Curated Daily Inventory', 'Bulk & Family Orders', 'Same-Day Local Pickup', 'Direct WhatsApp Order Desk'],
    ctaLabel: 'Order via WhatsApp',
  },
  Consultants: {
    schemaType: 'ProfessionalService',
    heroTag: 'Advisory · Strategy · Execution',
    defaultHeadline: 'Clear, Practical Consulting Tailored to Your Goals.',
    defaultServices: ['1-on-1 Discovery Consultation', 'Compliance & Process Audit', 'Implementation Roadmap', 'Ongoing Advisory Retainer'],
    ctaLabel: 'Book Consultation on WhatsApp',
  },
  'Small Businesses': {
    schemaType: 'LocalBusiness',
    heroTag: 'Reliable Local Service · Direct Support',
    defaultHeadline: 'Dependable Services Built Around Customer Trust.',
    defaultServices: ['Custom Service Packages', 'Transparent Upfront Quotes', 'Fast Local Turnaround', 'Direct Owner Support'],
    ctaLabel: 'Chat on WhatsApp',
  },
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function generateStaticSiteBundle(input: StaticSiteInput): {
  indexHtml: string;
  sitemapXml: string;
  robotsTxt: string;
  deployInstructions: string;
  subdomainSlug: string;
  filesManifest: string[];
} {
  const preset = INDUSTRY_PRESETS[input.industry] || INDUSTRY_PRESETS['Small Businesses'];
  const cleanName = input.businessName.trim() || 'Sample Business';
  const cleanCity = input.city.trim() || 'Mumbai, India';
  const slug =
    (input.targetSubdomain || cleanName)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'client-site';
  const siteBaseUrl = `https://${slug}.pages.dev`;

  // Use business's verified public phone if supplied, otherwise route via VICTORIX WhatsApp for proposal demos
  const rawPhone = (input.publicContactPhone || '+916387661594').replace(/[^0-9]/g, '');
  const waNumber = rawPhone.length >= 10 ? rawPhone : '916387661594';
  const waHref = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    `Hello ${cleanName}, I would like to inquire about your services.`
  )}`;

  const accent = /^#[0-9a-fA-F]{6}$/.test(input.accentColor || '') ? input.accentColor! : '#7C3AED';
  const serviceList =
    input.services && input.services.length > 0 ? input.services : preset.defaultServices;

  const schemaJson = JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@type': preset.schemaType,
      name: cleanName,
      url: siteBaseUrl,
      address: {
        '@type': 'PostalAddress',
        addressLocality: cleanCity,
        addressCountry: 'IN',
      },
      telephone: input.publicContactPhone || 'Not disclosed',
    },
    null,
    2
  );

  const demoBanner = input.isDemoProposal
    ? `<div style="background:#7c3aed;color:#ffffff;text-align:center;padding:8px 16px;font-size:12px;font-weight:700;letter-spacing:0.04em;">
        PROPOSAL DEMO PREVIEW BY VICTORIX — NOT AN OFFICIAL CLIENT WEBSITE. DEPLOY ONLY WITH CLIENT AUTHORIZATION.
      </div>`
    : '';

  const indexHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(cleanName)} | ${escapeHtml(input.industry)} in ${escapeHtml(cleanCity)}</title>
  <meta name="description" content="${escapeHtml(cleanName)} provides trusted ${escapeHtml(
    input.industry.toLowerCase()
  )} services in ${escapeHtml(cleanCity)}. Fast, mobile-friendly information and direct WhatsApp enquiry." />
  <link rel="canonical" href="${siteBaseUrl}/" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escapeHtml(cleanName)} – ${escapeHtml(cleanCity)}" />
  <meta property="og:description" content="Explore services and connect directly with ${escapeHtml(cleanName)} in ${escapeHtml(cleanCity)}." />
  <script type="application/ld+json">${schemaJson}</script>
  <style>
    :root { --accent: ${accent}; --bg: #0b0c10; --surface: #13151d; --text: #f8fafc; --muted: #94a3b8; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; }
    .wrap { max-width: 1080px; margin: 0 auto; padding: 0 20px; }
    header { border-bottom: 1px solid rgba(255,255,255,0.08); padding: 18px 0; }
    .nav { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    .brand { font-weight: 800; font-size: 1.15rem; letter-spacing: -0.02em; }
    .btn { display: inline-flex; align-items: center; gap: 8px; background: var(--accent); color: #fff; text-decoration: none; font-weight: 700; font-size: 0.875rem; padding: 11px 20px; border-radius: 10px; }
    .hero { padding: 72px 0 56px; }
    .kicker { font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.08em; color: #c4b5fd; font-weight: 700; margin-bottom: 12px; }
    h1 { font-size: clamp(2rem, 4.5vw, 3.35rem); line-height: 1.12; font-weight: 800; max-width: 780px; margin-bottom: 18px; }
    .lead { color: var(--muted); font-size: 1.05rem; max-width: 640px; margin-bottom: 28px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 18px; margin-top: 28px; }
    .card { background: var(--surface); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 22px; }
    .card h3 { font-size: 1.05rem; margin-bottom: 8px; }
    .card p { font-size: 0.9rem; color: var(--muted); }
    section { padding: 48px 0; border-top: 1px solid rgba(255,255,255,0.06); }
    footer { padding: 36px 0; border-top: 1px solid rgba(255,255,255,0.08); color: var(--muted); font-size: 0.85rem; }
  </style>
</head>
<body>
  ${demoBanner}
  <header>
    <div class="wrap nav">
      <div class="brand">${escapeHtml(cleanName)}</div>
      <a class="btn" href="${waHref}" target="_blank" rel="noopener noreferrer">${escapeHtml(preset.ctaLabel)}</a>
    </div>
  </header>

  <main class="wrap">
    <div class="hero">
      <div class="kicker">${escapeHtml(preset.heroTag)} · ${escapeHtml(cleanCity)}</div>
      <h1>${escapeHtml(cleanName)}: ${escapeHtml(preset.defaultHeadline)}</h1>
      <p class="lead">Serving customers across ${escapeHtml(cleanCity)} with transparent communication, clean service standards, and fast WhatsApp response. Built on database-free static edge architecture.</p>
      <a class="btn" href="${waHref}" target="_blank" rel="noopener noreferrer">${escapeHtml(preset.ctaLabel)}</a>
    </div>

    <section id="services">
      <h2>Core Services in ${escapeHtml(cleanCity)}</h2>
      <div class="grid">
        ${serviceList
          .map(
            (srv, idx) => `<div class="card">
          <h3>0${idx + 1}. ${escapeHtml(srv)}</h3>
          <p>Dedicated ${escapeHtml(input.industry.toLowerCase())} support tailored for clients in ${escapeHtml(cleanCity)}.</p>
        </div>`
          )
          .join('\n        ')}
      </div>
    </section>

    <section id="contact">
      <h2>Direct Enquiry</h2>
      <p class="lead" style="margin-top:10px;">Location: ${escapeHtml(cleanCity)}${
    input.publicContactPhone ? ` · Contact: ${escapeHtml(input.publicContactPhone)}` : ''
  }</p>
      <a class="btn" href="${waHref}" target="_blank" rel="noopener noreferrer">Message on WhatsApp</a>
    </section>
  </main>

  <footer>
    <div class="wrap nav">
      <span>&copy; ${new Date().getFullYear()} ${escapeHtml(cleanName)} · ${escapeHtml(cleanCity)}</span>
      <span>Static Edge Website engineered by VICTORIX</span>
    </div>
  </footer>
</body>
</html>`;

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteBaseUrl}/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

  const robotsTxt = `User-agent: *
Allow: /
Sitemap: ${siteBaseUrl}/sitemap.xml
`;

  const deployInstructions = `# Cloudflare Pages Free Deployment & Handover Guide (${slug})
1. This static bundle requires ZERO database (no D1, KV, or PostgreSQL needed).
2. Create a folder named "${slug}" containing: index.html, sitemap.xml, robots.txt.
3. Deploy via Cloudflare Pages Free (Direct Upload or Git):
   npx wrangler pages deploy ./${slug} --project-name=${slug}
4. Subject to availability, Cloudflare assigns https://${slug}.pages.dev with free HTTPS & global CDN.
5. Ownership Notice: *.pages.dev belongs to Cloudflare Pages. Attach the client's own custom domain (e.g., theirbusiness.in) for full brand ownership during client handover.`;

  return {
    indexHtml,
    sitemapXml,
    robotsTxt,
    deployInstructions,
    subdomainSlug: slug,
    filesManifest: ['index.html', 'sitemap.xml', 'robots.txt'],
  };
}
