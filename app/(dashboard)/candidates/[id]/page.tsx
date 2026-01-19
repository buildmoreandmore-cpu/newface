import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  ExternalLink,
  Instagram,
  Linkedin,
  Users,
  TrendingUp,
  MapPin,
  Sparkles,
  Target,
  ThumbsUp,
  Lightbulb,
  Star,
} from 'lucide-react';
import type { Candidate, AIAnalysis } from '@/types';
import { CandidateStatusSelect } from './CandidateStatusSelect';
import { CandidateNotes } from './CandidateNotes';

async function getCandidate(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  return data as Candidate | null;
}

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const candidate = await getCandidate(id);

  if (!candidate) {
    notFound();
  }

  const analysis = candidate.ai_analysis as AIAnalysis | null;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20 border-2 border-border">
            <AvatarImage src={candidate.avatar_url || undefined} />
            <AvatarFallback className="bg-gold/10 text-gold text-2xl">
              {candidate.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {candidate.name}
            </h1>
            {candidate.handle && (
              <div className="mt-1 flex items-center gap-2 text-muted-foreground">
                {candidate.platform === 'instagram' ? (
                  <Instagram className="h-4 w-4" />
                ) : candidate.platform === 'linkedin' ? (
                  <Linkedin className="h-4 w-4" />
                ) : (
                  <Users className="h-4 w-4" />
                )}
                <span>@{candidate.handle}</span>
              </div>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <CandidateStatusSelect
                candidateId={candidate.id}
                currentStatus={candidate.status}
              />
              {candidate.profile_url && (
                <a
                  href={candidate.profile_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm">
                    View Profile
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>

        {candidate.ai_score !== null && (
          <Card className="lg:min-w-[200px]">
            <CardContent className="flex items-center gap-4 p-6">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold ${
                  candidate.ai_score >= 80
                    ? 'bg-green-500/10 text-green-500'
                    : candidate.ai_score >= 60
                    ? 'bg-gold/10 text-gold'
                    : candidate.ai_score >= 40
                    ? 'bg-orange-500/10 text-orange-500'
                    : 'bg-destructive/10 text-destructive'
                }`}
              >
                {candidate.ai_score}
              </div>
              <div>
                <p className="font-semibold">AI Score</p>
                <p className="text-sm text-muted-foreground">
                  {candidate.ai_score >= 80
                    ? 'Excellent'
                    : candidate.ai_score >= 60
                    ? 'Good'
                    : candidate.ai_score >= 40
                    ? 'Average'
                    : 'Below Average'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        {candidate.followers && (
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Followers</p>
                <p className="text-lg font-semibold">
                  {candidate.followers.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        {candidate.engagement_rate && (
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Engagement Rate</p>
                <p className="text-lg font-semibold">
                  {candidate.engagement_rate}%
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        {candidate.location && (
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="text-lg font-semibold truncate">
                  {candidate.location}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Bio */}
          {candidate.bio && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {candidate.bio}
                </p>
              </CardContent>
            </Card>
          )}

          {/* AI Analysis */}
          {analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-gold" />
                  AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Overall Assessment */}
                <div>
                  <h4 className="mb-2 font-medium">Overall Assessment</h4>
                  <p className="text-muted-foreground">
                    {analysis.overall_assessment}
                  </p>
                </div>

                <Separator />

                {/* Scores */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Marketability</span>
                      <span className="font-medium">
                        {analysis.marketability_score}/100
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gold transition-all"
                        style={{ width: `${analysis.marketability_score}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Professionalism</span>
                      <span className="font-medium">
                        {analysis.professionalism_score}/100
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gold transition-all"
                        style={{ width: `${analysis.professionalism_score}%` }}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Strengths */}
                <div>
                  <h4 className="mb-3 flex items-center gap-2 font-medium">
                    <ThumbsUp className="h-4 w-4 text-green-500" />
                    Strengths
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.strengths.map((strength, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="bg-green-500/10 text-green-500"
                      >
                        {strength}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h4 className="mb-3 flex items-center gap-2 font-medium">
                    <Target className="h-4 w-4 text-blue-500" />
                    Potential Categories
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.potential_categories.map((category, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="bg-blue-500/10 text-blue-500"
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Unique Factor */}
                <div>
                  <h4 className="mb-2 flex items-center gap-2 font-medium">
                    <Star className="h-4 w-4 text-gold" />
                    Unique Factor
                  </h4>
                  <p className="text-muted-foreground">
                    {analysis.unique_factor}
                  </p>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="mb-3 flex items-center gap-2 font-medium">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-muted-foreground"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <CandidateNotes
            candidateId={candidate.id}
            initialNotes={candidate.notes || ''}
          />
        </div>
      </div>
    </div>
  );
}
