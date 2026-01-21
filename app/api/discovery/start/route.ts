import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ApifyClient } from 'apify-client';
import { analyzeCandidate, extractDimensionScores } from '@/lib/ai/analyze';
import type { StartDiscoveryRequest, ApifyProfile } from '@/types';

// Configure for longer timeout
export const maxDuration = 60; // 60 seconds max

function getApifyClient() {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    throw new Error('APIFY_API_TOKEN not configured');
  }
  return new ApifyClient({ token });
}

// Normalize Instagram post data to profile (hashtag scraper returns posts, not profiles)
function normalizeInstagramProfile(item: Record<string, unknown>): ApifyProfile | null {
  try {
    // Hashtag scraper returns posts with owner info
    const username = String(item.ownerUsername || item.username || '');
    if (!username) return null;

    // Get post engagement to estimate profile quality
    const likesCount = Number(item.likesCount) || 0;
    const commentsCount = Number(item.commentsCount) || 0;

    return {
      username,
      fullName: String(item.ownerFullName || username),
      biography: '', // Not available from hashtag scraper
      profilePicUrl: String(item.displayUrl || ''), // Use post image as preview
      followersCount: 0, // Not available from hashtag scraper
      followingCount: 0,
      postsCount: 0,
      engagementRate: 0,
      isVerified: false,
      isBusinessAccount: false,
      externalUrl: null,
      email: null,
      phone: null,
      location: item.locationName ? String(item.locationName) : null,
      recentPosts: [{
        id: String(item.id || ''),
        url: String(item.url || `https://instagram.com/p/${item.shortCode}`),
        imageUrl: String(item.displayUrl || ''),
        caption: String(item.caption || ''),
        likesCount,
        commentsCount,
        timestamp: String(item.timestamp || ''),
      }],
    };
  } catch {
    return null;
  }
}

// Normalize TikTok profile data
function normalizeTikTokProfile(item: Record<string, unknown>): ApifyProfile | null {
  try {
    const authorMeta = (item.authorMeta || {}) as Record<string, unknown>;
    const username = String(authorMeta.name || item.author || '');
    if (!username) return null;

    const followers = Number(authorMeta.fans || authorMeta.followers || 0);
    const likes = Number(authorMeta.heart || authorMeta.likes || 0);
    const videos = Number(authorMeta.video || authorMeta.videoCount || 1);
    const engagementRate = followers > 0 ? Math.round((likes / videos / followers) * 100 * 100) / 100 : 0;

    return {
      username,
      fullName: String(authorMeta.nickName || authorMeta.nickname || username),
      biography: String(authorMeta.signature || ''),
      profilePicUrl: String(authorMeta.avatar || ''),
      followersCount: followers,
      followingCount: Number(authorMeta.following || 0),
      postsCount: videos,
      engagementRate,
      isVerified: Boolean(authorMeta.verified),
      isBusinessAccount: false,
      externalUrl: null,
      email: null,
      phone: null,
      location: null,
      recentPosts: [],
    };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: StartDiscoveryRequest = await request.json();
    const { platform, search_type, search_query, limit = 25 } = body;

    if (!platform || !search_type || !search_query) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create job record
    const { data: job, error: jobError } = await supabase
      .from('discovery_jobs')
      .insert({
        user_id: user.id,
        platform,
        search_type,
        search_query,
        status: 'running',
      })
      .select()
      .single();

    if (jobError || !job) {
      console.error('Failed to create job:', jobError);
      return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
    }

    const client = getApifyClient();
    let profiles: ApifyProfile[] = [];

    try {
      // Run the appropriate Apify actor
      if (platform === 'instagram') {
        // Use Instagram Hashtag Scraper
        const run = await client.actor('apify/instagram-hashtag-scraper').call({
          hashtags: [search_query.replace(/^#/, '')],
          resultsLimit: Math.min(limit, 30), // Keep small for speed
        }, {
          waitSecs: 120, // Wait up to 2 minutes
        });

        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        // Extract unique profiles from posts
        const seenUsernames = new Set<string>();
        for (const item of items as Record<string, unknown>[]) {
          const profile = normalizeInstagramProfile(item);
          if (profile && !seenUsernames.has(profile.username.toLowerCase())) {
            seenUsernames.add(profile.username.toLowerCase());
            profiles.push(profile);
          }
        }
      } else {
        // Use TikTok Scraper
        const run = await client.actor('clockworks/tiktok-scraper').call({
          hashtags: [search_query.replace(/^#/, '')],
          resultsPerPage: Math.min(limit, 30),
          shouldDownloadVideos: false,
          shouldDownloadCovers: false,
        }, {
          waitSecs: 120,
        });

        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        const seenUsernames = new Set<string>();
        for (const item of items as Record<string, unknown>[]) {
          const profile = normalizeTikTokProfile(item);
          if (profile && !seenUsernames.has(profile.username.toLowerCase())) {
            seenUsernames.add(profile.username.toLowerCase());
            profiles.push(profile);
          }
        }
      }

      // Update job with found count
      await supabase
        .from('discovery_jobs')
        .update({ candidates_found: profiles.length })
        .eq('id', job.id);

      // Analyze and save profiles (limit to first 10 for speed)
      let analyzedCount = 0;
      const profilesToAnalyze = profiles.slice(0, 10);

      for (const profile of profilesToAnalyze) {
        try {
          // Check for duplicates
          const { data: existing } = await supabase
            .from('candidates')
            .select('id')
            .eq('user_id', user.id)
            .eq('handle', profile.username)
            .single();

          if (existing) continue;

          // Analyze with AI
          const { score, analysis } = await analyzeCandidate(profile);
          const dimensionScores = extractDimensionScores(analysis);

          // Save candidate
          await supabase.from('candidates').insert({
            user_id: user.id,
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
            discovery_job_id: job.id,
            ...dimensionScores,
          });

          analyzedCount++;
        } catch (err) {
          console.error(`Error processing ${profile.username}:`, err);
        }
      }

      // Mark job completed
      await supabase
        .from('discovery_jobs')
        .update({
          status: 'completed',
          candidates_found: profiles.length,
          candidates_analyzed: analyzedCount,
          completed_at: new Date().toISOString(),
        })
        .eq('id', job.id);

      return NextResponse.json({
        success: true,
        job_id: job.id,
        candidates_found: profiles.length,
        candidates_analyzed: analyzedCount,
      });

    } catch (apifyError) {
      console.error('Apify error:', apifyError);

      // Mark job as failed
      await supabase
        .from('discovery_jobs')
        .update({
          status: 'failed',
          error_message: apifyError instanceof Error ? apifyError.message : 'Scraping failed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', job.id);

      return NextResponse.json({
        success: false,
        job_id: job.id,
        error: 'Scraping failed - check Apify account/credits',
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Discovery error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Discovery failed' },
      { status: 500 }
    );
  }
}
