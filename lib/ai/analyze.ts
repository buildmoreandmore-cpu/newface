import { generateWithVision, generateText, fetchImageAsBase64 } from './gemini-client';
import type { AIAnalysis, CSVCandidate, ApifyProfile, DimensionScore } from '@/types';

// Scoring weights for overall score calculation
const WEIGHTS = {
  physical_potential: 0.35,
  unsigned_probability: 0.25,
  reachability: 0.20,
  engagement_health: 0.20,
};

// Build analysis prompt
function buildAnalysisPrompt(
  profile: CSVCandidate | ApifyProfile,
  hasImages: boolean
): string {
  const isApifyProfile = 'followersCount' in profile;

  const profileInfo = isApifyProfile
    ? `
Profile Information:
- Name: ${profile.fullName || profile.username}
- Username: @${profile.username}
- Bio: ${profile.biography || 'Not provided'}
- Followers: ${profile.followersCount?.toLocaleString() || 'Unknown'}
- Following: ${profile.followingCount?.toLocaleString() || 'Unknown'}
- Posts: ${profile.postsCount?.toLocaleString() || 'Unknown'}
- Engagement Rate: ${profile.engagementRate ? `${profile.engagementRate}%` : 'Unknown'}
- Verified: ${profile.isVerified ? 'Yes' : 'No'}
- Business Account: ${profile.isBusinessAccount ? 'Yes' : 'No'}
- Location: ${profile.location || 'Unknown'}
- External URL: ${profile.externalUrl || 'None'}
- Contact Email: ${profile.email || 'Not available'}
`
    : `
Profile Information:
- Name: ${profile.name}
- Platform: ${profile.platform || 'Unknown'}
- Handle: ${profile.handle || 'Unknown'}
- Bio: ${profile.bio || 'Not provided'}
- Followers: ${profile.followers?.toLocaleString() || 'Unknown'}
- Engagement Rate: ${profile.engagement_rate ? `${profile.engagement_rate}%` : 'Unknown'}
- Location: ${profile.location || 'Unknown'}
`;

  const imageContext = hasImages
    ? `\nI have also provided profile/content images for visual analysis. Please analyze the visual elements including facial features, body proportions, styling, photography quality, and overall aesthetic appeal.`
    : `\nNo images are available for visual analysis, so focus on the profile data.`;

  return `You are an expert talent scout for a premium modeling agency. Your task is to analyze this social media profile and provide a comprehensive assessment using our 4-dimension scoring system.

${profileInfo}
${imageContext}

Analyze this candidate across 4 key dimensions:

1. **PHYSICAL POTENTIAL (35% weight)** - Assess modeling potential based on:
   - Facial features, symmetry, and photogenic qualities (if images provided)
   - Body proportions and aesthetic appeal (if visible)
   - Overall visual presentation and styling
   - Photography quality in their content
   - Unique look or distinctive features
   ${!hasImages ? '- Without images, estimate based on engagement patterns and bio signals' : ''}

2. **UNSIGNED PROBABILITY (25% weight)** - Likelihood they are NOT already signed:
   - No management/agency mentions in bio
   - Account size (micro-influencers more likely unsigned)
   - No professional booking contact info
   - Personal email vs agency email
   - Content style (amateur vs professionally managed)
   - High score = likely unsigned and available

3. **REACHABILITY (20% weight)** - How easy to contact/recruit:
   - Public contact information (email, website)
   - Response indicators (engagement with comments)
   - Account accessibility (public vs private)
   - Location accessibility (major city vs remote)
   - Platform activity level
   - Professional network signals

4. **ENGAGEMENT HEALTH (20% weight)** - Quality of their audience:
   - Engagement rate relative to follower count
   - Comment quality and authenticity
   - Follower growth patterns (organic vs bought)
   - Content consistency
   - Audience authenticity signals

Provide your analysis in the following JSON format (return ONLY valid JSON, no markdown code blocks):
{
  "overall_score": <1-100 weighted average>,
  "overall_assessment": "2-3 sentence summary of the candidate's potential",
  "strengths": ["strength1", "strength2", "strength3"],
  "potential_categories": ["category1", "category2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "vision_analyzed": ${hasImages},
  "physical_potential": {
    "score": <1-100>,
    "confidence": <1-100>,
    "factors": ["factor1", "factor2", "factor3"],
    "notes": "Brief explanation of score"
  },
  "unsigned_probability": {
    "score": <1-100>,
    "confidence": <1-100>,
    "factors": ["factor1", "factor2"],
    "notes": "Brief explanation - high score means likely unsigned"
  },
  "reachability": {
    "score": <1-100>,
    "confidence": <1-100>,
    "factors": ["factor1", "factor2"],
    "notes": "Brief explanation of contact accessibility"
  },
  "engagement_health": {
    "score": <1-100>,
    "confidence": <1-100>,
    "factors": ["factor1", "factor2"],
    "notes": "Brief explanation of audience quality"
  }
}

Categories can include: "High Fashion", "Commercial", "Editorial", "Fitness", "Plus Size", "Petite", "Influencer", "Lifestyle", "Beauty", "Streetwear", "Catalog", "Parts Model"

Return ONLY valid JSON, no additional text or markdown.`;
}

// Parse AI response to AIAnalysis
function parseAnalysisResponse(content: string): AIAnalysis {
  // Clean up response - remove markdown code blocks if present
  let cleanContent = content.trim();
  if (cleanContent.startsWith('```json')) {
    cleanContent = cleanContent.slice(7);
  } else if (cleanContent.startsWith('```')) {
    cleanContent = cleanContent.slice(3);
  }
  if (cleanContent.endsWith('```')) {
    cleanContent = cleanContent.slice(0, -3);
  }
  cleanContent = cleanContent.trim();

  const parsed = JSON.parse(cleanContent);
  return parsed as AIAnalysis;
}

// Calculate weighted overall score
function calculateWeightedScore(analysis: AIAnalysis): number {
  const physicalScore = analysis.physical_potential?.score || 50;
  const unsignedScore = analysis.unsigned_probability?.score || 50;
  const reachabilityScore = analysis.reachability?.score || 50;
  const engagementScore = analysis.engagement_health?.score || 50;

  const weightedScore =
    physicalScore * WEIGHTS.physical_potential +
    unsignedScore * WEIGHTS.unsigned_probability +
    reachabilityScore * WEIGHTS.reachability +
    engagementScore * WEIGHTS.engagement_health;

  return Math.round(weightedScore);
}

// Default analysis for errors
function getDefaultAnalysis(visionAnalyzed: boolean): AIAnalysis {
  const defaultDimension: DimensionScore = {
    score: 50,
    confidence: 20,
    factors: ['Insufficient data for analysis'],
    notes: 'Manual review recommended',
  };

  return {
    overall_score: 50,
    overall_assessment: 'Unable to complete full analysis. Manual review recommended.',
    strengths: ['Profile submitted for review'],
    potential_categories: ['To be determined'],
    recommendations: ['Complete profile information', 'Add professional photos'],
    vision_analyzed: visionAnalyzed,
    physical_potential: { ...defaultDimension },
    unsigned_probability: { ...defaultDimension },
    reachability: { ...defaultDimension },
    engagement_health: { ...defaultDimension },
  };
}

// Analyze a candidate (works with both CSVCandidate and ApifyProfile)
export async function analyzeCandidate(
  candidate: CSVCandidate | ApifyProfile,
  imageUrls: string[] = []
): Promise<{ score: number; analysis: AIAnalysis }> {
  try {
    // Fetch images for vision analysis
    const images: { data: string; mimeType: string }[] = [];

    // Get profile image
    const profilePicUrl = 'profilePicUrl' in candidate
      ? candidate.profilePicUrl
      : candidate.avatar_url;

    if (profilePicUrl) {
      const profileImage = await fetchImageAsBase64(profilePicUrl);
      if (profileImage) {
        images.push(profileImage);
      }
    }

    // Get additional images (from posts or provided URLs)
    const additionalUrls = [
      ...imageUrls,
      ...('recentPosts' in candidate
        ? candidate.recentPosts.slice(0, 3).map(p => p.imageUrl).filter(Boolean)
        : []),
    ];

    for (const url of additionalUrls.slice(0, 4)) {
      if (url) {
        const image = await fetchImageAsBase64(url);
        if (image) {
          images.push(image);
        }
      }
    }

    const hasImages = images.length > 0;
    const prompt = buildAnalysisPrompt(candidate, hasImages);

    // Use vision model if we have images, text model otherwise
    const response = hasImages
      ? await generateWithVision(prompt, images)
      : await generateText(prompt);

    const analysis = parseAnalysisResponse(response);

    // Ensure overall_score is calculated with our weights
    const score = calculateWeightedScore(analysis);
    analysis.overall_score = score;

    return { score, analysis };
  } catch (error) {
    console.error('AI analysis error:', error);
    const defaultAnalysis = getDefaultAnalysis(false);
    return {
      score: 50,
      analysis: defaultAnalysis,
    };
  }
}

// Legacy function for backwards compatibility with CSVCandidate
export async function analyzeCandidateFromCSV(
  candidate: CSVCandidate
): Promise<{ score: number; analysis: AIAnalysis }> {
  return analyzeCandidate(candidate);
}

// Analyze batch of candidates
export async function analyzeBatch(
  candidates: (CSVCandidate | ApifyProfile)[]
): Promise<Map<string, { score: number; analysis: AIAnalysis }>> {
  const results = new Map<string, { score: number; analysis: AIAnalysis }>();

  // Process in batches of 3 to avoid rate limiting (Gemini is faster but has limits)
  const batchSize = 3;
  for (let i = 0; i < candidates.length; i += batchSize) {
    const batch = candidates.slice(i, i + batchSize);
    const promises = batch.map(async (candidate) => {
      const name = 'fullName' in candidate
        ? candidate.fullName || candidate.username
        : candidate.name;
      const result = await analyzeCandidate(candidate);
      return { name, result };
    });

    const batchResults = await Promise.all(promises);
    batchResults.forEach(({ name, result }) => {
      results.set(name, result);
    });

    // Small delay between batches to avoid rate limits
    if (i + batchSize < candidates.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return results;
}

// Export dimension extraction helpers
export function extractDimensionScores(analysis: AIAnalysis) {
  return {
    physical_potential_score: analysis.physical_potential?.score || null,
    unsigned_probability_score: analysis.unsigned_probability?.score || null,
    reachability_score: analysis.reachability?.score || null,
    engagement_health_score: analysis.engagement_health?.score || null,
    vision_analyzed: analysis.vision_analyzed || false,
  };
}
