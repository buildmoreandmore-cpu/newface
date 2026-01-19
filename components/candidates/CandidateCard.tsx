'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Instagram,
  Linkedin,
  Users,
  TrendingUp,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import type { Candidate, CandidateStatus } from '@/types';

const statusColors: Record<CandidateStatus, string> = {
  discovered: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  contacted: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  responded: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  meeting: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  signed: 'bg-green-500/10 text-green-500 border-green-500/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
};

const platformIcons = {
  instagram: Instagram,
  tiktok: ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
    </svg>
  ),
  linkedin: Linkedin,
  other: Users,
};

interface CandidateCardProps {
  candidate: Candidate;
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  const PlatformIcon =
    platformIcons[candidate.platform || 'other'] || platformIcons.other;

  return (
    <Link href={`/candidates/${candidate.id}`}>
      <Card className="group cursor-pointer transition-all hover:border-gold/50 hover:shadow-lg hover:shadow-gold/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14 border-2 border-border">
              <AvatarImage src={candidate.avatar_url || undefined} />
              <AvatarFallback className="bg-gold/10 text-gold text-lg">
                {candidate.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold truncate group-hover:text-gold transition-colors">
                    {candidate.name}
                  </h3>
                  {candidate.handle && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <PlatformIcon className="h-3 w-3" />
                      <span className="truncate">@{candidate.handle}</span>
                    </div>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={statusColors[candidate.status]}
                >
                  {candidate.status}
                </Badge>
              </div>

              {candidate.bio && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {candidate.bio}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                {candidate.followers && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{candidate.followers.toLocaleString()}</span>
                  </div>
                )}
                {candidate.engagement_rate && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span>{candidate.engagement_rate}%</span>
                  </div>
                )}
                {candidate.location && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{candidate.location}</span>
                  </div>
                )}
              </div>
            </div>

            {candidate.ai_score !== null && (
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${
                    candidate.ai_score >= 80
                      ? 'text-green-500'
                      : candidate.ai_score >= 60
                      ? 'text-gold'
                      : candidate.ai_score >= 40
                      ? 'text-orange-500'
                      : 'text-destructive'
                  }`}
                >
                  {candidate.ai_score}
                </div>
                <div className="text-xs text-muted-foreground">AI Score</div>
              </div>
            )}
          </div>

          {candidate.profile_url && (
            <div className="mt-4 pt-4 border-t border-border">
              <a
                href={candidate.profile_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-gold hover:text-gold-hover"
                onClick={(e) => e.stopPropagation()}
              >
                View Profile
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
