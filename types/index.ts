export type CandidateStatus =
  | 'discovered'
  | 'contacted'
  | 'responded'
  | 'meeting'
  | 'signed'
  | 'rejected';

export type Platform = 'instagram' | 'tiktok' | 'linkedin' | 'other';

export type DiscoveryPlatform = 'instagram' | 'tiktok';
export type DiscoveryPlatformOption = 'instagram' | 'tiktok' | 'both';
export type SearchType = 'hashtag' | 'location' | 'profile';
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';
export type TargetCity = 'NYC' | 'LA' | 'Chicago' | 'Atlanta';

// Street Casting filter configuration
export interface StreetCastingFilters {
  followerRange: [number, number];
  maxEngagementRate: number;
  cities: TargetCity[];
  ageRange: [number, number];
  preferUnpolished: boolean;
}

// Default Street Casting presets
export const STREET_CASTING_PRESETS: StreetCastingFilters = {
  followerRange: [1000, 3000],
  maxEngagementRate: 1.0,
  cities: ['NYC', 'LA', 'Chicago', 'Atlanta'],
  ageRange: [18, 24],
  preferUnpolished: true,
};

export const STREET_CASTING_HASHTAGS = [
  'newfaces',
  'streetcasting',
  'facesofnyc',
  'editorialportrait',
  'digitalsonly',
];

export interface Candidate {
  id: string;
  user_id: string;
  name: string;
  handle: string | null;
  platform: Platform | null;
  profile_url: string | null;
  avatar_url: string | null;
  bio: string | null;
  followers: number | null;
  engagement_rate: number | null;
  location: string | null;
  ai_score: number | null;
  ai_analysis: AIAnalysis | null;
  status: CandidateStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // 4-dimension scores
  physical_potential_score: number | null;
  unsigned_probability_score: number | null;
  reachability_score: number | null;
  engagement_health_score: number | null;
  discovery_job_id: string | null;
  vision_analyzed: boolean;
  // Street Casting scores
  estimated_age: number | null;
  age_confidence: number | null;
  raw_potential_score: number | null;
  street_casting_score: number | null;
  content_authenticity_score: number | null;
}

// Street Casting analysis dimensions
export interface StreetCastingAnalysis {
  estimated_age: number;
  age_confidence: number;
  raw_potential_score: number;
  street_casting_score: number;
  content_authenticity_score: number;
  content_style: 'professional' | 'semi-professional' | 'amateur' | 'candid';
  device_quality: 'dslr' | 'mirrorless' | 'iphone' | 'android' | 'unknown';
  authenticity_signals: string[];
}

// Discovery job for tracking scraping operations
export interface DiscoveryJob {
  id: string;
  user_id: string;
  platform: DiscoveryPlatform;
  search_type: SearchType;
  search_query: string;
  status: JobStatus;
  apify_run_id: string | null;
  candidates_found: number;
  candidates_analyzed: number;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
  // Street Casting enhancements
  filters: StreetCastingFilters | null;
  hashtags: string[] | null;
  platforms_searched: DiscoveryPlatform[] | null;
  street_casting_mode: boolean;
}

// Individual dimension score with details
export interface DimensionScore {
  score: number;
  confidence: number;
  factors: string[];
  notes: string;
}

// Enhanced AI Analysis with 4 dimensions
export interface AIAnalysis {
  overall_score: number;
  overall_assessment: string;
  strengths: string[];
  potential_categories: string[];
  recommendations: string[];
  vision_analyzed: boolean;
  // 4 dimensions
  physical_potential: DimensionScore;
  unsigned_probability: DimensionScore;
  reachability: DimensionScore;
  engagement_health: DimensionScore;
  // Legacy fields for backwards compatibility
  marketability_score?: number;
  professionalism_score?: number;
  unique_factor?: string;
}

export interface Profile {
  id: string;
  agency_name: string | null;
  created_at: string;
}

export interface Template {
  id: string;
  user_id: string;
  name: string;
  content: string;
  created_at: string;
}

export interface CSVCandidate {
  name: string;
  handle?: string;
  platform?: string;
  profile_url?: string;
  avatar_url?: string;
  bio?: string;
  followers?: number;
  engagement_rate?: number;
  location?: string;
}

// Apify scraped profile data (normalized from Instagram/TikTok)
export interface ApifyProfile {
  username: string;
  fullName: string;
  biography: string;
  profilePicUrl: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  engagementRate: number;
  isVerified: boolean;
  isBusinessAccount: boolean;
  externalUrl: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  recentPosts: ApifyPost[];
}

export interface ApifyPost {
  id: string;
  url: string;
  imageUrl: string;
  caption: string;
  likesCount: number;
  commentsCount: number;
  timestamp: string;
}

// Request/Response types for discovery API
export interface StartDiscoveryRequest {
  platform: DiscoveryPlatform;
  search_type: SearchType;
  search_query: string;
  limit?: number;
}

// Enhanced discovery request for Street Casting
export interface EnhancedDiscoveryRequest {
  platforms: DiscoveryPlatformOption;
  search_type: SearchType;
  hashtags: string[];
  limit?: number;
  street_casting_mode: boolean;
  filters?: StreetCastingFilters;
}

export interface AnalyzeRequest {
  candidate_id?: string;
  profile: ApifyProfile | CSVCandidate;
  image_urls?: string[];
}
