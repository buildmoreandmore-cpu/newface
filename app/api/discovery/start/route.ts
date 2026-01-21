import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  scrapeInstagramHashtag,
  scrapeTikTokHashtag,
  scrapeInstagramProfiles,
  getDatasetItems,
  waitForRun,
  processApifyData,
} from '@/lib/apify/client';
import { analyzeCandidate, extractDimensionScores } from '@/lib/ai/analyze';
import type { StartDiscoveryRequest, ApifyProfile } from '@/types';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: StartDiscoveryRequest = await request.json();
    const { platform, search_type, search_query, limit = 50 } = body;

    // Validate input
    if (!platform || !search_type || !search_query) {
      return NextResponse.json(
        { error: 'Missing required fields: platform, search_type, search_query' },
        { status: 400 }
      );
    }

    // Create discovery job record
    const { data: job, error: jobError } = await supabase
      .from('discovery_jobs')
      .insert({
        user_id: user.id,
        platform,
        search_type,
        search_query,
        status: 'pending',
      })
      .select()
      .single();

    if (jobError || !job) {
      console.error('Failed to create job:', jobError);
      return NextResponse.json(
        { error: 'Failed to create discovery job' },
        { status: 500 }
      );
    }

    // Start async processing
    processDiscoveryJob(job.id, user.id, platform, search_type, search_query, limit);

    return NextResponse.json({
      success: true,
      job_id: job.id,
      message: 'Discovery job started',
    });
  } catch (error) {
    console.error('Discovery start error:', error);
    return NextResponse.json(
      { error: 'Failed to start discovery' },
      { status: 500 }
    );
  }
}

// Async function to process discovery job
async function processDiscoveryJob(
  jobId: string,
  userId: string,
  platform: 'instagram' | 'tiktok',
  searchType: string,
  searchQuery: string,
  limit: number
) {
  const supabase = await createClient();

  try {
    // Update job status to running
    await supabase
      .from('discovery_jobs')
      .update({ status: 'running' })
      .eq('id', jobId);

    // Start scraping based on platform and search type
    let runResult: { runId: string; datasetId: string };

    if (platform === 'instagram') {
      if (searchType === 'profile') {
        const usernames = searchQuery.split(',').map((u) => u.trim());
        runResult = await scrapeInstagramProfiles(usernames);
      } else {
        runResult = await scrapeInstagramHashtag(searchQuery, limit);
      }
    } else {
      runResult = await scrapeTikTokHashtag(searchQuery, limit);
    }

    // Update job with Apify run ID
    await supabase
      .from('discovery_jobs')
      .update({ apify_run_id: runResult.runId })
      .eq('id', jobId);

    // Wait for Apify run to complete
    await waitForRun(runResult.runId);

    // Get scraped data
    const items = await getDatasetItems(runResult.datasetId);

    // Process and normalize profiles
    const profiles = processApifyData(
      items as Record<string, unknown>[],
      platform
    );

    // Update candidates found count
    await supabase
      .from('discovery_jobs')
      .update({ candidates_found: profiles.length })
      .eq('id', jobId);

    // Analyze and save each profile
    let analyzedCount = 0;
    for (const profile of profiles) {
      try {
        // Check if candidate already exists
        const { data: existing } = await supabase
          .from('candidates')
          .select('id')
          .eq('user_id', userId)
          .eq('handle', profile.username)
          .eq('platform', platform)
          .single();

        if (existing) {
          // Skip duplicates
          continue;
        }

        // Analyze with AI
        const { score, analysis } = await analyzeCandidate(profile);
        const dimensionScores = extractDimensionScores(analysis);

        // Save candidate
        await supabase.from('candidates').insert({
          user_id: userId,
          name: profile.fullName || profile.username,
          handle: profile.username,
          platform,
          profile_url: platform === 'instagram'
            ? `https://instagram.com/${profile.username}`
            : `https://tiktok.com/@${profile.username}`,
          avatar_url: profile.profilePicUrl,
          bio: profile.biography,
          followers: profile.followersCount,
          engagement_rate: profile.engagementRate,
          location: profile.location,
          ai_score: score,
          ai_analysis: analysis,
          status: 'discovered',
          discovery_job_id: jobId,
          ...dimensionScores,
        });

        analyzedCount++;

        // Update progress
        await supabase
          .from('discovery_jobs')
          .update({ candidates_analyzed: analyzedCount })
          .eq('id', jobId);

        // Small delay to avoid rate limits
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (profileError) {
        console.error(`Error processing profile ${profile.username}:`, profileError);
      }
    }

    // Mark job as completed
    await supabase
      .from('discovery_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        candidates_analyzed: analyzedCount,
      })
      .eq('id', jobId);
  } catch (error) {
    console.error('Discovery job error:', error);

    // Mark job as failed
    await supabase
      .from('discovery_jobs')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId);
  }
}
