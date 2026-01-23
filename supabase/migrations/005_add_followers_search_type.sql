-- Add 'followers' to search_type constraint
-- This enables scraping followers of target accounts to find undiscovered talent

ALTER TABLE discovery_jobs
DROP CONSTRAINT IF EXISTS discovery_jobs_search_type_check;

ALTER TABLE discovery_jobs
ADD CONSTRAINT discovery_jobs_search_type_check
CHECK (search_type IN ('hashtag', 'location', 'profile', 'followers'));
