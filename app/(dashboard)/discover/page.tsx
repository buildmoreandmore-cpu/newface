'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DiscoveryForm } from '@/components/discovery/DiscoveryForm';
import { JobStatus } from '@/components/discovery/JobStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Users, Eye } from 'lucide-react';
import type { DiscoveryJob, DiscoveryPlatform, SearchType } from '@/types';

export default function DiscoverPage() {
  const [jobs, setJobs] = useState<DiscoveryJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Fetch existing jobs
  const fetchJobs = useCallback(async () => {
    const { data, error } = await supabase
      .from('discovery_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching jobs:', error);
      return;
    }

    setJobs(data || []);
  }, [supabase]);

  useEffect(() => {
    fetchJobs();

    // Set up real-time subscription for job updates
    const channel = supabase
      .channel('discovery_jobs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'discovery_jobs',
        },
        () => {
          fetchJobs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchJobs, supabase]);

  // Start a new discovery job
  const handleStartDiscovery = async (data: {
    platform: DiscoveryPlatform;
    search_type: SearchType;
    search_query: string;
    limit: number;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/discovery/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start discovery');
      }

      const result = await response.json();

      // Refresh jobs list
      await fetchJobs();

      // Optionally navigate to view the job
      if (result.job_id) {
        router.push(`/discover?job=${result.job_id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start discovery');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate stats
  const totalDiscovered = jobs.reduce((sum, job) => sum + job.candidates_found, 0);
  const totalAnalyzed = jobs.reduce((sum, job) => sum + job.candidates_analyzed, 0);
  const runningJobs = jobs.filter((job) => job.status === 'running').length;
  const completedJobs = jobs.filter((job) => job.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Discover Talent</h1>
        <p className="mt-1 text-zinc-500">
          Automatically find and analyze potential modeling talent across social media
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900">{totalDiscovered}</p>
              <p className="text-sm text-zinc-500">Profiles Found</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <Sparkles className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900">{totalAnalyzed}</p>
              <p className="text-sm text-zinc-500">AI Analyzed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900">{runningJobs}</p>
              <p className="text-sm text-zinc-500">Running Jobs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900">{completedJobs}</p>
              <p className="text-sm text-zinc-500">Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Discovery Form */}
        <DiscoveryForm onSubmit={handleStartDiscovery} isLoading={isLoading} />

        {/* Job Status */}
        <JobStatus jobs={jobs} onRefresh={fetchJobs} />
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Suggested Hashtags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Suggested Searches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              'newface',
              'modellife',
              'aspiringmodel',
              'modelsearch',
              'freshface',
              'undiscovered',
              'nextmodel',
              'modelscout',
              'streetstyle',
              'editorialmodel',
              'fashionweek',
              'castingcall',
            ].map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer bg-zinc-100 hover:bg-accent/10 hover:text-accent"
                onClick={() => {
                  handleStartDiscovery({
                    platform: 'instagram',
                    search_type: 'hashtag',
                    search_query: tag,
                    limit: 50,
                  });
                }}
              >
                #{tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
