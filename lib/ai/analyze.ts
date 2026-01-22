import { generateWithVision, generateText, fetchImageAsBase64 } from './gemini-client';
import type {
  AIAnalysis,
  CSVCandidate,
  ApifyProfile,
  DimensionScore,
  StreetCastingFilters,
  StreetCastingAnalysis,
} from '@/types';

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

// Street Casting scoring weights
const STREET_CASTING_WEIGHTS = {
  unsigned_probability: 0.30,
  raw_potential: 0.20,
  physical_potential: 0.25,
  content_authenticity: 0.15,
  age_match: 0.10,
};

// Build street casting analysis prompt
function buildStreetCastingPrompt(
  profile: CSVCandidate | ApifyProfile,
  hasImages: boolean,
  filters?: StreetCastingFilters
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

  const ageRange = filters?.ageRange || [18, 24];
  const imageContext = hasImages
    ? `\nI have provided profile/content images. Analyze visual elements carefully for street casting potential. Look for natural beauty, unique features, and raw photogenic qualities - NOT professional model shots.`
    : `\nNo images available - focus on profile signals for undiscovered talent.`;

  return `You are a street casting scout for a high-fashion agency. Your mission is to find raw, undiscovered talent - the faces that don't call themselves models yet.

${profileInfo}
${imageContext}

**STREET CASTING PHILOSOPHY**: The best models are often found on the street, not in agencies. Look for:
- Natural, unconventional beauty over conventional attractiveness
- Unique bone structure, interesting features, striking presence
- Authenticity over polish - iPhone selfies over professional shoots
- Real people with real lives, not wannabe influencers

Analyze this candidate for STREET CASTING potential across these dimensions:

1. **ESTIMATED AGE & AGE MATCH**
   - Estimate the person's age from visual cues (if images provided)
   - Target age range: ${ageRange[0]}-${ageRange[1]}
   - Confidence in your age estimate (0-100)

2. **RAW POTENTIAL (20% weight)**
   - Natural photogenic quality without professional styling
   - Unique features that would stand out on a runway
   - The "it factor" that can't be manufactured
   - Score HIGHER for imperfect but interesting over conventionally pretty

3. **CONTENT AUTHENTICITY (15% weight)**
   - iPhone/Android photos score HIGHER than DSLR
   - Candid shots score HIGHER than posed photos
   - Personal content scores HIGHER than content creator style
   - Identify device/camera quality used
   - Low production value is GOOD for street casting

4. **UNSIGNED PROBABILITY (30% weight)** - Critical for street casting
   - No agency/management mentions
   - No "DM for bookings" or professional contact
   - Personal email vs agency email
   - Small follower count is GOOD (1K-3K ideal)
   - Low engagement rate is GOOD (indicates real person, not influencer)
   - High score = very likely available and unsigned

5. **PHYSICAL POTENTIAL (25% weight)**
   - Bone structure and facial symmetry
   - Body proportions (if visible)
   - Height indicators
   - Unique aesthetic qualities
   - Editorial vs commercial potential

6. **STREET CASTING SCORE** - Weighted composite:
   - 30% unsigned probability + 20% raw potential + 25% physical + 15% authenticity + 10% age match

Return ONLY valid JSON (no markdown):
{
  "overall_score": <1-100>,
  "overall_assessment": "2-3 sentences focusing on street casting potential",
  "strengths": ["strength1", "strength2", "strength3"],
  "potential_categories": ["category1", "category2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "vision_analyzed": ${hasImages},
  "physical_potential": {
    "score": <1-100>,
    "confidence": <1-100>,
    "factors": ["factor1", "factor2", "factor3"],
    "notes": "Brief explanation"
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
    "notes": "How accessible for outreach"
  },
  "engagement_health": {
    "score": <1-100>,
    "confidence": <1-100>,
    "factors": ["factor1", "factor2"],
    "notes": "For street casting, low engagement is often good"
  },
  "street_casting": {
    "estimated_age": <number>,
    "age_confidence": <0-100>,
    "raw_potential_score": <1-100>,
    "content_authenticity_score": <1-100>,
    "street_casting_score": <1-100 weighted composite>,
    "content_style": "<professional|semi-professional|amateur|candid>",
    "device_quality": "<dslr|mirrorless|iphone|android|unknown>",
    "authenticity_signals": ["signal1", "signal2"]
  }
}

Categories: "High Fashion", "Editorial", "Runway", "Commercial", "Streetwear", "Beauty", "Avant-garde", "New Face"`;
}

// Calculate street casting composite score
function calculateStreetCastingScore(
  analysis: AIAnalysis & { street_casting?: StreetCastingAnalysis },
  filters?: StreetCastingFilters
): number {
  const streetCasting = analysis.street_casting;
  if (!streetCasting) {
    // Fallback to standard calculation
    return analysis.overall_score || 50;
  }

  const unsignedScore = analysis.unsigned_probability?.score || 50;
  const rawPotential = streetCasting.raw_potential_score || 50;
  const physical = analysis.physical_potential?.score || 50;
  const authenticity = streetCasting.content_authenticity_score || 50;

  // Age match score
  let ageMatch = 50;
  if (streetCasting.estimated_age && filters?.ageRange) {
    const [minAge, maxAge] = filters.ageRange;
    if (streetCasting.estimated_age >= minAge && streetCasting.estimated_age <= maxAge) {
      ageMatch = 100;
    } else {
      const distance = Math.min(
        Math.abs(streetCasting.estimated_age - minAge),
        Math.abs(streetCasting.estimated_age - maxAge)
      );
      ageMatch = Math.max(0, 100 - distance * 10);
    }
  }

  const weightedScore =
    unsignedScore * STREET_CASTING_WEIGHTS.unsigned_probability +
    rawPotential * STREET_CASTING_WEIGHTS.raw_potential +
    physical * STREET_CASTING_WEIGHTS.physical_potential +
    authenticity * STREET_CASTING_WEIGHTS.content_authenticity +
    ageMatch * STREET_CASTING_WEIGHTS.age_match;

  return Math.round(weightedScore);
}

// Analyze a candidate for street casting
export async function analyzeForStreetCasting(
  candidate: CSVCandidate | ApifyProfile,
  filters?: StreetCastingFilters,
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
    const prompt = buildStreetCastingPrompt(candidate, hasImages, filters);

    // Use vision model if we have images
    const response = hasImages
      ? await generateWithVision(prompt, images)
      : await generateText(prompt);

    const analysis = parseAnalysisResponse(response) as AIAnalysis & {
      street_casting?: StreetCastingAnalysis;
    };

    // Calculate street casting composite score
    const streetCastingScore = calculateStreetCastingScore(analysis, filters);

    // Update the street_casting object with calculated score
    if (analysis.street_casting) {
      analysis.street_casting.street_casting_score = streetCastingScore;
    }

    // Use street casting score as overall score
    analysis.overall_score = streetCastingScore;

    return { score: streetCastingScore, analysis };
  } catch (error) {
    console.error('Street casting analysis error:', error);
    const defaultAnalysis = getDefaultAnalysis(false);
    return {
      score: 50,
      analysis: defaultAnalysis,
    };
  }
}

// Extract street casting scores for database
export function extractStreetCastingScores(analysis: AIAnalysis): Record<string, number | null> {
  const streetCasting = (analysis as AIAnalysis & { street_casting?: StreetCastingAnalysis })
    .street_casting;

  if (!streetCasting) {
    return {
      estimated_age: null,
      age_confidence: null,
      raw_potential_score: null,
      street_casting_score: null,
      content_authenticity_score: null,
    };
  }

  return {
    estimated_age: streetCasting.estimated_age || null,
    age_confidence: streetCasting.age_confidence || null,
    raw_potential_score: streetCasting.raw_potential_score || null,
    street_casting_score: streetCasting.street_casting_score || null,
    content_authenticity_score: streetCasting.content_authenticity_score || null,
  };
}
