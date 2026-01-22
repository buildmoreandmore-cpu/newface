-- Street Casting Discovery System Migration
-- Adds support for multi-platform discovery, filtering, and street casting analysis

-- Add new columns to discovery_jobs table
ALTER TABLE discovery_jobs
ADD COLUMN IF NOT EXISTS filters jsonb DEFAULT NULL,
ADD COLUMN IF NOT EXISTS hashtags text[] DEFAULT NULL,
ADD COLUMN IF NOT EXISTS platforms_searched text[] DEFAULT NULL,
ADD COLUMN IF NOT EXISTS street_casting_mode boolean DEFAULT false;

-- Add street casting scores to candidates table
ALTER TABLE candidates
ADD COLUMN IF NOT EXISTS estimated_age integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS age_confidence integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS raw_potential_score integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS street_casting_score integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS content_authenticity_score integer DEFAULT NULL;

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_candidates_street_casting_score
ON candidates(street_casting_score DESC NULLS LAST)
WHERE street_casting_score IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_candidates_estimated_age
ON candidates(estimated_age)
WHERE estimated_age IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_candidates_raw_potential
ON candidates(raw_potential_score DESC NULLS LAST)
WHERE raw_potential_score IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_discovery_jobs_street_casting
ON discovery_jobs(street_casting_mode, created_at DESC)
WHERE street_casting_mode = true;

-- Add comment for documentation
COMMENT ON COLUMN discovery_jobs.filters IS 'JSON containing StreetCastingFilters: followerRange, maxEngagementRate, cities, ageRange, preferUnpolished';
COMMENT ON COLUMN discovery_jobs.hashtags IS 'Array of hashtags searched in this job';
COMMENT ON COLUMN discovery_jobs.platforms_searched IS 'Array of platforms: instagram, tiktok, or both';
COMMENT ON COLUMN discovery_jobs.street_casting_mode IS 'Whether this job used street casting presets';

COMMENT ON COLUMN candidates.estimated_age IS 'AI-estimated age from visual analysis';
COMMENT ON COLUMN candidates.age_confidence IS 'Confidence level (0-100) of age estimation';
COMMENT ON COLUMN candidates.raw_potential_score IS 'Score for unpolished/authentic content quality';
COMMENT ON COLUMN candidates.street_casting_score IS 'Composite score weighted for street casting criteria';
COMMENT ON COLUMN candidates.content_authenticity_score IS 'Score for iPhone/candid vs professional content';
