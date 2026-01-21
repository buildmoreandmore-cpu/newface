'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Instagram,
  Music2,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Hash,
  MapPin,
  User,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DiscoveryJob } from '@/types';

interface JobStatusProps {
  jobs: DiscoveryJob[];
  onRefresh?: () => void;
}

export function JobStatus({ jobs, onRefresh }: JobStatusProps) {
  const [now, setNow] = useState(new Date());

  // Update time every second for relative timestamps
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: DiscoveryJob['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case 'running':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            Running
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-700">
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        );
    }
  };

  const getPlatformIcon = (platform: string) => {
    return platform === 'instagram' ? (
      <Instagram className="h-4 w-4" />
    ) : (
      <Music2 className="h-4 w-4" />
    );
  };

  const getSearchTypeIcon = (type: string) => {
    switch (type) {
      case 'hashtag':
        return <Hash className="h-3 w-3" />;
      case 'location':
        return <MapPin className="h-3 w-3" />;
      case 'profile':
        return <User className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const getProgress = (job: DiscoveryJob) => {
    if (job.status === 'completed') return 100;
    if (job.status === 'failed') return 0;
    if (job.candidates_found === 0) return 10; // Starting
    if (job.candidates_analyzed === 0) return 50; // Scraping done
    return Math.min(95, 50 + (job.candidates_analyzed / job.candidates_found) * 45);
  };

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-zinc-100 p-4">
            <Clock className="h-8 w-8 text-zinc-400" />
          </div>
          <h3 className="mb-1 text-lg font-medium text-zinc-900">No discovery jobs yet</h3>
          <p className="text-sm text-zinc-500">
            Start a new discovery to find potential modeling talent
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Jobs</CardTitle>
        {onRefresh && (
          <Button variant="ghost" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="rounded-lg border border-zinc-200 p-4 transition-colors hover:border-zinc-300"
          >
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100">
                  {getPlatformIcon(job.platform)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    {getSearchTypeIcon(job.search_type)}
                    <span className="font-medium text-zinc-900">
                      {job.search_query}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {getRelativeTime(job.created_at)}
                  </p>
                </div>
              </div>
              {getStatusBadge(job.status)}
            </div>

            {/* Progress bar for running jobs */}
            {(job.status === 'running' || job.status === 'pending') && (
              <div className="mb-3">
                <Progress value={getProgress(job)} className="h-2" />
              </div>
            )}

            {/* Stats */}
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1 text-zinc-500">
                <User className="h-3 w-3" />
                <span>{job.candidates_found} found</span>
              </div>
              <div className="flex items-center gap-1 text-zinc-500">
                <CheckCircle2 className="h-3 w-3" />
                <span>{job.candidates_analyzed} analyzed</span>
              </div>
            </div>

            {/* Error message */}
            {job.status === 'failed' && job.error_message && (
              <p className="mt-2 text-sm text-red-600">{job.error_message}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
