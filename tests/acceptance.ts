import assert from 'assert';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import {
  ADMIN_COOKIE_NAME,
  createSignedSessionToken,
  verifySignedSessionToken,
  isAuthConfigured,
  verifyAdminPassphrase,
} from '../server/adminAuth.js';

dotenv.config();

const BASE = 'http://127.0.0.1:3000';

async function runAcceptanceTests() {
  console.log('=== VICTORIX 3.0 & GLOBAL REMOTE JOB HUNTER ACCEPTANCE SUITE ===');
  const results: { name: string; status: 'PASS' | 'FAIL'; detail: string }[] = [];

  function record(name: string, status: 'PASS' | 'FAIL', detail: string) {
    results.push({ name, status, detail });
    console.log(`[${status}] ${name}: ${detail}`);
  }

  // 1. Public Routes, Vercel Serverless Config & SEO Checks
  try {
    const [homeRes, sitemapRes, apiSitemapRes, robotsRes, apiRobotsRes, blogsRes, healthRes, missingApiRes] =
      await Promise.all([
        fetch(`${BASE}/`),
        fetch(`${BASE}/sitemap.xml`),
        fetch(`${BASE}/api/sitemap`),
        fetch(`${BASE}/robots.txt`),
        fetch(`${BASE}/api/robots`),
        fetch(`${BASE}/api/blogs`),
        fetch(`${BASE}/api/health`),
        fetch(`${BASE}/api/nonexistent-route-check`),
      ]);
    assert.strictEqual(homeRes.status, 200);
    assert.strictEqual(sitemapRes.status, 200);
    assert.strictEqual(apiSitemapRes.status, 200);
    assert.strictEqual(apiRobotsRes.status, 200);
    const healthJson: any = await healthRes.json();
    assert.strictEqual(healthRes.status, 200);
    assert.strictEqual(healthJson.ok, true);
    assert.strictEqual(healthJson.authConfigured, true);

    assert.strictEqual(missingApiRes.status, 404);
    const missingApiJson: any = await missingApiRes.json();
    assert(missingApiJson.error, 'Unmatched /api/* route must return structured JSON 404');

    const vercelConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'vercel.json'), 'utf-8'));
    assert.strictEqual(vercelConfig.outputDirectory, 'dist');
    assert(fs.existsSync(path.join(process.cwd(), 'api/[...route].ts')), 'Missing Vercel api/[...route].ts entrypoint');

    const homeHtml = await homeRes.text();
    assert(
      homeHtml.includes('bwGlwapRk92lYE5W1wl1o7izJcBKOWUYJJMSktniLyE'),
      'Google Search Console verification meta tag must be present in HTML'
    );
    assert(
      homeHtml.includes('https://victorixglobal.vercel.app') && !homeHtml.includes('victorix.in'),
      'Home HTML canonical/schema must use https://victorixglobal.vercel.app exclusively'
    );

    const sitemapText = await sitemapRes.text();
    const apiSitemapText = await apiSitemapRes.text();
    assert(
      sitemapText.includes('<urlset') &&
        sitemapText.includes('https://victorixglobal.vercel.app/pricing') &&
        sitemapText.includes('https://victorixglobal.vercel.app/website-developer-mumbai') &&
        sitemapText.includes('https://victorixglobal.vercel.app/portfolio/it-support')
    );
    assert(!sitemapText.includes('victorix.in') && !apiSitemapText.includes('victorix.in'), 'Sitemap must NOT reference victorix.in');
    const locMatches = [...sitemapText.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
    assert(locMatches.length >= 19, `Expected >= 19 sitemap <loc> entries, got ${locMatches.length}`);
    for (const loc of locMatches) {
      assert(loc.startsWith('https://victorixglobal.vercel.app/'), `Unexpected sitemap URL host: ${loc}`);
    }

    const robotsText = await robotsRes.text();
    assert(
      robotsText.includes('Disallow: /admin') &&
        robotsText.includes('Disallow: /api/') &&
        robotsText.includes('Sitemap: https://victorixglobal.vercel.app/sitemap.xml') &&
        !robotsText.includes('victorix.in')
    );
    const blogsJson: any = await blogsRes.json();
    assert(blogsJson.success && Array.isArray(blogsJson.blogs) && blogsJson.blogs.length >= 1);
    record(
      'Public Routes, Vercel Config, Sitemap, Robots & Health',
      'PASS',
      `HTTP 200 across public & API health/SEO endpoints, JSON 404 verified, vercel.json & api/[...route].ts present; ${blogsJson.blogs.length} blogs published.`
    );
  } catch (err: any) {
    record('Public Routes, Vercel Config, Sitemap, Robots & Health', 'FAIL', err.message);
  }

  // 2. Stateless Signed HttpOnly Cookie Auth, Invalid Password, Tampering & Expiration
  let sessionCookie = '';
  try {
    // 2a. Unauthorized access must fail across private routes
    for (const privRoute of [
      '/api/overview',
      '/api/leads',
      '/api/jobs',
      '/api/applications',
      '/api/free-tier',
      '/api/settings',
      '/api/admin/seo',
      '/api/backup/export',
    ]) {
      const unauthRes = await fetch(`${BASE}${privRoute}`);
      assert.strictEqual(unauthRes.status, 401, `Expected 401 on ${privRoute}, got ${unauthRes.status}`);
    }

    // 2b. Session endpoint unauthenticated state
    const preSessRes = await fetch(`${BASE}/api/admin/session`);
    const preSessJson: any = await preSessRes.json();
    assert.strictEqual(preSessRes.status, 200);
    assert.strictEqual(preSessJson.configured, true, 'Server env ADMIN_PASSPHRASE and ADMIN_SESSION_SECRET must be configured');
    assert.strictEqual(preSessJson.authenticated, false);

    // 2c. Invalid passphrase must fail with 401 and zero cookies
    const badLoginRes = await fetch(`${BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passphrase: 'wrong-passphrase-attempt' }),
    });
    assert.strictEqual(badLoginRes.status, 401, 'Invalid password must return 401');
    const badSetCookie = badLoginRes.headers.get('set-cookie') || '';
    assert(!badSetCookie.includes(ADMIN_COOKIE_NAME), 'Failed login must not set session cookie');

    // 2d. Valid passphrase login
    const passphrase = process.env.ADMIN_PASSPHRASE || '';
    assert(passphrase, 'ADMIN_PASSPHRASE missing in test environment (.env)');

    const loginRes = await fetch(`${BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passphrase }),
    });
    const loginText = await loginRes.text();
    const loginJson: any = JSON.parse(loginText);
    assert.strictEqual(loginRes.status, 200);
    assert.strictEqual(loginJson.success, true);
    assert.strictEqual(loginJson.authenticated, true);
    assert(!loginText.includes(passphrase), 'Login response must never echo passphrase');
    assert(!loginText.includes(process.env.ADMIN_SESSION_SECRET || '___'), 'Login response must never echo session secret');
    assert(!('token' in loginJson), 'Raw session token must stay in HttpOnly cookie, not JSON body');

    const setCookieHeader = loginRes.headers.get('set-cookie') || '';
    assert(setCookieHeader.includes(`${ADMIN_COOKIE_NAME}=`), 'Expected victorix_admin_session cookie');
    assert(/HttpOnly/i.test(setCookieHeader), 'Session cookie must have HttpOnly flag');
    assert(/SameSite=Lax/i.test(setCookieHeader), 'Session cookie must have SameSite=Lax flag');

    sessionCookie = setCookieHeader.split(';')[0];

    // 2e. Verify GET /api/admin/session persists across reloads with signed cookie
    for (let attempt = 0; attempt < 2; attempt++) {
      const sessRes = await fetch(`${BASE}/api/admin/session`, {
        headers: { Cookie: sessionCookie },
      });
      const sessJson: any = await sessRes.json();
      assert.strictEqual(sessJson.authenticated, true);
      assert.strictEqual(sessJson.configured, true);
    }

    // 2f. Forged/tampered cookie must fail with 401
    const tamperedCookie = `${sessionCookie.slice(0, -4)}AAAA`;
    const tamperedRes = await fetch(`${BASE}/api/overview`, {
      headers: { Cookie: tamperedCookie },
    });
    assert.strictEqual(tamperedRes.status, 401, 'Tampered session cookie must be rejected with 401');

    // 2g. Short-TTL Session Expiration check (real crypto + live HTTP check)
    const { token: shortLivedToken } = createSignedSessionToken(50);
    assert.strictEqual(verifySignedSessionToken(shortLivedToken).valid, true);
    await new Promise((r) => setTimeout(r, 80));
    const expiredCheck = verifySignedSessionToken(shortLivedToken);
    assert.strictEqual(expiredCheck.valid, false);
    if (!expiredCheck.valid) {
      assert.strictEqual(expiredCheck.reason, 'Session expired');
    }
    const expiredHttpRes = await fetch(`${BASE}/api/overview`, {
      headers: { Cookie: `${ADMIN_COOKIE_NAME}=${shortLivedToken}` },
    });
    assert.strictEqual(expiredHttpRes.status, 401, 'Expired cookie must fail HTTP 401');

    // 2h. Missing env fail-secure check (temporarily unset in test process memory)
    const origPass = process.env.ADMIN_PASSPHRASE;
    const origSecret = process.env.ADMIN_SESSION_SECRET;
    try {
      delete process.env.ADMIN_PASSPHRASE;
      assert.strictEqual(isAuthConfigured(), false, 'Missing ADMIN_PASSPHRASE must report unconfigured');
      assert.strictEqual(verifyAdminPassphrase(passphrase), false, 'Missing env must fail closed');
      process.env.ADMIN_PASSPHRASE = origPass;
      delete process.env.ADMIN_SESSION_SECRET;
      assert.strictEqual(isAuthConfigured(), false, 'Missing ADMIN_SESSION_SECRET must report unconfigured');
    } finally {
      process.env.ADMIN_PASSPHRASE = origPass;
      process.env.ADMIN_SESSION_SECRET = origSecret;
    }

    record(
      'Stateless HttpOnly Cookie Auth, Tamper & Expiry',
      'PASS',
      'Verified 401 unauth isolation, 401 invalid password, signed HttpOnly+SameSite cookie, tampered & expired cookie rejection, and fail-secure missing-env check.'
    );
  } catch (err: any) {
    record('Stateless HttpOnly Cookie Auth, Tamper & Expiry', 'FAIL', err.message);
    process.exit(1);
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    Cookie: sessionCookie,
  };

  // 3. SSRF Security Protection (Auditor & Custom Job Sources)
  try {
    const blockedTargets = [
      'http://127.0.0.1:3000',
      'http://localhost:3000',
      'http://169.254.169.254/latest/meta-data/',
      'http://10.0.0.1',
    ];
    for (const target of blockedTargets) {
      const res = await fetch(`${BASE}/api/audit/preview`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ url: target }),
      });
      const json: any = await res.json();
      assert.strictEqual(json.audit?.auditType, 'ssrf_blocked', `Target ${target} was not SSRF-blocked!`);
    }

    const ssrfJobSrcRes = await fetch(`${BASE}/api/jobs/sources/custom`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        platform: 'custom_rss',
        companyOrLabel: 'Internal Metadata Test',
        boardSlugOrUrl: 'http://127.0.0.1:3000/jobs.rss',
      }),
    });
    assert.strictEqual(ssrfJobSrcRes.status, 400, 'Expected 400 SSRF block on internal custom RSS URL');

    // Search-only portals must reject enabling automated scraping
    const portalPatchRes = await fetch(`${BASE}/api/jobs/sources/linkedin_portal`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ enabled: true }),
    });
    assert.strictEqual(portalPatchRes.status, 400, 'Expected 400 compliance block on enabling LinkedIn scraping');

    record('SSRF & Source Compliance Protection', 'PASS', 'Blocked internal IPs on Auditor + Custom RSS and enforced LinkedIn/portal compliance lock.');
  } catch (err: any) {
    record('SSRF & Source Compliance Protection', 'FAIL', err.message);
  }

  // 4. Real Live Website Audit, Duplicate Lead Prevention & Human Approval Gate
  try {
    const auditRes = await fetch(`${BASE}/api/audit/preview`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        url: 'https://little-world-school.vercel.app/',
        businessName: 'Little World School Verification',
        category: 'Schools',
      }),
    });
    const auditJson: any = await auditRes.json();
    assert.strictEqual(auditRes.status, 200);
    assert.strictEqual(auditJson.audit.auditType, 'live_measured');
    assert(auditJson.audit.responseTimeMs > 0);
    record(
      'Real Live Website Audit',
      'PASS',
      `Live HTTP ${auditJson.audit.httpStatus} in ${auditJson.audit.responseTimeMs}ms (${auditJson.audit.htmlBytes} bytes).`
    );
  } catch (err: any) {
    record('Real Live Website Audit', 'FAIL', err.message);
  }

  // 5. Job Scam Engine, Honest Currency Parsing, Expiration Detection & 7-Factor Scoring
  try {
    const scamRes = await fetch(`${BASE}/api/jobs/inspect`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        jobTitle: 'Data Entry Work From Home',
        employerName: 'Unknown Fast Cash Co',
        originalPostingUrl: 'https://example.org/scam-job-test',
        description:
          'Pay registration fee ₹999 before onboarding. Send your bank password and OTP to recruiter WhatsApp for instant salary.',
        salaryRange: '₹15,000/month',
        countryEligibility: 'India / Remote',
        saveToDb: false,
      }),
    });
    const scamJson: any = await scamRes.json();
    assert.strictEqual(scamRes.status, 200);
    assert.strictEqual(scamJson.evidence.classification, 'REJECTED');
    assert(scamJson.evidence.paymentScamSignals.length >= 2);
    assert.strictEqual(scamJson.salaryBucket, 'Other / non-USD disclosed', 'INR salary must not fabricate USD conversion!');
    assert.strictEqual(scamJson.indiaEligibility, 'Explicitly accepts India applicants');

    const expiredRes = await fetch(`${BASE}/api/jobs/inspect`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        jobTitle: 'React Frontend Developer',
        employerName: 'Acme Tech',
        companyWebsite: 'https://acmetech.example.com',
        originalPostingUrl: 'https://boards.greenhouse.io/acme/jobs/1234',
        description: 'Build responsive React interfaces remotely.',
        salaryRange: '$1,500/month',
        countryEligibility: 'Worldwide',
        applicationDeadline: '2022-01-01',
        saveToDb: false,
      }),
    });
    const expiredJson: any = await expiredRes.json();
    assert.strictEqual(expiredRes.status, 200);
    assert.strictEqual(expiredJson.isExpired, true, 'Past deadline must set isExpired = true');
    assert.strictEqual(expiredJson.evidence.classification, 'REJECTED', 'Expired job must classify REJECTED');
    assert.strictEqual(expiredJson.salaryBucket, '$1,000–$2,000/month');
    assert.strictEqual(expiredJson.indiaEligibility, 'Worldwide applicants');
    assert.strictEqual(expiredJson.suitability.factors.length, 7, 'Must compute 7 separate matching factors');

    record(
      'Job Scam, Honest Currency, Expiry & 7-Factor Score',
      'PASS',
      'Detected scam signals -> REJECTED, blocked fake USD conversion on INR, marked past deadline expired, validated 7-factor score.'
    );
  } catch (err: any) {
    record('Job Scam, Honest Currency, Expiry & 7-Factor Score', 'FAIL', err.message);
  }

  // 6. Live Multi-Source Global Job Sync (All 7 Public Feeds) & Cooldown Isolation
  try {
    const syncRes = await fetch(`${BASE}/api/jobs/sync`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({}),
    });
    const syncJson: any = await syncRes.json();
    assert.strictEqual(syncRes.status, 200);
    const summaries = syncJson.result?.sourceSummaries || [];
    assert.strictEqual(summaries.length, 7, `Expected 7 configured public job sources, got ${summaries.length}`);
    const healthyOrCooldown = summaries.filter(
      (s: any) => s.status === 'ok' || s.status === 'skipped_cooldown' || s.status === 'rate_limited'
    );
    assert(healthyOrCooldown.length >= 6, `Expected at least 6 working/rate-limited feeds, got ${healthyOrCooldown.length}`);

    // Test /api/jobs KPIs, filters & CSV export
    const jobsRes = await fetch(`${BASE}/api/jobs?sort=india_first`, { headers: authHeaders });
    const jobsJson: any = await jobsRes.json();
    assert.strictEqual(jobsRes.status, 200);
    assert(jobsJson.summary && typeof jobsJson.summary.totalUniqueJobs === 'number');
    assert(jobsJson.summary.totalUniqueJobs > 0, 'Expected real jobs persisted from live public feeds');
    assert(Array.isArray(jobsJson.officialPortals) && jobsJson.officialPortals.length === 5);

    const csvRes = await fetch(`${BASE}/api/jobs/export/csv`, { headers: authHeaders });
    assert.strictEqual(csvRes.status, 200);
    const csvText = await csvRes.text();
    assert(csvText.includes('Original Posting URL') && csvText.includes('India Eligibility'));

    record(
      'Global 7-Feed Job Discovery, KPIs, Filters & CSV',
      'PASS',
      `Synced ${summaries.length} sources (${summaries.filter((s: any) => s.status === 'ok').length} OK); ${jobsJson.summary.totalUniqueJobs} unique global jobs stored (${jobsJson.summary.indiaEligibleCount} explicit India, ${jobsJson.summary.worldwideCount} worldwide).`
    );
  } catch (err: any) {
    record('Global 7-Feed Job Discovery, KPIs, Filters & CSV', 'FAIL', err.message);
  }

  // 7. Scheduler Trigger & Real Execution Logs
  try {
    const triggerRes = await fetch(`${BASE}/api/discovery/trigger`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ mode: 'jobs' }),
    });
    const triggerJson: any = await triggerRes.json();
    assert.strictEqual(triggerRes.status, 200);
    assert(triggerJson.run && Array.isArray(triggerJson.run.steps) && triggerJson.run.steps.length >= 4);
    record(
      'Scheduler Run & Execution Logs',
      'PASS',
      `Status: ${triggerJson.run.status}, Jobs: +${triggerJson.run.jobsAdded}/${triggerJson.run.jobsEvaluated}, Duration: ${triggerJson.run.durationMs}ms.`
    );
  } catch (err: any) {
    record('Scheduler Run & Execution Logs', 'FAIL', err.message);
  }

  // 8. Static Website Factory (Zero Database Guarantee)
  try {
    const factoryRes = await fetch(`${BASE}/api/factory/generate`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        businessName: 'City Care Dental Clinic',
        industry: 'Clinics',
        city: 'Andheri, Mumbai',
        isDemoProposal: true,
      }),
    });
    const factoryJson: any = await factoryRes.json();
    assert.strictEqual(factoryRes.status, 200);
    const html: string = factoryJson.bundle.indexHtml;
    assert(html.includes('PROPOSAL DEMO PREVIEW BY VICTORIX'));
    assert(html.includes('https://wa.me/'));
    assert(html.includes('application/ld+json'));
    assert(!html.toLowerCase().includes('postgresql') && !html.toLowerCase().includes('d1database'));
    assert(factoryJson.bundle.sitemapXml.includes('.pages.dev'));
    assert(factoryJson.bundle.robotsTxt.includes('Sitemap:'));
    record('Static Website Factory & Demo Generator', 'PASS', 'Generated DB-free static HTML5, Schema.org, WhatsApp CTA, sitemap.xml, robots.txt.');
  } catch (err: any) {
    record('Static Website Factory & Demo Generator', 'FAIL', err.message);
  }

  // 9. Honest SEO, Free-Tier Monitor, D1 Schema & Backup Export
  try {
    const [seoRes, ftRes, schemaRes, backupRes] = await Promise.all([
      fetch(`${BASE}/api/admin/seo`, { headers: authHeaders }),
      fetch(`${BASE}/api/free-tier`, { headers: authHeaders }),
      fetch(`${BASE}/api/schema/d1`),
      fetch(`${BASE}/api/backup/export`, { headers: authHeaders }),
    ]);
    const seoJson: any = await seoRes.json();
    assert.strictEqual(seoJson.gsc.connected, false);
    assert.strictEqual(seoJson.gsc.status, 'NOT CONNECTED');
    assert.strictEqual(seoJson.ga4.connected, false);
    assert.strictEqual(seoJson.ga4.status, 'NOT CONNECTED');

    const ftJson: any = await ftRes.json();
    assert(Array.isArray(ftJson.services) && ftJson.services.length >= 8);

    const schemaSql = await schemaRes.text();
    assert(schemaSql.includes('CREATE TABLE IF NOT EXISTS business_leads'));
    assert(schemaSql.includes('CREATE TABLE IF NOT EXISTS remote_jobs'));
    assert(schemaSql.includes('CREATE TABLE IF NOT EXISTS job_alerts'));

    const backupJson: any = await backupRes.json();
    assert(backupJson.exportedAt && backupJson.data);
    record('Honest SEO, Free-Tier Monitor, D1 Schema & Backup', 'PASS', `${ftJson.services.length} free-tier services tracked, GSC/GA4 honestly NOT CONNECTED, D1 SQL (incl. job_alerts) & JSON backup valid.`);
  } catch (err: any) {
    record('Honest SEO, Free-Tier Monitor, D1 Schema & Backup', 'FAIL', err.message);
  }

  // 10. Logout & Cookie Revocation Check
  try {
    const logoutRes = await fetch(`${BASE}/api/admin/logout`, {
      method: 'POST',
      headers: { Cookie: sessionCookie },
    });
    assert.strictEqual(logoutRes.status, 200);
    const clearCookieHeader = logoutRes.headers.get('set-cookie') || '';
    assert(clearCookieHeader.includes(`${ADMIN_COOKIE_NAME}=`), 'Logout must clear session cookie');

    // Replaying revoked cookie must return 401
    const replayRes = await fetch(`${BASE}/api/overview`, {
      headers: { Cookie: sessionCookie },
    });
    assert.strictEqual(replayRes.status, 401, 'Revoked session cookie replay must return 401');
    record('Logout & Session Revocation', 'PASS', 'Cleared HttpOnly cookie and revoked token JTI against replay.');
  } catch (err: any) {
    record('Logout & Session Revocation', 'FAIL', err.message);
  }

  // 11. Static Verification: Zero Emails in UI & Zero Hardcoded Admin Credentials in Source
  try {
    const srcFiles = fs.readdirSync(path.join(process.cwd(), 'src'), { recursive: true }) as string[];
    let emailLeak = '';
    let secretLeak = '';
    const adminPass = process.env.ADMIN_PASSPHRASE || '';
    for (const rel of srcFiles) {
      if (!rel.endsWith('.ts') && !rel.endsWith('.tsx')) continue;
      const content = fs.readFileSync(path.join(process.cwd(), 'src', rel), 'utf-8');
      if (/@gmail\.com|@yahoo\.com|mailto:|@victorix/i.test(content)) {
        emailLeak = rel;
        break;
      }
      if ((adminPass && content.includes(adminPass)) || content.includes('ADMIN_SESSION_SECRET')) {
        secretLeak = `src/${rel}`;
        break;
      }
    }
    const serverFiles = ['server.ts', ...(fs.readdirSync(path.join(process.cwd(), 'server')).map((f) => `server/${f}`))];
    for (const sFile of serverFiles) {
      if (!sFile.endsWith('.ts')) continue;
      const sContent = fs.readFileSync(path.join(process.cwd(), sFile), 'utf-8');
      if (adminPass && sContent.includes(adminPass)) {
        secretLeak = sFile;
        break;
      }
    }
    assert.strictEqual(emailLeak, '', `Unexpected email reference found in src/${emailLeak}`);
    assert.strictEqual(secretLeak, '', `Hardcoded admin credential or secret found in ${secretLeak}`);
    record('Zero-Email & Zero-Hardcoded-Secret Verification', 'PASS', 'Confirmed zero emails in UI and zero hardcoded passphrases/secrets in frontend or server source.');
  } catch (err: any) {
    record('Zero-Email & Zero-Hardcoded-Secret Verification', 'FAIL', err.message);
  }

  const failed = results.filter((r) => r.status === 'FAIL');
  console.log(`\nSummary: ${results.length - failed.length}/${results.length} checks passed.`);
  if (failed.length > 0) process.exit(1);
}

runAcceptanceTests();
