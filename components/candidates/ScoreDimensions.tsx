'use client';

import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Sparkles, UserSearch, Mail, Heart, Eye, Info } from 'lucide-react';
import type { DimensionScore } from '@/types';

interface ScoreDimensionsProps {
  physical_potential?: DimensionScore | null;
  unsigned_probability?: DimensionScore | null;
  reachability?: DimensionScore | null;
  engagement_health?: DimensionScore | null;
  vision_analyzed?: boolean;
  compact?: boolean;
}

const dimensionConfig = {
  physical_potential: {
    label: 'Physical Potential',
    shortLabel: 'Physical',
    icon: Sparkles,
    weight: '35%',
    description: 'Modeling potential based on visual presentation and photogenic qualities',
    colorClass: 'text-purple-600',
    bgClass: 'bg-purple-100',
    progressClass: 'bg-purple-500',
  },
  unsigned_probability: {
    label: 'Unsigned Probability',
    shortLabel: 'Unsigned',
    icon: UserSearch,
    weight: '25%',
    description: 'Likelihood that the candidate is not currently signed to an agency',
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-100',
    progressClass: 'bg-blue-500',
  },
  reachability: {
    label: 'Reachability',
    shortLabel: 'Reach',
    icon: Mail,
    weight: '20%',
    description: 'How easy it is to contact and potentially recruit this candidate',
    colorClass: 'text-amber-600',
    bgClass: 'bg-amber-100',
    progressClass: 'bg-amber-500',
  },
  engagement_health: {
    label: 'Engagement Health',
    shortLabel: 'Engagement',
    icon: Heart,
    weight: '20%',
    description: 'Quality and authenticity of their social media audience',
    colorClass: 'text-emerald-600',
    bgClass: 'bg-emerald-100',
    progressClass: 'bg-emerald-500',
  },
};

function getScoreColor(score: number) {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-amber-600';
  return 'text-red-600';
}

function getProgressColor(score: number) {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-blue-500';
  if (score >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}

export function ScoreDimensions({
  physical_potential,
  unsigned_probability,
  reachability,
  engagement_health,
  vision_analyzed = false,
  compact = false,
}: ScoreDimensionsProps) {
  const dimensions = [
    { key: 'physical_potential', data: physical_potential },
    { key: 'unsigned_probability', data: unsigned_probability },
    { key: 'reachability', data: reachability },
    { key: 'engagement_health', data: engagement_health },
  ] as const;

  if (compact) {
    // Compact view for cards/lists
    return (
      <div className="flex flex-wrap gap-1.5">
        {dimensions.map(({ key, data }) => {
          const config = dimensionConfig[key];
          const score = data?.score ?? 0;
          const Icon = config.icon;

          return (
            <TooltipProvider key={key}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.bgClass} ${config.colorClass}`}
                  >
                    <Icon className="h-3 w-3" />
                    <span>{score}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{config.label}</p>
                  <p className="text-xs text-zinc-400">{config.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
        {vision_analyzed && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-600">
                  <Eye className="h-3 w-3" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>AI Vision Analyzed</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  }

  // Full view for detail pages
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">
          AI Analysis Dimensions
        </h3>
        {vision_analyzed && (
          <div className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
            <Eye className="h-3 w-3" />
            Vision Analyzed
          </div>
        )}
      </div>

      <div className="space-y-4">
        {dimensions.map(({ key, data }) => {
          const config = dimensionConfig[key];
          const score = data?.score ?? 0;
          const confidence = data?.confidence ?? 0;
          const Icon = config.icon;

          return (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.bgClass}`}>
                    <Icon className={`h-4 w-4 ${config.colorClass}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-zinc-900">
                        {config.label}
                      </span>
                      <span className="text-xs text-zinc-400">
                        ({config.weight})
                      </span>
                    </div>
                    {data?.notes && (
                      <p className="text-xs text-zinc-500 max-w-xs truncate">
                        {data.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold ${getScoreColor(score)}`}>
                    {score}
                  </span>
                  <span className="text-xs text-zinc-400 ml-1">/ 100</span>
                  {confidence > 0 && (
                    <p className="text-xs text-zinc-400">
                      {confidence}% confidence
                    </p>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressColor(score)}`}
                  style={{ width: `${score}%` }}
                />
              </div>

              {/* Factors */}
              {data?.factors && data.factors.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {data.factors.slice(0, 3).map((factor, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600"
                    >
                      {factor}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Mini badge version for extreme compact display
export function DimensionBadge({
  label,
  score,
  type,
}: {
  label: string;
  score: number;
  type: keyof typeof dimensionConfig;
}) {
  const config = dimensionConfig[type];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium ${config.bgClass} ${config.colorClass}`}
          >
            <Icon className="h-3 w-3" />
            {score}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.label}: {score}/100</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
