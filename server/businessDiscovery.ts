import { storage } from './storage.js';
import { performSafeWebsiteAudit } from './ssrfAuditor.js';
import { generateAiProposal } from './geminiService.js';
import { BusinessLead } from '../src/types/index.js';

interface OverpassRegion {
  priority: 'Priority 1: Mumbai' | 'Priority 2: Maharashtra' | 'Priority 3: India';
  city: string;
  bbox: string; // south,west,north,east
}

const REGIONS: Record<string, OverpassRegion[]> = {
  'Priority 1: Mumbai': [
    { priority: 'Priority 1: Mumbai', city: 'Mumbai, Maharashtra', bbox: '18.92,72.81,19.22,72.97' },
  ],
  'Priority 2: Maharashtra': [
    { priority: 'Priority 2: Maharashtra', city: 'Thane / Navi Mumbai, Maharashtra', bbox: '19.01,72.96,19.26,73.11' },
    { priority: 'Priority 2: Maharashtra', city: 'Pune, Maharashtra', bbox: '18.45,73.78,18.60,73.93' },
  ],
  'Priority 3: India': [
    { priority: 'Priority 3: India', city: 'Bengaluru, Karnataka', bbox: '12.90,77.52,13.04,77.67' },
    { priority: 'Priority 3: India', city: 'New Delhi, Delhi', bbox: '28.54,77.14,28.68,77.28' },
  ],
};

function mapOsmTagsToIndustry(tags: Record<string, string>): string {
  const amenity = (tags.amenity || '').toLowerCase();
  const shop = (tags.shop || '').toLowerCase();
  const office = (tags.office || '').toLowerCase();

  if (amenity === 'restaurant' || amenity === 'cafe' || amenity === 'fast_food') return 'Restaurants';
  if (amenity === 'clinic' || amenity === 'hospital' || amenity === 'dentist') return 'Clinics';
  if (amenity === 'doctors' || tags.healthcare === 'doctor') return 'Doctors';
  if (amenity === 'school') return 'Schools';
  if (amenity === 'college' || amenity === 'training' || amenity === 'language_school') return 'Coaching Institutes';
  if (shop === 'beauty' || shop === 'hairdresser') return 'Salons';
  if (office === 'estate_agent' || office === 'property') return 'Real Estate';
  if (office === 'consulting' || office === 'accountant' || office === 'lawyer') return 'Consultants';
  if (shop) return 'Local Retailers';
  return 'Small Businesses';
}

export async function runBusinessClientDiscovery(options?: {
  priority?: 'Priority 1: Mumbai' | 'Priority 2: Maharashtra' | 'Priority 3: India';
  forceManual?: boolean;
}): Promise<{
  evaluated: number;
  added: number;
  duplicatesSkipped: number;
  sourceStatus: string;
  error?: string;
}> {
  const syncState = storage.state.sourceSyncState.find((s) => s.sourceId === 'osm_overpass_business');
  if (!syncState || !syncState.enabled) {
    return { evaluated: 0, added: 0, duplicatesSkipped: 0, sourceStatus: 'disabled', error: 'Business source disabled' };
  }

  storage.rolloverQuotasIfNeeded();

  // Check source-specific cooldown unless forced manually within daily quota
  if (!options?.forceManual && syncState.lastSyncedAt) {
    const minsSince = (Date.now() - new Date(syncState.lastSyncedAt).getTime()) / 60000;
    if (minsSince < syncState.minIntervalMinutes) {
      return {
        evaluated: 0,
        added: 0,
        duplicatesSkipped: 0,
        sourceStatus: 'cooldown',
        error: `Respecting ${syncState.minIntervalMinutes}-min source interval (${Math.round(syncState.minIntervalMinutes - minsSince)}m remaining).`,
      };
    }
  }

  if (syncState.requestsToday >= syncState.dailyLimit) {
    syncState.lastStatus = 'rate_limited';
    syncState.lastError = 'Daily Overpass quota limit reached.';
    storage.save();
    return { evaluated: 0, added: 0, duplicatesSkipped: 0, sourceStatus: 'rate_limited', error: 'Daily limit reached' };
  }

  const targetPriority = options?.priority || storage.state.userSettings.businessDiscoveryPriority || 'Priority 1: Mumbai';
  const regionList = REGIONS[targetPriority] || REGIONS['Priority 1: Mumbai'];
  const region = regionList[Math.floor(Math.random() * regionList.length)];

  // Overpass QL query for real businesses in target industries with a public website tag
  const query = `
[out:json][timeout:12];
(
  node["amenity"~"restaurant|cafe|clinic|doctors|dentist|school|college|training"]["name"]["website"](${region.bbox});
  node["shop"~"beauty|hairdresser|electronics|clothes|bakery|furniture|jewelry"]["name"]["website"](${region.bbox});
  node["office"~"estate_agent|consulting|accountant|company"]["name"]["website"](${region.bbox});
  way["amenity"~"clinic|school|restaurant"]["name"]["website"](${region.bbox});
);
out center 15;
`;

  let evaluated = 0;
  let added = 0;
  let duplicatesSkipped = 0;

  // Exponential backoff retry (up to 2 attempts)
  let rawElements: any[] = [];
  let lastFetchErr = '';

  for (let attempt = 1; attempt <= 2; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 14000);
    try {
      syncState.requestsToday += 1;
      storage.state.quotas.overpassRequestsToday += 1;

      const resp = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'VICTORIX-ClientHunter/3.0 (+https://victorix.in)',
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (resp.status === 429 || resp.status >= 500) {
        lastFetchErr = `Overpass API HTTP ${resp.status}`;
        await new Promise((r) => setTimeout(r, attempt * 1500));
        continue;
      }

      if (!resp.ok) {
        lastFetchErr = `Overpass API returned HTTP ${resp.status}`;
        break;
      }

      const json: any = await resp.json();
      rawElements = Array.isArray(json?.elements) ? json.elements : [];
      lastFetchErr = '';
      break;
    } catch (err: any) {
      clearTimeout(timer);
      lastFetchErr = err?.name === 'AbortError' ? 'Overpass query timed out' : err?.message || 'Network error';
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, attempt * 1500));
      }
    }
  }

  syncState.lastSyncedAt = new Date().toISOString();

  if (lastFetchErr) {
    syncState.lastStatus = 'error';
    syncState.lastError = lastFetchErr;
    storage.save();
    return { evaluated: 0, added: 0, duplicatesSkipped: 0, sourceStatus: 'error', error: lastFetchErr };
  }

  const existingUrls = new Set(storage.state.leads.map((l) => l.websiteUrl.toLowerCase().replace(/\/$/, '')));

  for (const el of rawElements) {
    const tags = el.tags || {};
    const name = (tags.name || '').trim();
    const rawSite = (tags.website || tags['contact:website'] || '').trim();
    if (!name || !rawSite) continue;

    evaluated += 1;
    const cleanUrl = rawSite.startsWith('http') ? rawSite : `https://${rawSite}`;
    const normUrl = cleanUrl.toLowerCase().replace(/\/$/, '');
    const fp = `lead:${normUrl}`;

    if (existingUrls.has(normUrl) || storage.hasFingerprint(fp)) {
      duplicatesSkipped += 1;
      continue;
    }

    // Cap newly audited leads per cycle at 2 to stay polite and fast within timeouts
    if (added >= 2) break;

    const industry = mapOsmTagsToIndustry(tags);
    const locality = tags['addr:suburb'] || tags['addr:street'] || tags['addr:city'] || '';
    const phone = tags.phone || tags['contact:phone'] || tags['contact:mobile'] || undefined;
    const sourceUrl = `https://www.openstreetmap.org/${el.type || 'node'}/${el.id}`;

    const { audit, score, recommendedService } = await performSafeWebsiteAudit(
      cleanUrl,
      name,
      industry,
      Boolean(phone)
    );

    const proposal = await generateAiProposal({
      businessName: name,
      websiteUrl: audit.url,
      category: industry,
      recommendedService,
      observedIssues: audit.observedIssues,
    });

    const newLead: BusinessLead = {
      id: `lead-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      businessName: name,
      category: industry,
      city: region.city,
      locality,
      priorityTier: region.priority,
      websiteUrl: audit.url,
      websiteAvailable: audit.httpStatus > 0 && audit.httpStatus < 400,
      phone,
      source: 'OpenStreetMap Public Directory',
      sourceUrl,
      discoveryTimestamp: new Date().toISOString(),
      stage: 'analysed',
      recommendedService,
      dealValue: recommendedService === 'Ecommerce Development' ? 14999 : 5999,
      assignedTo: 'Vicky Vishwakarma',
      followUpDate: null,
      humanApprovedForOutreach: false,
      notes: [
        {
          id: `note-${Date.now()}`,
          author: 'Vicky',
          text: `Discovered via OpenStreetMap (${sourceUrl}). Measured HTTP ${audit.httpStatus} in ${audit.responseTimeMs}ms. Score: ${score.totalScore}/100.`,
          createdAt: new Date().toISOString(),
        },
      ],
      activities: [],
      audit,
      score,
      proposal,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    newLead.proposal!.leadId = newLead.id;
    storage.state.leads.unshift(newLead);
    existingUrls.add(normUrl);
    storage.addFingerprint(fp);
    added += 1;
  }

  syncState.lastStatus = 'ok';
  syncState.lastError = null;
  storage.save();

  return {
    evaluated,
    added,
    duplicatesSkipped,
    sourceStatus: 'ok',
  };
}
