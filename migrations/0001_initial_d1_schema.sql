-- ============================================================================
-- VICTORIX 3.0 PRIVATE AUTOMATION DATABASE SCHEMA (CLOUDFLARE D1 / SQLite)
-- Zero-Cost Tier Compatible | Client Static Websites DO NOT Use This Database
-- ============================================================================

-- 1. business_leads
CREATE TABLE IF NOT EXISTS business_leads (
  id TEXT PRIMARY KEY,
  business_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  city TEXT NOT NULL,
  locality TEXT,
  priority_tier TEXT NOT NULL DEFAULT 'Priority 1: Mumbai',
  website_url TEXT NOT NULL UNIQUE,
  public_contact TEXT,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  discovery_timestamp TEXT NOT NULL,
  website_available INTEGER NOT NULL DEFAULT 0,
  recommended_service TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'new_lead' CHECK (stage IN (
    'new_lead', 'analysed', 'reviewed', 'contacted', 'interested',
    'meeting_scheduled', 'proposal_sent', 'negotiation', 'won', 'lost'
  )),
  score_total INTEGER NOT NULL DEFAULT 0,
  score_priority TEXT NOT NULL DEFAULT 'Medium' CHECK (score_priority IN ('High', 'Medium', 'Low')),
  score_breakdown_json TEXT NOT NULL DEFAULT '{}',
  deal_value_inr INTEGER NOT NULL DEFAULT 5999,
  follow_up_date TEXT,
  assigned_to TEXT NOT NULL DEFAULT 'Vicky Vishwakarma',
  human_approved_for_outreach INTEGER NOT NULL DEFAULT 0,
  proposal_json TEXT,
  notes_json TEXT NOT NULL DEFAULT '[]',
  activities_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_business_leads_stage ON business_leads(stage);
CREATE INDEX IF NOT EXISTS idx_business_leads_city ON business_leads(city);
CREATE INDEX IF NOT EXISTS idx_business_leads_score ON business_leads(score_total DESC);

-- 2. website_audits
CREATE TABLE IF NOT EXISTS website_audits (
  id TEXT PRIMARY KEY,
  lead_id TEXT REFERENCES business_leads(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  http_status INTEGER NOT NULL DEFAULT 0,
  response_time_ms INTEGER NOT NULL DEFAULT 0,
  html_bytes INTEGER NOT NULL DEFAULT 0,
  is_https INTEGER NOT NULL DEFAULT 0,
  has_viewport_meta INTEGER NOT NULL DEFAULT 0,
  has_title INTEGER NOT NULL DEFAULT 0,
  page_title TEXT,
  has_meta_description INTEGER NOT NULL DEFAULT 0,
  h1_count INTEGER NOT NULL DEFAULT 0,
  h2_count INTEGER NOT NULL DEFAULT 0,
  alt_tags_missing INTEGER NOT NULL DEFAULT 0,
  canonical_present INTEGER NOT NULL DEFAULT 0,
  sitemap_available INTEGER NOT NULL DEFAULT 0,
  robots_available INTEGER NOT NULL DEFAULT 0,
  security_headers_score INTEGER NOT NULL DEFAULT 0,
  broken_links_checked INTEGER NOT NULL DEFAULT 0,
  broken_links_found INTEGER NOT NULL DEFAULT 0,
  audit_status TEXT NOT NULL DEFAULT 'measured' CHECK (audit_status IN ('measured', 'unreachable', 'ssrf_blocked')),
  findings_json TEXT NOT NULL DEFAULT '{}',
  scanned_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_website_audits_lead ON website_audits(lead_id);
CREATE INDEX IF NOT EXISTS idx_website_audits_url ON website_audits(url);

-- 3. remote_jobs (Global Remote Job Hunter Schema)
CREATE TABLE IF NOT EXISTS remote_jobs (
  id TEXT PRIMARY KEY,
  external_job_id TEXT,
  fingerprint TEXT NOT NULL UNIQUE,
  job_title TEXT NOT NULL,
  employer_name TEXT NOT NULL,
  company_website TEXT,
  description TEXT NOT NULL,
  original_posting_url TEXT NOT NULL,
  application_url TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_attribution_url TEXT,
  discovered_sources_json TEXT NOT NULL DEFAULT '[]',
  published_at TEXT NOT NULL,
  last_checked_at TEXT NOT NULL,
  salary_range TEXT,
  salary_bucket TEXT NOT NULL DEFAULT 'Unpaid / not disclosed',
  employment_type TEXT NOT NULL DEFAULT 'Remote',
  work_type TEXT NOT NULL DEFAULT 'Not specified',
  experience_required TEXT,
  experience_level TEXT NOT NULL DEFAULT 'Not specified',
  country_eligibility TEXT NOT NULL DEFAULT 'India / Worldwide',
  location_country_bucket TEXT NOT NULL DEFAULT 'Worldwide / Anywhere',
  india_eligibility TEXT NOT NULL DEFAULT 'India eligibility unclear',
  remote_status TEXT NOT NULL DEFAULT 'Remote',
  application_deadline TEXT,
  is_expired INTEGER NOT NULL DEFAULT 0,
  device_compatibility TEXT NOT NULL DEFAULT 'Not specified' CHECK (device_compatibility IN (
    'Laptop required', 'Laptop preferred', 'Mobile friendly', 'Both supported', 'Not specified'
  )),
  category TEXT NOT NULL,
  risk_classification TEXT NOT NULL DEFAULT 'NEEDS REVIEW' CHECK (risk_classification IN (
    'VERIFIED', 'NEEDS REVIEW', 'SUSPICIOUS', 'REJECTED'
  )),
  suitability_score INTEGER NOT NULL DEFAULT 0,
  suitability_breakdown_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_remote_jobs_risk ON remote_jobs(risk_classification);
CREATE INDEX IF NOT EXISTS idx_remote_jobs_suitability ON remote_jobs(suitability_score DESC);
CREATE INDEX IF NOT EXISTS idx_remote_jobs_category ON remote_jobs(category);
CREATE INDEX IF NOT EXISTS idx_remote_jobs_india ON remote_jobs(india_eligibility);
CREATE INDEX IF NOT EXISTS idx_remote_jobs_country ON remote_jobs(location_country_bucket);

-- 4. job_verification_evidence
CREATE TABLE IF NOT EXISTS job_verification_evidence (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES remote_jobs(id) ON DELETE CASCADE,
  classification TEXT NOT NULL CHECK (classification IN ('VERIFIED', 'NEEDS REVIEW', 'SUSPICIOUS', 'REJECTED')),
  employer_domain_match INTEGER NOT NULL DEFAULT 0,
  official_website_reachable INTEGER NOT NULL DEFAULT 0,
  payment_scam_signals_json TEXT NOT NULL DEFAULT '[]',
  positive_evidence_json TEXT NOT NULL DEFAULT '[]',
  risk_flags_json TEXT NOT NULL DEFAULT '[]',
  checked_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_job_evidence_job ON job_verification_evidence(job_id);

-- 5. saved_jobs
CREATE TABLE IF NOT EXISTS saved_jobs (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL UNIQUE REFERENCES remote_jobs(id) ON DELETE CASCADE,
  personal_notes TEXT DEFAULT '',
  saved_at TEXT NOT NULL
);

-- 6. job_applications
CREATE TABLE IF NOT EXISTS job_applications (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL UNIQUE REFERENCES remote_jobs(id) ON DELETE CASCADE,
  stage TEXT NOT NULL DEFAULT 'DISCOVERED' CHECK (stage IN (
    'DISCOVERED', 'VERIFIED', 'SHORTLISTED', 'READY TO APPLY', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED'
  )),
  personal_notes TEXT DEFAULT '',
  interview_notes TEXT DEFAULT '',
  application_date TEXT,
  follow_up_reminder TEXT,
  message_draft TEXT DEFAULT '',
  human_approved INTEGER NOT NULL DEFAULT 0,
  cv_suggestions_json TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_job_apps_stage ON job_applications(stage);

-- 7. job_alerts
CREATE TABLE IF NOT EXISTS job_alerts (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES remote_jobs(id) ON DELETE CASCADE,
  fingerprint TEXT NOT NULL UNIQUE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('india_eligible', 'worldwide_remote', 'high_match', 'freelance')),
  title TEXT NOT NULL,
  employer_name TEXT NOT NULL,
  country_eligibility TEXT NOT NULL,
  match_score INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  read INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_job_alerts_created ON job_alerts(created_at DESC);

-- 8. automation_runs
CREATE TABLE IF NOT EXISTS automation_runs (
  id TEXT PRIMARY KEY,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('github_actions', 'cloudflare_worker', 'manual_run', 'local_server')),
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'partial', 'failed', 'skipped_locked')),
  started_at TEXT NOT NULL,
  finished_at TEXT,
  duration_ms INTEGER DEFAULT 0,
  business_evaluated INTEGER DEFAULT 0,
  business_added INTEGER DEFAULT 0,
  jobs_evaluated INTEGER DEFAULT 0,
  jobs_added INTEGER DEFAULT 0,
  duplicates_skipped INTEGER DEFAULT 0,
  steps_json TEXT NOT NULL DEFAULT '[]',
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_automation_runs_started ON automation_runs(started_at DESC);

-- 9. source_sync_state
CREATE TABLE IF NOT EXISTS source_sync_state (
  source_id TEXT PRIMARY KEY,
  source_name TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('business', 'job')),
  integration_type TEXT NOT NULL DEFAULT 'Public JSON API',
  integration_status TEXT NOT NULL DEFAULT 'connected_active',
  source_health TEXT NOT NULL DEFAULT 'untested',
  attribution_requirement TEXT NOT NULL DEFAULT '',
  config_url TEXT,
  min_interval_minutes INTEGER NOT NULL,
  daily_limit INTEGER NOT NULL,
  requests_today INTEGER NOT NULL DEFAULT 0,
  last_reset_date TEXT NOT NULL,
  last_synced_at TEXT,
  next_permitted_sync_at TEXT,
  last_status TEXT NOT NULL DEFAULT 'ready',
  last_error TEXT,
  enabled INTEGER NOT NULL DEFAULT 1
);

-- 10. follow_up_tasks
CREATE TABLE IF NOT EXISTS follow_up_tasks (
  id TEXT PRIMARY KEY,
  related_type TEXT NOT NULL CHECK (related_type IN ('business_lead', 'job_application')),
  related_id TEXT NOT NULL,
  title TEXT NOT NULL,
  due_date TEXT NOT NULL,
  assigned_to TEXT NOT NULL DEFAULT 'Vicky Vishwakarma',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_follow_up_due ON follow_up_tasks(due_date ASC);

-- 11. user_settings
CREATE TABLE IF NOT EXISTS user_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
