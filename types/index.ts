export type CandidateStatus =
  | 'discovered'
  | 'contacted'
  | 'responded'
  | 'meeting'
  | 'signed'
  | 'rejected';

export type Platform = 'instagram' | 'tiktok' | 'linkedin' | 'other';

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
}

export interface AIAnalysis {
  overall_assessment: string;
  strengths: string[];
  potential_categories: string[];
  marketability_score: number;
  professionalism_score: number;
  unique_factor: string;
  recommendations: string[];
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
