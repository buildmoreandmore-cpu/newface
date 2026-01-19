import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import type { Candidate } from '@/types';

async function getStats(userId: string) {
  const supabase = await createClient();

  const { count: total } = await supabase
    .from('candidates')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  const { count: discovered } = await supabase
    .from('candidates')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'discovered');

  const { count: contacted } = await supabase
    .from('candidates')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('status', ['contacted', 'responded', 'meeting']);

  const { count: signed } = await supabase
    .from('candidates')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'signed');

  return {
    total: total || 0,
    discovered: discovered || 0,
    contacted: contacted || 0,
    signed: signed || 0,
  };
}

async function getRecentCandidates(userId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('candidates')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  return (data as Candidate[]) || [];
}

async function getTopScored(userId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('candidates')
    .select('*')
    .eq('user_id', userId)
    .not('ai_score', 'is', null)
    .order('ai_score', { ascending: false })
    .limit(5);

  return (data as Candidate[]) || [];
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [stats, recentCandidates, topScored] = await Promise.all([
    getStats(user.id),
    getRecentCandidates(user.id),
    getTopScored(user.id),
  ]);

  const statCards = [
    {
      title: 'Total Candidates',
      value: stats.total,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Discovered',
      value: stats.discovered,
      icon: Sparkles,
      color: 'text-gold',
      bgColor: 'bg-gold/10',
    },
    {
      title: 'In Pipeline',
      value: stats.contacted,
      icon: Clock,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Signed',
      value: stats.signed,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your talent discovery pipeline
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="flex items-center gap-4 p-6">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bgColor}`}
              >
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Candidates */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Candidates</CardTitle>
            <Link
              href="/pipeline"
              className="flex items-center gap-1 text-sm text-gold hover:text-gold-hover"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentCandidates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">No candidates yet</p>
                <Link
                  href="/upload"
                  className="mt-2 text-sm text-gold hover:text-gold-hover"
                >
                  Upload your first profiles
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentCandidates.map((candidate) => (
                  <Link
                    key={candidate.id}
                    href={`/candidates/${candidate.id}`}
                    className="flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-muted"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-gold">
                      {candidate.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{candidate.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {candidate.handle || candidate.platform || 'No handle'}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        candidate.status === 'signed'
                          ? 'bg-green-500/10 text-green-500'
                          : candidate.status === 'rejected'
                          ? 'bg-destructive/10 text-destructive'
                          : ''
                      }
                    >
                      {candidate.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Scored */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Top AI Scores</CardTitle>
            <TrendingUp className="h-5 w-5 text-gold" />
          </CardHeader>
          <CardContent>
            {topScored.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Sparkles className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">No scored candidates yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload profiles to get AI analysis
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {topScored.map((candidate, index) => (
                  <Link
                    key={candidate.id}
                    href={`/candidates/${candidate.id}`}
                    className="flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-muted"
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                        index === 0
                          ? 'bg-gold text-background'
                          : index === 1
                          ? 'bg-zinc-400 text-background'
                          : index === 2
                          ? 'bg-amber-700 text-background'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{candidate.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {candidate.location || 'Unknown location'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gold">
                        {candidate.ai_score}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        AI Score
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
