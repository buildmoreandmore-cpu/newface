import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ScoreDimensions } from '@/components/candidates/ScoreDimensions';
import { createClient } from '@/lib/supabase/server';
import { Sparkles } from 'lucide-react';
import type { Candidate } from '@/types';

const statusColors: Record<string, string> = {
  discovered: 'bg-blue-100 text-blue-700',
  contacted: 'bg-amber-100 text-amber-700',
  responded: 'bg-cyan-100 text-cyan-700',
  meeting: 'bg-purple-100 text-purple-700',
  signed: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
};

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch candidates from database
  const { data: candidates } = await supabase
    .from('candidates')
    .select('*')
    .order('ai_score', { ascending: false })
    .limit(50);

  // Calculate stats from real data
  const stats = [
    { label: 'Discovered', value: candidates?.filter(c => c.status === 'discovered').length || 0, color: 'bg-blue-500' },
    { label: 'Contacted', value: candidates?.filter(c => c.status === 'contacted').length || 0, color: 'bg-amber-500' },
    { label: 'In Meeting', value: candidates?.filter(c => c.status === 'meeting').length || 0, color: 'bg-purple-500' },
    { label: 'Signed', value: candidates?.filter(c => c.status === 'signed').length || 0, color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-editorial text-4xl md:text-5xl italic tracking-tight text-zinc-900">
            Discover
          </h1>
          <p className="text-zinc-500 mt-1">
            Your talent discovery pipeline
          </p>
        </div>

        {/* Stats Pills */}
        <div className="flex flex-wrap gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm border border-zinc-100"
            >
              <div className={`w-2 h-2 rounded-full ${stat.color}`} />
              <span className="text-sm font-medium text-zinc-900">{stat.value}</span>
              <span className="text-sm text-zinc-500">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State or Grid */}
      {!candidates || candidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-6 rounded-full bg-accent/10 p-6">
            <Sparkles className="h-12 w-12 text-accent" />
          </div>
          <h2 className="text-2xl font-semibold text-zinc-900 mb-2">No candidates yet</h2>
          <p className="text-zinc-500 max-w-md mb-6">
            Start discovering talent by running a search on Instagram or TikTok, or upload a CSV of profiles.
          </p>
          <div className="flex gap-3">
            <Link
              href="/discover"
              className="px-6 py-3 rounded-full bg-accent text-white font-medium hover:bg-accent/90 transition-colors"
            >
              Start Discovery
            </Link>
            <Link
              href="/upload"
              className="px-6 py-3 rounded-full border border-zinc-200 text-zinc-600 font-medium hover:bg-zinc-50 transition-colors"
            >
              Upload CSV
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Editorial Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {candidates.map((candidate: Candidate) => (
              <Link
                key={candidate.id}
                href={`/candidates/${candidate.id}`}
                className="group relative block"
              >
                {/* Image Container */}
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-100">
                  {candidate.avatar_url ? (
                    <img
                      src={candidate.avatar_url}
                      alt={candidate.name || ''}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-200">
                      <span className="text-4xl font-bold text-zinc-400">
                        {candidate.name?.charAt(0) || '?'}
                      </span>
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Score Badge */}
                  {candidate.ai_score && (
                    <div className="absolute top-3 right-3">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
                        <span className="text-sm font-bold text-zinc-900">{candidate.ai_score}</span>
                      </div>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge className={`${statusColors[candidate.status || 'discovered']} border-0 font-medium`}>
                      {candidate.status}
                    </Badge>
                  </div>

                  {/* Info Overlay on Hover */}
                  {candidate.handle && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-white/70 text-xs uppercase tracking-wider">
                        @{candidate.handle}
                      </p>
                    </div>
                  )}
                </div>

                {/* Info Below Image */}
                <div className="mt-3 space-y-2">
                  <h3 className="font-medium text-zinc-900 group-hover:text-accent transition-colors">
                    {candidate.name}
                  </h3>
                  {candidate.location && (
                    <p className="text-sm text-zinc-500">
                      {candidate.location}
                    </p>
                  )}
                  {/* Compact Dimension Scores */}
                  {(candidate.physical_potential_score || candidate.unsigned_probability_score) && (
                    <ScoreDimensions
                      physical_potential={candidate.physical_potential_score ? { score: candidate.physical_potential_score, confidence: 0, factors: [], notes: '' } : undefined}
                      unsigned_probability={candidate.unsigned_probability_score ? { score: candidate.unsigned_probability_score, confidence: 0, factors: [], notes: '' } : undefined}
                      reachability={candidate.reachability_score ? { score: candidate.reachability_score, confidence: 0, factors: [], notes: '' } : undefined}
                      engagement_health={candidate.engagement_health_score ? { score: candidate.engagement_health_score, confidence: 0, factors: [], notes: '' } : undefined}
                      vision_analyzed={candidate.vision_analyzed}
                      compact
                    />
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Load More */}
          {candidates.length >= 50 && (
            <div className="flex justify-center pt-4">
              <button className="px-8 py-3 rounded-full border border-zinc-200 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 transition-colors">
                Load More Candidates
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
