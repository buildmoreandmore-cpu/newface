import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDatasetItems, processApifyData } from '@/lib/apify/client';
import { analyzeCandidate, extractDimensionScores } from '@/lib/ai/analyze';

// Webhook endpoint for Apify to notify when scraping completes
// This is an alternative to polling - Apify can call this when done
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Apify webhook payload structure
    const {
      eventType,
      resource: { id: runId, defaultDatasetId, status: runStatus },
    } = body;

    // Only process ACTOR.RUN.SUCCEEDED events
    if (eventType !== 'ACTOR.RUN.SUCCEEDED' || runStatus !== 'SUCCEEDED') {
      return NextResponse.json({ received: true, processed: false });
    }

    const supabase = await createClient();

    // Find the discovery job associated with this run
    const { data: job, error: jobError } = await supabase
      .from('discovery_jobs')
      .select('*')
      .eq('apify_run_id', runId)
      .single();

    if (jobError || !job) {
      console.error('Job not found for run:', runId);
      return NextResponse.json(
        { error: 'Discovery job not found' },
        { status: 404 }
      );
    }

    // If job is already completed or failed, skip
    if (job.status === 'completed' || job.status === 'failed') {
      return NextResponse.json({ received: true, processed: false });
    }

    // Get scraped data from dataset
    const items = await getDatasetItems(defaultDatasetId);

    // Process and normalize profiles
    const profiles = processApifyData(
      items as Record<string, unknown>[],
      job.platform as 'instagram' | 'tiktok'
    );

    // Update candidates found count
    await supabase
      .from('discovery_jobs')
      .update({ candidates_found: profiles.length })
      .eq('id', job.id);

    // Analyze and save each profile
    let analyzedCount = 0;
    for (const profile of profiles) {
      try {
        // Check if candidate already exists
        const { data: existing } = await supabase
          .from('candidates')
          .select('id')
          .eq('user_id', job.user_id)
          .eq('handle', profile.username)
          .eq('platform', job.platform)
          .single();

        if (existing) {
          continue;
        }

        // Analyze with AI
        const { score, analysis } = await analyzeCandidate(profile);
        const dimensionScores = extractDimensionScores(analysis);

        // Save candidate
        await supabase.from('candidates').insert({
          user_id: job.user_id,
          name: profile.fullName || profile.username,
          handle: profile.username,
          platform: job.platform,
          profile_url: job.platform === 'instagram'
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
          discovery_job_id: job.id,
          ...dimensionScores,
        });

        analyzedCount++;

        // Update progress periodically
        if (analyzedCount % 5 === 0) {
          await supabase
            .from('discovery_jobs')
            .update({ candidates_analyzed: analyzedCount })
            .eq('id', job.id);
        }

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
      .eq('id', job.id);

    return NextResponse.json({
      success: true,
      job_id: job.id,
      candidates_found: profiles.length,
      candidates_analyzed: analyzedCount,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Verify webhook signature (optional security measure)
export async function GET() {
  // Health check endpoint for webhook verification
  return NextResponse.json({ status: 'ok', endpoint: 'apify-webhook' });
}
