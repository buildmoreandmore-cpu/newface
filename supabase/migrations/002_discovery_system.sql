-- Discovery System Migration
-- Adds tables and columns for automated model discovery with Apify + Gemini

-- Discovery jobs table - tracks scraping jobs
CREATE TABLE IF NOT EXISTS discovery_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('instagram', 'tiktok')),
  search_type text NOT NULL CHECK (search_type IN ('hashtag', 'location', 'profile')),
  search_query text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  apify_run_id text,
  candidates_found int DEFAULT 0,
  candidates_analyzed int DEFAULT 0,
  error_message text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Enable RLS on discovery_jobs
ALTER TABLE discovery_jobs ENABLE ROW LEVEL SECURITY;

-- RLS policies for discovery_jobs
CREATE POLICY "Users can view their own discovery jobs"
  ON discovery_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own discovery jobs"
  ON discovery_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own discovery jobs"
  ON discovery_jobs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own discovery jobs"
  ON discovery_jobs FOR DELETE
  USING (auth.uid() = user_id);

-- Add 4-dimension scores to candidates table
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS physical_potential_score int CHECK (physical_potential_score IS NULL OR (physical_potential_score >= 0 AND physical_potential_score <= 100));
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS unsigned_probability_score int CHECK (unsigned_probability_score IS NULL OR (unsigned_probability_score >= 0 AND unsigned_probability_score <= 100));
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS reachability_score int CHECK (reachability_score IS NULL OR (reachability_score >= 0 AND reachability_score <= 100));
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS engagement_health_score int CHECK (engagement_health_score IS NULL OR (engagement_health_score >= 0 AND engagement_health_score <= 100));
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS discovery_job_id uuid REFERENCES discovery_jobs(id) ON DELETE SET NULL;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS vision_analyzed boolean DEFAULT false;

-- Index for discovery job lookups
CREATE INDEX IF NOT EXISTS idx_discovery_jobs_user_id ON discovery_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_discovery_jobs_status ON discovery_jobs(status);
CREATE INDEX IF NOT EXISTS idx_candidates_discovery_job ON candidates(discovery_job_id);
CREATE INDEX IF NOT EXISTS idx_candidates_dimension_scores ON candidates(physical_potential_score DESC, unsigned_probability_score DESC);
