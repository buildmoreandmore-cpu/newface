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

// Demo data for preview
const demoStats = {
  total: 47,
  discovered: 28,
  contacted: 12,
  signed: 7,
};

const demoCandidates: Partial<Candidate>[] = [
  {
    id: '1',
    name: 'Sofia Andersson',
    handle: 'sofia.model',
    platform: 'instagram',
    status: 'discovered',
    ai_score: 94,
    location: 'Stockholm, Sweden',
  },
  {
    id: '2',
    name: 'Kai Chen',
    handle: 'kaichen_',
    platform: 'tiktok',
    status: 'contacted',
    ai_score: 91,
    location: 'Shanghai, China',
  },
  {
    id: '3',
    name: 'Amara Okonkwo',
    handle: 'amarao',
    platform: 'instagram',
    status: 'meeting',
    ai_score: 89,
    location: 'Lagos, Nigeria',
  },
  {
    id: '4',
    name: 'Lucas Moreau',
    handle: 'lucasm',
    platform: 'instagram',
    status: 'signed',
    ai_score: 87,
    location: 'Paris, France',
  },
  {
    id: '5',
    name: 'Emma Williams',
    handle: 'emmaw_model',
    platform: 'tiktok',
    status: 'discovered',
    ai_score: 85,
    location: 'London, UK',
  },
];

export default function DashboardPage() {
  const stats = demoStats;
  const recentCandidates = demoCandidates;
  const topScored = [...demoCandidates].sort((a, b) => (b.ai_score || 0) - (a.ai_score || 0));

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
      color: 'text-accent',
      bgColor: 'bg-accent/10',
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
              className="flex items-center gap-1 text-sm text-accent hover:opacity-80"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCandidates.map((candidate) => (
                <Link
                  key={candidate.id}
                  href={`/candidates/${candidate.id}`}
                  className="flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-muted"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                    {candidate.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{candidate.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      @{candidate.handle}
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
          </CardContent>
        </Card>

        {/* Top Scored */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Top AI Scores</CardTitle>
            <TrendingUp className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
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
                        ? 'bg-accent text-white'
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
                      {candidate.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-accent">
                      {candidate.ai_score}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      AI Score
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
