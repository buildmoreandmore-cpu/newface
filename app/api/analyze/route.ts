import { NextResponse } from 'next/server';
import { analyzeCandidate, extractDimensionScores } from '@/lib/ai/analyze';
import type { CSVCandidate, ApifyProfile } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Support both CSVCandidate and ApifyProfile formats
    const isApifyProfile = 'followersCount' in body || 'username' in body;

    let profile: CSVCandidate | ApifyProfile;
    let imageUrls: string[] = [];

    if (isApifyProfile) {
      // ApifyProfile format
      profile = {
        username: body.username || body.handle,
        fullName: body.fullName || body.name,
        biography: body.biography || body.bio || '',
        profilePicUrl: body.profilePicUrl || body.avatar_url || '',
        followersCount: body.followersCount || body.followers || 0,
        followingCount: body.followingCount || 0,
        postsCount: body.postsCount || 0,
        engagementRate: body.engagementRate || body.engagement_rate || 0,
        isVerified: body.isVerified || false,
        isBusinessAccount: body.isBusinessAccount || false,
        externalUrl: body.externalUrl || null,
        email: body.email || null,
        phone: body.phone || null,
        location: body.location || null,
        recentPosts: body.recentPosts || [],
      } as ApifyProfile;

      // Extract image URLs from recent posts
      if (body.recentPosts && Array.isArray(body.recentPosts)) {
        imageUrls = body.recentPosts
          .slice(0, 5)
          .map((p: { imageUrl?: string }) => p.imageUrl)
          .filter(Boolean);
      }
    } else {
      // CSVCandidate format
      profile = {
        name: body.name,
        handle: body.handle,
        platform: body.platform,
        bio: body.bio,
        followers: body.followers,
        engagement_rate: body.engagement_rate,
        location: body.location,
        profile_url: body.profile_url,
        avatar_url: body.avatar_url,
      } as CSVCandidate;

      // Use avatar_url as image for analysis
      if (body.avatar_url) {
        imageUrls = [body.avatar_url];
      }
    }

    // Add any explicitly provided image URLs
    if (body.image_urls && Array.isArray(body.image_urls)) {
      imageUrls = [...imageUrls, ...body.image_urls].slice(0, 5);
    }

    // Perform AI analysis with Gemini
    const { score, analysis } = await analyzeCandidate(profile, imageUrls);

    // Extract dimension scores for easy database insertion
    const dimensionScores = extractDimensionScores(analysis);

    return NextResponse.json({
      score,
      analysis,
      dimension_scores: dimensionScores,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze candidate' },
      { status: 500 }
    );
  }
}
