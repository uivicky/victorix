import dns from 'dns/promises';
import net from 'net';
import { WebsiteAudit, LeadScore } from '../src/types/index.js';

const MAX_RESPONSE_BYTES = 1.5 * 1024 * 1024; // 1.5 MB strict cap
const REQUEST_TIMEOUT_MS = 5000;
const MAX_REDIRECTS = 3;

export function isPrivateOrReservedIp(ip: string): boolean {
  if (!ip) return true;
  const clean = ip.replace(/^::ffff:/i, '');

  if (net.isIPv4(clean)) {
    const parts = clean.split('.').map(Number);
    if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return true;
    const [a, b] = parts;
    if (a === 0) return true; // 0.0.0.0/8
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 127) return true; // 127.0.0.0/8 loopback
    if (a === 169 && b === 254) return true; // 169.254.0.0/16 link-local / cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 CGNAT
    if (a >= 224) return true; // Multicast & reserved
    return false;
  }

  if (net.isIPv6(clean)) {
    const lower = clean.toLowerCase();
    if (lower === '::1' || lower === '::') return true;
    if (lower.startsWith('fc') || lower.startsWith('fd')) return true; // Unique local
    if (lower.startsWith('fe80')) return true; // Link-local
    return false;
  }

  return true;
}

export async function validateUrlAgainstSsrf(rawUrl: string): Promise<{
  safe: boolean;
  parsed?: URL;
  reason?: string;
}> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return { safe: false, reason: 'Invalid URL syntax' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { safe: false, reason: `Unsupported protocol: ${parsed.protocol}` };
  }

  const hostname = parsed.hostname.toLowerCase();
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.localhost')
  ) {
    return { safe: false, reason: 'Local and internal hostnames are blocked (SSRF protection)' };
  }

  // Direct IP check
  if (net.isIP(hostname)) {
    if (isPrivateOrReservedIp(hostname)) {
      return { safe: false, reason: `Private or reserved IP address blocked: ${hostname}` };
    }
    return { safe: true, parsed };
  }

  // Resolve DNS and check ALL resolved IPs
  try {
    const records = await dns.lookup(hostname, { all: true });
    if (!records || records.length === 0) {
      return { safe: false, reason: 'DNS resolution returned no addresses' };
    }
    for (const rec of records) {
      if (isPrivateOrReservedIp(rec.address)) {
        return {
          safe: false,
          reason: `DNS resolved to private/reserved IP (${rec.address}); blocked by SSRF protection`,
        };
      }
    }
  } catch (err: any) {
    return { safe: false, reason: `DNS resolution failed: ${err.message}` };
  }

  return { safe: true, parsed };
}

async function safeReadLimitedBody(resp: Response): Promise<{ text: string; bytes: number }> {
  if (!resp.body) {
    const txt = await resp.text();
    return { text: txt.slice(0, MAX_RESPONSE_BYTES), bytes: Buffer.byteLength(txt, 'utf-8') };
  }
  const reader = resp.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      totalBytes += value.byteLength;
      if (totalBytes > MAX_RESPONSE_BYTES) {
        chunks.push(value.slice(0, Math.max(0, MAX_RESPONSE_BYTES - (totalBytes - value.byteLength))));
        try {
          await reader.cancel();
        } catch {
          // ignore
        }
        break;
      }
      chunks.push(value);
    }
  }

  const merged = Buffer.concat(chunks.map((c) => Buffer.from(c)));
  return { text: merged.toString('utf-8'), bytes: totalBytes };
}

export async function safeFetchWithRedirectRevalidation(
  initialUrl: string,
  method: 'GET' | 'HEAD' = 'GET',
  timeoutMs = REQUEST_TIMEOUT_MS
): Promise<{
  ok: boolean;
  finalUrl: string;
  status: number;
  headers?: Headers;
  bodyText: string;
  bytes: number;
  responseTimeMs: number;
  blockedReason?: string;
  error?: string;
}> {
  let currentUrl = initialUrl;
  const visited = new Set<string>();
  const started = performance.now();

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (visited.has(currentUrl)) {
      return {
        ok: false,
        finalUrl: currentUrl,
        status: 0,
        bodyText: '',
        bytes: 0,
        responseTimeMs: Math.round(performance.now() - started),
        error: 'Redirect loop detected and aborted',
      };
    }
    visited.add(currentUrl);

    const ssrf = await validateUrlAgainstSsrf(currentUrl);
    if (!ssrf.safe) {
      return {
        ok: false,
        finalUrl: currentUrl,
        status: 0,
        bodyText: '',
        bytes: 0,
        responseTimeMs: Math.round(performance.now() - started),
        blockedReason: ssrf.reason,
        error: ssrf.reason,
      };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const resp = await fetch(currentUrl, {
        method,
        redirect: 'manual',
        headers: {
          'User-Agent': 'VICTORIX-SafeAuditor/3.0 (+https://victorix.in; read-only SEO/tech audit)',
          Accept: 'text/html,application/xhtml+xml,text/plain;q=0.9',
        },
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (resp.status >= 300 && resp.status < 400) {
        const loc = resp.headers.get('location');
        if (!loc) {
          return {
            ok: false,
            finalUrl: currentUrl,
            status: resp.status,
            headers: resp.headers,
            bodyText: '',
            bytes: 0,
            responseTimeMs: Math.round(performance.now() - started),
            error: `HTTP ${resp.status} redirect without Location header`,
          };
        }
        currentUrl = new URL(loc, currentUrl).toString();
        continue;
      }

      const contentType = resp.headers.get('content-type') || '';
      let bodyText = '';
      let bytes = 0;
      if (method === 'GET' && (contentType.includes('text/') || contentType.includes('xml') || contentType.includes('html') || !contentType)) {
        const resBody = await safeReadLimitedBody(resp);
        bodyText = resBody.text;
        bytes = resBody.bytes;
      }

      return {
        ok: resp.ok,
        finalUrl: currentUrl,
        status: resp.status,
        headers: resp.headers,
        bodyText,
        bytes,
        responseTimeMs: Math.round(performance.now() - started),
      };
    } catch (err: any) {
      clearTimeout(timer);
      return {
        ok: false,
        finalUrl: currentUrl,
        status: 0,
        bodyText: '',
        bytes: 0,
        responseTimeMs: Math.round(performance.now() - started),
        error: err?.name === 'AbortError' ? `Request timed out after ${timeoutMs}ms` : err?.message || 'Fetch error',
      };
    }
  }

  return {
    ok: false,
    finalUrl: currentUrl,
    status: 0,
    bodyText: '',
    bytes: 0,
    responseTimeMs: Math.round(performance.now() - started),
    error: `Exceeded maximum ${MAX_REDIRECTS} redirects`,
  };
}

export async function performSafeWebsiteAudit(
  url: string,
  businessName: string,
  category: string,
  hasPublicPhone = false
): Promise<{
  audit: WebsiteAudit;
  score: LeadScore;
  recommendedService: string;
}> {
  const cleanUrl = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
  const mainResult = await safeFetchWithRedirectRevalidation(cleanUrl, 'GET', REQUEST_TIMEOUT_MS);

  const observedIssues: string[] = [];
  const positiveHighlights: string[] = [];
  const recommendations: string[] = [];

  if (mainResult.blockedReason) {
    const blockedAudit: WebsiteAudit = {
      id: `audit-${Date.now()}`,
      url: cleanUrl,
      httpStatus: 0,
      responseTimeMs: mainResult.responseTimeMs,
      htmlBytes: 0,
      isHttps: cleanUrl.startsWith('https://'),
      mobileResponsive: false,
      hasViewportMeta: false,
      hasTitle: false,
      hasMetaDescription: false,
      canonicalPresent: false,
      h1Count: 0,
      h2Count: 0,
      altTagsMissing: 0,
      loadSpeedEstimated: 'Unmeasured',
      securityHeadersScore: 0,
      sitemapDetected: false,
      robotsDetected: false,
      brokenLinksChecked: 0,
      brokenLinksFound: 0,
      accessibilityScore: 0,
      observedIssues: [`Blocked by SSRF security policy: ${mainResult.blockedReason}`],
      positiveHighlights: [],
      recommendations: ['Provide a public, non-private HTTP/HTTPS business domain.'],
      scannedAt: new Date().toISOString(),
      auditType: 'ssrf_blocked',
      errorNote: mainResult.blockedReason,
    };

    const blockedScore: LeadScore = {
      totalScore: 0,
      tier: 'Low',
      businessRelevance: 0,
      improvementOpportunity: 0,
      serviceCompatibility: 0,
      evidenceQuality: 0,
      contactability: hasPublicPhone ? 10 : 0,
      explanation: `Security policy blocked scan (${mainResult.blockedReason}). No metrics fabricated.`,
      factors: [
        { label: 'SSRF Policy', score: 0, max: 100, note: mainResult.blockedReason },
      ],
    };

    return { audit: blockedAudit, score: blockedScore, recommendedService: 'Website Development' };
  }

  const isHttps = mainResult.finalUrl.startsWith('https://');
  const html = mainResult.bodyText || '';
  const headers = mainResult.headers;

  let recommendedService = 'Business Website Development';
  const catLower = category.toLowerCase();
  if (catLower.includes('school') || catLower.includes('academy') || catLower.includes('coaching') || catLower.includes('education')) {
    recommendedService = 'School Website Development';
  } else if (catLower.includes('retail') || catLower.includes('shop') || catLower.includes('ecommerce') || catLower.includes('store') || catLower.includes('bakery')) {
    recommendedService = 'Ecommerce Development';
  } else if (catLower.includes('doctor') || catLower.includes('consultant') || catLower.includes('salon') || catLower.includes('portfolio')) {
    recommendedService = 'Portfolio Website Development';
  }

  if (mainResult.status === 0) {
    // Unreachable — NEVER invent HTML issues; report honest measurement failure
    observedIssues.push(`Website could not be reached during read-only check (${mainResult.error || 'Connection error'}).`);
    recommendations.push('Verify domain DNS, uptime, and SSL configuration.');

    const unreachableAudit: WebsiteAudit = {
      id: `audit-${Date.now()}`,
      url: cleanUrl,
      httpStatus: 0,
      responseTimeMs: mainResult.responseTimeMs,
      htmlBytes: 0,
      isHttps,
      mobileResponsive: false,
      hasViewportMeta: false,
      hasTitle: false,
      hasMetaDescription: false,
      canonicalPresent: false,
      h1Count: 0,
      h2Count: 0,
      altTagsMissing: 0,
      loadSpeedEstimated: 'Unmeasured',
      securityHeadersScore: 0,
      sitemapDetected: false,
      robotsDetected: false,
      brokenLinksChecked: 0,
      brokenLinksFound: 0,
      accessibilityScore: 0,
      observedIssues,
      positiveHighlights,
      recommendations,
      scannedAt: new Date().toISOString(),
      auditType: 'unreachable',
      errorNote: mainResult.error,
    };

    const unreachableScore: LeadScore = {
      totalScore: hasPublicPhone ? 45 : 35,
      tier: 'Low',
      businessRelevance: 18,
      improvementOpportunity: 12,
      serviceCompatibility: 10,
      evidenceQuality: 0,
      contactability: hasPublicPhone ? 12 : 0,
      explanation: `Website unreachable (${mainResult.error}). Missing measurement is reported transparently rather than penalized as confirmed broken HTML.`,
      factors: [
        { label: 'Business Relevance', score: 18, max: 25, note: `Target industry: ${category}` },
        { label: 'Improvement Opportunity', score: 12, max: 25, note: 'Site timed out or failed DNS/SSL check' },
        { label: 'Service Compatibility', score: 10, max: 20, note: recommendedService },
        { label: 'Evidence Quality', score: 0, max: 15, note: 'Unreachable during live HTTP scan' },
        { label: 'Contactability', score: hasPublicPhone ? 12 : 0, max: 15, note: hasPublicPhone ? 'Public contact listed' : 'No public phone found yet' },
      ],
    };

    return { audit: unreachableAudit, score: unreachableScore, recommendedService };
  }

  // Real HTML Parsing & Measurement
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const pageTitle = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : '';
  const hasTitle = pageTitle.length > 0;

  const metaDescMatch =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
  const metaDescription = metaDescMatch ? metaDescMatch[1].trim() : '';
  const hasMetaDescription = metaDescription.length > 0;

  const hasViewportMeta = /<meta[^>]+name=["']viewport["']/i.test(html);
  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  const canonicalPresent = Boolean(canonicalMatch);
  const canonicalUrl = canonicalMatch ? canonicalMatch[1] : undefined;

  const h1Count = (html.match(/<h1\b[^>]*>/gi) || []).length;
  const h2Count = (html.match(/<h2\b[^>]*>/gi) || []).length;

  const imgTags = html.match(/<img\b[^>]*>/gi) || [];
  const altTagsMissing = imgTags.filter((tag) => {
    const alt = tag.match(/alt=["']([^"']*)["']/i);
    return !alt || alt[1].trim().length === 0;
  }).length;

  const securityHeadersPresent: string[] = [];
  if (headers?.get('strict-transport-security')) securityHeadersPresent.push('HSTS');
  if (headers?.get('x-content-type-options')) securityHeadersPresent.push('X-Content-Type-Options');
  if (headers?.get('content-security-policy')) securityHeadersPresent.push('CSP');
  if (headers?.get('x-frame-options')) securityHeadersPresent.push('X-Frame-Options');
  const securityHeadersScore = Math.min(100, 20 + securityHeadersPresent.length * 20);

  // Check robots.txt & sitemap.xml safely
  const origin = new URL(mainResult.finalUrl).origin;
  const [robotsCheck, sitemapCheck] = await Promise.all([
    safeFetchWithRedirectRevalidation(`${origin}/robots.txt`, 'HEAD', 2500),
    safeFetchWithRedirectRevalidation(`${origin}/sitemap.xml`, 'HEAD', 2500),
  ]);
  const robotsDetected = robotsCheck.status >= 200 && robotsCheck.status < 400;
  const sitemapDetected = sitemapCheck.status >= 200 && sitemapCheck.status < 400;

  // Check up to 3 same-origin internal links for broken links
  const hrefMatches = [...html.matchAll(/<a[^>]+href=["']([^"'#]+)["']/gi)].map((m) => m[1]);
  const internalUrls: string[] = [];
  for (const href of hrefMatches) {
    if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) continue;
    try {
      const resolved = new URL(href, mainResult.finalUrl);
      if (resolved.origin === origin && !internalUrls.includes(resolved.toString()) && resolved.toString() !== mainResult.finalUrl) {
        internalUrls.push(resolved.toString());
        if (internalUrls.length >= 3) break;
      }
    } catch {
      // ignore invalid href
    }
  }

  const brokenLinksList: string[] = [];
  for (const linkUrl of internalUrls) {
    const linkRes = await safeFetchWithRedirectRevalidation(linkUrl, 'HEAD', 2500);
    if (linkRes.status >= 400 || linkRes.status === 0) {
      brokenLinksList.push(`${linkUrl} (${linkRes.status || 'timeout'})`);
    }
  }

  // Evaluate measured speed
  const loadSpeedEstimated: WebsiteAudit['loadSpeedEstimated'] =
    mainResult.responseTimeMs <= 900 ? 'Fast' : mainResult.responseTimeMs <= 2200 ? 'Average' : 'Slow';

  // Observed issues (strictly evidence-based)
  if (!isHttps) {
    observedIssues.push('Final destination does not enforce HTTPS encryption.');
    recommendations.push('Enable free SSL/TLS HTTPS via Cloudflare Pages or Let’s Encrypt.');
  } else {
    positiveHighlights.push('Valid HTTPS protocol active.');
  }

  if (mainResult.status >= 400) {
    observedIssues.push(`Server returned HTTP ${mainResult.status} status code.`);
    recommendations.push('Resolve server HTTP error status so search crawlers can index the page.');
  } else {
    positiveHighlights.push(`HTTP ${mainResult.status} response in ${mainResult.responseTimeMs}ms.`);
  }

  if (!hasViewportMeta) {
    observedIssues.push('Missing <meta name="viewport"> tag; mobile users face horizontal pinch-zooming.');
    recommendations.push('Add responsive viewport meta tag and mobile-first layout.');
  } else {
    positiveHighlights.push('Mobile viewport meta tag present.');
  }

  if (!hasTitle) {
    observedIssues.push('Missing <title> tag.');
    recommendations.push('Add a unique 50-60 character SEO <title>.');
  }

  if (!hasMetaDescription) {
    observedIssues.push('Missing meta description tag.');
    recommendations.push('Add a compelling 130-160 character meta description.');
  }

  if (h1Count === 0) {
    observedIssues.push('No <h1> heading found on the landing page.');
    recommendations.push('Add one clear <h1> stating business service and city.');
  } else if (h1Count > 1) {
    observedIssues.push(`Found ${h1Count} <h1> tags; best practice is 1 primary <h1>.`);
  }

  if (altTagsMissing > 0) {
    observedIssues.push(`${altTagsMissing} of ${imgTags.length} <img> tags are missing descriptive alt attributes.`);
    recommendations.push('Add descriptive alt text for accessibility and Google Image search.');
  }

  if (!canonicalPresent) {
    observedIssues.push('Missing <link rel="canonical"> tag.');
    recommendations.push('Add canonical URL tag to consolidate indexing signals.');
  }

  if (!sitemapDetected) {
    observedIssues.push('No /sitemap.xml detected at root.');
    recommendations.push('Publish an XML sitemap and submit to Google Search Console.');
  }

  if (loadSpeedEstimated === 'Slow') {
    observedIssues.push(`Measured server response time was ${mainResult.responseTimeMs}ms (> 2200ms threshold).`);
    recommendations.push('Migrate to static edge hosting on Cloudflare Pages Free for sub-second TTFB.');
  }

  if (brokenLinksList.length > 0) {
    observedIssues.push(`Broken internal links detected: ${brokenLinksList.join(', ')}`);
    recommendations.push('Fix or remove broken internal navigation links.');
  }

  let accessibilityScore = 95;
  if (!hasViewportMeta) accessibilityScore -= 25;
  if (altTagsMissing > 0) accessibilityScore -= Math.min(20, altTagsMissing * 3);
  if (h1Count === 0) accessibilityScore -= 10;

  // Explainable Lead Score (0-100)
  const businessRelevance =
    catLower.includes('clinic') ||
    catLower.includes('school') ||
    catLower.includes('restaurant') ||
    catLower.includes('salon') ||
    catLower.includes('coaching') ||
    catLower.includes('real estate')
      ? 23
      : 19;

  let improvementOpportunity = 4;
  if (!isHttps) improvementOpportunity += 7;
  if (!hasViewportMeta) improvementOpportunity += 7;
  if (!hasMetaDescription || h1Count === 0) improvementOpportunity += 4;
  if (loadSpeedEstimated === 'Slow' || brokenLinksList.length > 0) improvementOpportunity += 3;
  improvementOpportunity = Math.min(25, improvementOpportunity);

  const serviceCompatibility = 18;
  const evidenceQuality = 14; // Real live HTTP scan measured
  const contactability = hasPublicPhone ? 13 : 5; // Explicit note if phone not found yet

  const totalScore = Math.min(
    100,
    businessRelevance + improvementOpportunity + serviceCompatibility + evidenceQuality + contactability
  );
  const tier: LeadScore['tier'] = totalScore >= 75 ? 'High' : totalScore >= 50 ? 'Medium' : 'Low';

  const factors = [
    {
      label: 'Business Relevance',
      score: businessRelevance,
      max: 25,
      note: `Industry match: ${category}`,
    },
    {
      label: 'Improvement Opportunity',
      score: improvementOpportunity,
      max: 25,
      note: `${observedIssues.length} measured technical/SEO gaps detected`,
    },
    {
      label: 'Service Compatibility',
      score: serviceCompatibility,
      max: 20,
      note: `Fits ${recommendedService} (from ₹5,999 static edge)`,
    },
    {
      label: 'Evidence Quality',
      score: evidenceQuality,
      max: 15,
      note: `Live read-only HTTP ${mainResult.status} scan (${mainResult.responseTimeMs}ms, ${mainResult.bytes} bytes)`,
    },
    {
      label: 'Contactability',
      score: contactability,
      max: 15,
      note: hasPublicPhone ? 'Public business contact found on source' : 'No public phone found yet; website contact inspection needed (not treated as negative lead quality)',
    },
  ];

  return {
    audit: {
      id: `audit-${Date.now()}`,
      url: mainResult.finalUrl,
      httpStatus: mainResult.status,
      responseTimeMs: mainResult.responseTimeMs,
      htmlBytes: mainResult.bytes,
      isHttps,
      mobileResponsive: hasViewportMeta,
      hasViewportMeta,
      hasTitle,
      pageTitle: pageTitle.slice(0, 120),
      hasMetaDescription,
      metaDescription: metaDescription.slice(0, 200),
      canonicalPresent,
      canonicalUrl,
      h1Count,
      h2Count,
      altTagsMissing,
      totalImages: imgTags.length,
      loadSpeedEstimated,
      securityHeadersScore,
      securityHeadersPresent,
      sitemapDetected,
      robotsDetected,
      brokenLinksChecked: internalUrls.length,
      brokenLinksFound: brokenLinksList.length,
      brokenLinksList,
      accessibilityScore: Math.max(30, accessibilityScore),
      observedIssues,
      positiveHighlights,
      recommendations,
      scannedAt: new Date().toISOString(),
      auditType: 'live_measured',
    },
    score: {
      totalScore,
      tier,
      businessRelevance,
      improvementOpportunity,
      serviceCompatibility,
      evidenceQuality,
      contactability,
      explanation: `Measured HTTP ${mainResult.status} in ${mainResult.responseTimeMs}ms for ${businessName}. Identified ${observedIssues.length} concrete improvements.`,
      factors,
    },
    recommendedService,
  };
}
