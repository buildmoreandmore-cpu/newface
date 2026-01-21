import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Instagram,
  Users,
  TrendingUp,
  MapPin,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { CandidateStatusBadge } from './CandidateStatusBadge';
import { CandidateNotes } from './CandidateNotes';
import { ScoreDimensions } from '@/components/candidates/ScoreDimensions';
import { createClient } from '@/lib/supabase/server';

const statusColors: Record<string, string> = {
  discovered: 'bg-blue-100 text-blue-700',
  contacted: 'bg-amber-100 text-amber-700',
  meeting: 'bg-purple-100 text-purple-700',
  signed: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  responded: 'bg-cyan-100 text-cyan-700',
};

function getScoreColor(score: number) {
  if (score >= 90) return 'text-emerald-600 bg-emerald-50';
  if (score >= 80) return 'text-blue-600 bg-blue-50';
  if (score >= 70) return 'text-amber-600 bg-amber-50';
  return 'text-zinc-600 bg-zinc-100';
}

function getScoreLabel(score: number) {
  if (score >= 90) return 'Exceptional';
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Good';
  return 'Average';
}

function getPlatformIcon(platform: string | null) {
  if (platform === 'instagram') return <Instagram className="h-4 w-4" />;
  if (platform === 'tiktok') return <Sparkles className="h-4 w-4" />;
  return <Sparkles className="h-4 w-4" />;
}

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch candidate from database
  const { data: candidate, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !candidate) {
    notFound();
  }

  // Extract dimension scores from ai_analysis if available
  const analysis = candidate.ai_analysis as Record<string, unknown> | null;
  const physical_potential = analysis?.physical_potential as { score: number; confidence: number; factors: string[]; notes: string } | undefined;
  const unsigned_probability = analysis?.unsigned_probability as { score: number; confidence: number; factors: string[]; notes: string } | undefined;
  const reachability = analysis?.reachability as { score: number; confidence: number; factors: string[]; notes: string } | undefined;
  const engagement_health = analysis?.engagement_health as { score: number; confidence: number; factors: string[]; notes: string } | undefined;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Hero Section */}
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Photo */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-zinc-100 shadow-xl">
            {candidate.avatar_url ? (
              <img
                src={candidate.avatar_url}
                alt={candidate.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-200">
                <span className="text-6xl font-bold text-zinc-400">
                  {candidate.name?.charAt(0) || '?'}
                </span>
              </div>
            )}
            {/* Gradient overlay at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            {/* Name and Handle */}
            <div>
              <h1 className="font-editorial text-4xl md:text-5xl italic tracking-tight text-zinc-900">
                {candidate.name}
              </h1>
              {candidate.handle && (
                <div className="flex items-center gap-2 mt-2 text-zinc-500">
                  {getPlatformIcon(candidate.platform)}
                  <span>@{candidate.handle}</span>
                  {candidate.profile_url && (
                    <a
                      href={candidate.profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 text-accent hover:text-accent/80"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              )}
              {candidate.location && (
                <div className="flex items-center gap-2 mt-1 text-zinc-500">
                  <MapPin className="h-4 w-4" />
                  <span>{candidate.location}</span>
                </div>
              )}
            </div>

            {/* Status and Score */}
            <div className="flex flex-wrap items-center gap-3">
              <CandidateStatusBadge
                currentStatus={candidate.status}
                statusColors={statusColors}
              />
              {candidate.ai_score && (
                <>
                  <div className={`px-4 py-2 rounded-full font-semibold ${getScoreColor(candidate.ai_score)}`}>
                    <span className="text-lg">{candidate.ai_score}</span>
                    <span className="text-sm ml-1 opacity-70">/ 100</span>
                  </div>
                  <span className="text-sm text-zinc-500">
                    {getScoreLabel(candidate.ai_score)} Match
                  </span>
                </>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">Followers</p>
                    <p className="text-lg font-semibold text-zinc-900">
                      {candidate.followers ? `${(candidate.followers / 1000).toFixed(candidate.followers >= 1000000 ? 1 : 0)}${candidate.followers >= 1000000 ? 'M' : 'K'}` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">Engagement</p>
                    <p className="text-lg font-semibold text-zinc-900">
                      {candidate.engagement_rate ? `${candidate.engagement_rate}%` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {candidate.bio && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
                <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-3">
                  About
                </h2>
                <p className="text-zinc-700 leading-relaxed">
                  {candidate.bio}
                </p>
              </div>
            )}

            {/* Platform Badge */}
            {candidate.platform && (
              <div className="flex items-center gap-2">
                <Badge className="bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border-0 capitalize">
                  {candidate.platform}
                </Badge>
                <span className="text-sm text-zinc-400">Primary Platform</span>
              </div>
            )}

            {/* AI Analysis Dimensions */}
            {(physical_potential || unsigned_probability || reachability || engagement_health ||
              candidate.physical_potential_score || candidate.unsigned_probability_score) && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
                <ScoreDimensions
                  physical_potential={physical_potential || (candidate.physical_potential_score ? { score: candidate.physical_potential_score, confidence: 0, factors: [], notes: '' } : undefined)}
                  unsigned_probability={unsigned_probability || (candidate.unsigned_probability_score ? { score: candidate.unsigned_probability_score, confidence: 0, factors: [], notes: '' } : undefined)}
                  reachability={reachability || (candidate.reachability_score ? { score: candidate.reachability_score, confidence: 0, factors: [], notes: '' } : undefined)}
                  engagement_health={engagement_health || (candidate.engagement_health_score ? { score: candidate.engagement_health_score, confidence: 0, factors: [], notes: '' } : undefined)}
                  vision_analyzed={candidate.vision_analyzed || (analysis?.vision_analyzed as boolean)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Notes Section */}
        <div className="max-w-xl">
          <CandidateNotes
            candidateId={candidate.id}
            initialNotes={candidate.notes || ''}
          />
        </div>
      </div>
    </div>
  );
}
