import { ApifyClient } from 'apify-client';
import { ApifyProfile, ApifyPost } from '@/types';

// Initialize Apify client
export function getApifyClient() {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    throw new Error('APIFY_API_TOKEN environment variable is not set');
  }
  return new ApifyClient({ token });
}

// Instagram hashtag scraper actor ID
const INSTAGRAM_HASHTAG_ACTOR = 'apify/instagram-hashtag-scraper';
const INSTAGRAM_PROFILE_ACTOR = 'apify/instagram-profile-scraper';
const TIKTOK_SCRAPER_ACTOR = 'clockworks/tiktok-scraper';

// Scrape Instagram profiles by hashtag
export async function scrapeInstagramHashtag(
  hashtag: string,
  limit = 100
): Promise<{ runId: string; datasetId: string }> {
  const client = getApifyClient();

  // Clean hashtag (remove # if present)
  const cleanHashtag = hashtag.replace(/^#/, '');

  const run = await client.actor(INSTAGRAM_HASHTAG_ACTOR).call({
    hashtags: [cleanHashtag],
    resultsLimit: limit,
    searchType: 'hashtag',
  });

  return {
    runId: run.id,
    datasetId: run.defaultDatasetId,
  };
}

// Scrape specific Instagram profiles
export async function scrapeInstagramProfiles(
  usernames: string[]
): Promise<{ runId: string; datasetId: string }> {
  const client = getApifyClient();

  // Clean usernames (remove @ if present)
  const cleanUsernames = usernames.map(u => u.replace(/^@/, ''));

  const run = await client.actor(INSTAGRAM_PROFILE_ACTOR).call({
    usernames: cleanUsernames,
  });

  return {
    runId: run.id,
    datasetId: run.defaultDatasetId,
  };
}

// Scrape TikTok profiles by hashtag
export async function scrapeTikTokHashtag(
  hashtag: string,
  limit = 100
): Promise<{ runId: string; datasetId: string }> {
  const client = getApifyClient();

  // Clean hashtag
  const cleanHashtag = hashtag.replace(/^#/, '');

  const run = await client.actor(TIKTOK_SCRAPER_ACTOR).call({
    hashtags: [cleanHashtag],
    resultsPerPage: limit,
    shouldDownloadVideos: false,
    shouldDownloadCovers: false,
  });

  return {
    runId: run.id,
    datasetId: run.defaultDatasetId,
  };
}

// Get dataset items from a completed run
export async function getDatasetItems(datasetId: string) {
  const client = getApifyClient();
  const { items } = await client.dataset(datasetId).listItems();
  return items;
}

// Check run status
export async function getRunStatus(runId: string) {
  const client = getApifyClient();
  const run = await client.run(runId).get();
  return run;
}

// Wait for run to complete (polling)
export async function waitForRun(
  runId: string,
  maxWaitMs = 300000, // 5 minutes default
  pollIntervalMs = 5000
): Promise<boolean> {
  const client = getApifyClient();
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    const run = await client.run(runId).get();

    if (run?.status === 'SUCCEEDED') {
      return true;
    }

    if (run?.status === 'FAILED' || run?.status === 'ABORTED') {
      throw new Error(`Apify run ${runId} failed with status: ${run.status}`);
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
  }

  throw new Error(`Apify run ${runId} timed out after ${maxWaitMs}ms`);
}

// Normalize Instagram data to ApifyProfile format
export function normalizeInstagramProfile(rawData: Record<string, unknown>): ApifyProfile {
  const posts = (rawData.latestPosts as Record<string, unknown>[] || []).slice(0, 10);
  const totalLikes = posts.reduce((sum, p) => sum + (Number(p.likesCount) || 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (Number(p.commentsCount) || 0), 0);
  const followers = Number(rawData.followersCount) || 0;

  // Calculate engagement rate
  const avgEngagement = posts.length > 0 ? (totalLikes + totalComments) / posts.length : 0;
  const engagementRate = followers > 0 ? (avgEngagement / followers) * 100 : 0;

  return {
    username: String(rawData.username || ''),
    fullName: String(rawData.fullName || rawData.username || ''),
    biography: String(rawData.biography || ''),
    profilePicUrl: String(rawData.profilePicUrl || rawData.profilePicUrlHD || ''),
    followersCount: followers,
    followingCount: Number(rawData.followingCount) || 0,
    postsCount: Number(rawData.postsCount) || 0,
    engagementRate: Math.round(engagementRate * 100) / 100,
    isVerified: Boolean(rawData.verified || rawData.isVerified),
    isBusinessAccount: Boolean(rawData.isBusinessAccount),
    externalUrl: rawData.externalUrl ? String(rawData.externalUrl) : null,
    email: rawData.businessEmail ? String(rawData.businessEmail) : null,
    phone: rawData.businessPhone ? String(rawData.businessPhone) : null,
    location: rawData.businessAddress ? String(rawData.businessAddress) : null,
    recentPosts: posts.map((p): ApifyPost => ({
      id: String(p.id || ''),
      url: String(p.url || ''),
      imageUrl: String(p.displayUrl || p.imageUrl || ''),
      caption: String(p.caption || ''),
      likesCount: Number(p.likesCount) || 0,
      commentsCount: Number(p.commentsCount) || 0,
      timestamp: String(p.timestamp || ''),
    })),
  };
}

// Normalize TikTok data to ApifyProfile format
export function normalizeTikTokProfile(rawData: Record<string, unknown>): ApifyProfile {
  const authorMeta = (rawData.authorMeta || {}) as Record<string, unknown>;
  const stats = (rawData.stats || authorMeta) as Record<string, unknown>;

  // TikTok engagement is typically calculated differently
  const followers = Number(stats.followerCount || stats.fans || 0);
  const likes = Number(stats.heartCount || stats.heart || 0);
  const videos = Number(stats.videoCount || stats.video || 0);
  const avgLikesPerVideo = videos > 0 ? likes / videos : 0;
  const engagementRate = followers > 0 ? (avgLikesPerVideo / followers) * 100 : 0;

  return {
    username: String(authorMeta.name || rawData.author || ''),
    fullName: String(authorMeta.nickName || authorMeta.nickname || authorMeta.name || ''),
    biography: String(authorMeta.signature || ''),
    profilePicUrl: String(authorMeta.avatar || ''),
    followersCount: followers,
    followingCount: Number(stats.followingCount || stats.following || 0),
    postsCount: videos,
    engagementRate: Math.round(engagementRate * 100) / 100,
    isVerified: Boolean(authorMeta.verified),
    isBusinessAccount: false,
    externalUrl: null,
    email: null,
    phone: null,
    location: null,
    recentPosts: [], // TikTok scraper returns videos differently
  };
}

// Process raw Apify data into normalized profiles
export function processApifyData(
  items: Record<string, unknown>[],
  platform: 'instagram' | 'tiktok'
): ApifyProfile[] {
  const profiles: ApifyProfile[] = [];
  const seenUsernames = new Set<string>();

  for (const item of items) {
    try {
      const profile = platform === 'instagram'
        ? normalizeInstagramProfile(item)
        : normalizeTikTokProfile(item);

      // Deduplicate by username
      if (profile.username && !seenUsernames.has(profile.username.toLowerCase())) {
        seenUsernames.add(profile.username.toLowerCase());
        profiles.push(profile);
      }
    } catch (error) {
      console.error('Error normalizing profile:', error);
    }
  }

  return profiles;
}
