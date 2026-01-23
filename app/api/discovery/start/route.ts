import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ApifyClient } from 'apify-client';
import { analyzeCandidate, analyzeForStreetCasting, extractDimensionScores, extractStreetCastingScores } from '@/lib/ai/analyze';
import { proxyImageToStorage } from '@/lib/storage/image-proxy';
import type {
  EnhancedDiscoveryRequest,
  ApifyProfile,
  DiscoveryPlatform,
  StreetCastingFilters,
} from '@/types';

// Configure for longer timeout
export const maxDuration = 120; // 2 minutes for parallel operations

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

// Check if profile shows obvious signs of being already signed
function isLikelySignedModel(profile: ApifyProfile): boolean {
  const bio = (profile.biography || '').toLowerCase();
  const fullName = (profile.fullName || '').toLowerCase();

  // Agency/management signals
  const agencySignals = [
    'model at',
    'model @',
    'signed to',
    'signed with',
    'represented by',
    'management:',
    'mgmt:',
    'agency:',
    '@models',
    '@mgmt',
    '@management',
    '@agency',
    'booking:',
    'bookings:',
    'mother agency',
    'img models',
    'elite model',
    'wilhelmina',
    'ford models',
    'next models',
    'storm models',
  ];

  // Professional model signals in bio
  const proSignals = [
    'fashion model',
    'commercial model',
    'runway model',
    'signed model',
    'professional model',
    'international model',
    'top model',
    'supermodel',
  ];

  // Check for agency mentions
  for (const signal of agencySignals) {
    if (bio.includes(signal)) return true;
  }

  // Check for professional model self-identification
  for (const signal of proSignals) {
    if (bio.includes(signal)) return true;
  }

  // Check for modeling agency email patterns
  const emailPatterns = [
    /\w+@\w*model\w*\.(com|co|agency)/i,
    /\w+@\w*mgmt\w*\.(com|co)/i,
    /\w+@\w*talent\w*\.(com|co)/i,
  ];
  for (const pattern of emailPatterns) {
    if (pattern.test(bio)) return true;
  }

  // Check for professional website links
  if (bio.includes('models.com') || bio.includes('modeling.com')) return true;

  // Verified accounts are usually already established
  if (profile.isVerified) return true;

  return false;
}

// Apply filters to scraped profiles
function applyFilters(
  profiles: ApifyProfile[],
  filters: StreetCastingFilters | undefined
): ApifyProfile[] {
  // Always filter out obviously signed models for street casting
  let filtered = profiles.filter((profile) => !isLikelySignedModel(profile));

  if (!filters) return filtered;

  return filtered.filter((profile) => {
    // Filter by follower range (if we have follower data)
    if (profile.followersCount > 0) {
      const [minFollowers, maxFollowers] = filters.followerRange;
      if (profile.followersCount < minFollowers || profile.followersCount > maxFollowers) {
        return false;
      }
    }

    // Filter by max engagement rate (if we have engagement data)
    if (profile.engagementRate > 0 && profile.engagementRate > filters.maxEngagementRate) {
      return false;
    }

    // Filter by cities (if specified and we have location data)
    if (filters.cities.length > 0 && profile.location) {
      const locationLower = profile.location.toLowerCase();
      const cityMatches = filters.cities.some((city) => {
        const cityPatterns: Record<string, string[]> = {
          NYC: ['new york', 'nyc', 'brooklyn', 'manhattan', 'queens', 'bronx'],
          LA: ['los angeles', 'la', 'hollywood', 'beverly hills', 'santa monica'],
          Chicago: ['chicago', 'chi-town'],
          Atlanta: ['atlanta', 'atl'],
        };
        return cityPatterns[city]?.some((pattern) => locationLower.includes(pattern));
      });
      if (!cityMatches) return false;
    }

    return true;
  });
}

// Scrape a single platform
async function scrapeHashtags(
  client: ApifyClient,
  platform: DiscoveryPlatform,
  hashtags: string[],
  limit: number
): Promise<ApifyProfile[]> {
  const profiles: ApifyProfile[] = [];
  const seenUsernames = new Set<string>();

  // Process each hashtag
  for (const hashtag of hashtags) {
    const cleanHashtag = hashtag.replace(/^#/, '');

    try {
      if (platform === 'instagram') {
        const run = await client.actor('apify/instagram-hashtag-scraper').call({
          hashtags: [cleanHashtag],
          resultsLimit: Math.min(Math.ceil(limit / hashtags.length), 30),
        }, {
          waitSecs: 120,
        });

        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        for (const item of items as Record<string, unknown>[]) {
          const profile = normalizeInstagramProfile(item);
          if (profile && !seenUsernames.has(profile.username.toLowerCase())) {
            seenUsernames.add(profile.username.toLowerCase());
            profiles.push(profile);
          }
        }
      } else {
        const run = await client.actor('clockworks/tiktok-scraper').call({
          hashtags: [cleanHashtag],
          resultsPerPage: Math.min(Math.ceil(limit / hashtags.length), 30),
          shouldDownloadVideos: false,
          shouldDownloadCovers: false,
        }, {
          waitSecs: 120,
        });

        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        for (const item of items as Record<string, unknown>[]) {
          const profile = normalizeTikTokProfile(item);
          if (profile && !seenUsernames.has(profile.username.toLowerCase())) {
            seenUsernames.add(profile.username.toLowerCase());
            profiles.push(profile);
          }
        }
      }
    } catch (err) {
      console.error(`Error scraping ${platform} hashtag #${cleanHashtag}:`, err);
    }
  }

  return profiles;
}

// Normalize follower profile data from Instagram profile scraper
function normalizeFollowerProfile(item: Record<string, unknown>): ApifyProfile | null {
  try {
    const username = String(item.username || '');
    if (!username) return null;

    const followersCount = Number(item.followersCount || item.followers || 0);
    const followingCount = Number(item.followingCount || item.following || 0);
    const postsCount = Number(item.postsCount || item.posts || 0);

    // Calculate engagement rate if we have the data
    let engagementRate = 0;
    if (followersCount > 0 && postsCount > 0) {
      const avgLikes = Number(item.avgLikes || 0);
      const avgComments = Number(item.avgComments || 0);
      engagementRate = Math.round(((avgLikes + avgComments) / followersCount) * 100 * 100) / 100;
    }

    return {
      username,
      fullName: String(item.fullName || item.full_name || username),
      biography: String(item.biography || item.bio || ''),
      profilePicUrl: String(item.profilePicUrl || item.profilePicture || item.profile_pic_url || ''),
      followersCount,
      followingCount,
      postsCount,
      engagementRate,
      isVerified: Boolean(item.isVerified || item.verified),
      isBusinessAccount: Boolean(item.isBusinessAccount || item.is_business),
      externalUrl: item.externalUrl ? String(item.externalUrl) : null,
      email: item.email ? String(item.email) : null,
      phone: item.phone ? String(item.phone) : null,
      location: item.city ? String(item.city) : null,
      recentPosts: [],
    };
  } catch {
    return null;
  }
}

// Scrape followers from target accounts
async function scrapeFollowers(
  client: ApifyClient,
  platform: DiscoveryPlatform,
  usernames: string[],
  limit: number
): Promise<ApifyProfile[]> {
  const profiles: ApifyProfile[] = [];
  const seenUsernames = new Set<string>();

  // Instagram follower scraping
  if (platform === 'instagram') {
    for (const username of usernames) {
      const cleanUsername = username.replace(/^@/, '');

      try {
        // Use Instagram Profile Scraper to get followers
        const run = await client.actor('apify/instagram-profile-scraper').call({
          usernames: [cleanUsername],
          resultsLimit: Math.min(Math.ceil(limit / usernames.length), 50),
          scrapeFollowers: true,
          scrapeFollowing: false,
          scrapePosts: false,
        }, {
          waitSecs: 180,
        });

        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        // The scraper returns the profile with a followers array
        for (const item of items as Record<string, unknown>[]) {
          const followers = (item.followers || []) as Record<string, unknown>[];
          for (const follower of followers) {
            const profile = normalizeFollowerProfile(follower);
            if (profile && !seenUsernames.has(profile.username.toLowerCase())) {
              seenUsernames.add(profile.username.toLowerCase());
              profiles.push(profile);
            }
          }
        }
      } catch (err) {
        console.error(`Error scraping followers of @${cleanUsername}:`, err);
      }
    }
  } else {
    // TikTok follower scraping - use a different approach
    for (const username of usernames) {
      const cleanUsername = username.replace(/^@/, '');

      try {
        const run = await client.actor('clockworks/tiktok-scraper').call({
          profiles: [cleanUsername],
          resultsPerPage: Math.min(Math.ceil(limit / usernames.length), 30),
          shouldDownloadVideos: false,
          shouldDownloadCovers: false,
        }, {
          waitSecs: 120,
        });

        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        for (const item of items as Record<string, unknown>[]) {
          const profile = normalizeTikTokProfile(item);
          if (profile && !seenUsernames.has(profile.username.toLowerCase())) {
            seenUsernames.add(profile.username.toLowerCase());
            profiles.push(profile);
          }
        }
      } catch (err) {
        console.error(`Error scraping TikTok profile @${cleanUsername}:`, err);
      }
    }
  }

  return profiles;
}

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: EnhancedDiscoveryRequest = await request.json();
    const {
      platforms,
      search_type,
      hashtags,
      limit = 25,
      street_casting_mode = false,
      filters,
    } = body;

    // Validate required fields
    if (!platforms || !search_type || !hashtags || hashtags.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields (platforms, search_type, hashtags)' },
        { status: 400 }
      );
    }

    // Determine which platforms to search
    const platformsToSearch: DiscoveryPlatform[] =
      platforms === 'both' ? ['instagram', 'tiktok'] : [platforms];

    // Create job record with enhanced fields
    const { data: job, error: jobError } = await supabase
      .from('discovery_jobs')
      .insert({
        user_id: user.id,
        platform: platforms === 'both' ? 'instagram' : platforms, // Primary platform for backwards compat
        search_type,
        search_query: hashtags.join(', '),
        status: 'running',
        filters: filters || null,
        hashtags,
        platforms_searched: platformsToSearch,
        street_casting_mode,
      })
      .select()
      .single();

    if (jobError || !job) {
      console.error('Failed to create job:', jobError);
      return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
    }

    const client = getApifyClient();

    try {
      // Scrape platforms in parallel if searching both
      let allProfiles: ApifyProfile[] = [];

      // Choose scraping function based on search type
      const scrapeFn = search_type === 'followers' ? scrapeFollowers : scrapeHashtags;

      if (platforms === 'both') {
        const [instagramProfiles, tiktokProfiles] = await Promise.all([
          scrapeFn(client, 'instagram', hashtags, Math.ceil(limit / 2)),
          scrapeFn(client, 'tiktok', hashtags, Math.ceil(limit / 2)),
        ]);
        allProfiles = [...instagramProfiles, ...tiktokProfiles];
      } else {
        allProfiles = await scrapeFn(client, platforms, hashtags, limit);
      }

      // Deduplicate across platforms by username
      const seenUsernames = new Set<string>();
      const uniqueProfiles = allProfiles.filter((profile) => {
        const lowerUsername = profile.username.toLowerCase();
        if (seenUsernames.has(lowerUsername)) return false;
        seenUsernames.add(lowerUsername);
        return true;
      });

      // Apply filters if provided
      const filteredProfiles = applyFilters(uniqueProfiles, filters);

      // Update job with found count
      await supabase
        .from('discovery_jobs')
        .update({ candidates_found: filteredProfiles.length })
        .eq('id', job.id);

      // Analyze and save profiles - at least half of found, capped at 25
      let analyzedCount = 0;
      const analyzeLimit = Math.min(Math.max(Math.ceil(filteredProfiles.length / 2), 10), 25);
      const profilesToAnalyze = filteredProfiles.slice(0, analyzeLimit);

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

          // Determine platform for this profile
          const candidatePlatform: DiscoveryPlatform =
            profile.recentPosts.length > 0 && profile.recentPosts[0].url?.includes('instagram')
              ? 'instagram'
              : 'tiktok';

          // Proxy the image and run AI analysis in parallel
          const [imageResult, analysisResult] = await Promise.all([
            proxyImageToStorage(profile.profilePicUrl, profile.username, candidatePlatform),
            street_casting_mode
              ? analyzeForStreetCasting(profile, filters)
              : analyzeCandidate(profile),
          ]);

          const proxiedImageUrl = imageResult;
          const { score, analysis } = analysisResult;
          const dimensionScores = extractDimensionScores(analysis);

          // Extract street casting scores if in street casting mode
          const streetCastingScores = street_casting_mode
            ? extractStreetCastingScores(analysis)
            : {};

          // Save candidate with proxied image URL
          await supabase.from('candidates').insert({
            user_id: user.id,
            name: profile.fullName || profile.username,
            handle: profile.username,
            platform: candidatePlatform,
            profile_url: candidatePlatform === 'instagram'
              ? `https://instagram.com/${profile.username}`
              : `https://tiktok.com/@${profile.username}`,
            avatar_url: proxiedImageUrl || profile.profilePicUrl,
            bio: profile.biography,
            followers: profile.followersCount,
            engagement_rate: profile.engagementRate,
            location: profile.location,
            ai_score: score,
            ai_analysis: analysis,
            status: 'discovered',
            discovery_job_id: job.id,
            ...dimensionScores,
            ...streetCastingScores,
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
          candidates_found: filteredProfiles.length,
          candidates_analyzed: analyzedCount,
          completed_at: new Date().toISOString(),
        })
        .eq('id', job.id);

      return NextResponse.json({
        success: true,
        job_id: job.id,
        platforms_searched: platformsToSearch,
        hashtags_searched: hashtags,
        candidates_found: filteredProfiles.length,
        candidates_analyzed: analyzedCount,
        street_casting_mode,
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
