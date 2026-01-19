import OpenAI from 'openai';
import type { AIAnalysis, CSVCandidate } from '@/types';

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function analyzeCandidate(
  candidate: CSVCandidate
): Promise<{ score: number; analysis: AIAnalysis }> {
  const prompt = `You are an expert fashion talent scout for a premium modeling agency. Analyze the following social media profile and provide a detailed assessment.

Profile Information:
- Name: ${candidate.name}
- Platform: ${candidate.platform || 'Unknown'}
- Handle: ${candidate.handle || 'Unknown'}
- Bio: ${candidate.bio || 'Not provided'}
- Followers: ${candidate.followers?.toLocaleString() || 'Unknown'}
- Engagement Rate: ${candidate.engagement_rate ? `${candidate.engagement_rate}%` : 'Unknown'}
- Location: ${candidate.location || 'Unknown'}

Provide your analysis in the following JSON format:
{
  "overall_assessment": "A 2-3 sentence summary of the candidate's potential",
  "strengths": ["strength1", "strength2", "strength3"],
  "potential_categories": ["category1", "category2"] (e.g., "High Fashion", "Commercial", "Fitness", "Editorial", "Influencer"),
  "marketability_score": <1-100>,
  "professionalism_score": <1-100>,
  "unique_factor": "What makes this candidate stand out",
  "recommendations": ["recommendation1", "recommendation2"]
}

Base your scores on:
- Follower count and engagement (indicates reach and influence)
- Bio quality and professionalism
- Platform presence
- Location (fashion capitals score higher)
- Overall marketability for fashion/modeling industry

Return ONLY valid JSON, no additional text.`;

  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a professional fashion talent scout. Respond only with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    const analysis: AIAnalysis = JSON.parse(content);
    const score = Math.round(
      (analysis.marketability_score + analysis.professionalism_score) / 2
    );

    return { score, analysis };
  } catch (error) {
    console.error('AI analysis error:', error);
    // Return default analysis on error
    return {
      score: 50,
      analysis: {
        overall_assessment:
          'Unable to complete full analysis. Manual review recommended.',
        strengths: ['Profile submitted for review'],
        potential_categories: ['To be determined'],
        marketability_score: 50,
        professionalism_score: 50,
        unique_factor: 'Requires manual assessment',
        recommendations: ['Complete profile information', 'Add professional photos'],
      },
    };
  }
}

export async function analyzeBatch(
  candidates: CSVCandidate[]
): Promise<Map<string, { score: number; analysis: AIAnalysis }>> {
  const results = new Map<string, { score: number; analysis: AIAnalysis }>();

  // Process in batches of 5 to avoid rate limiting
  const batchSize = 5;
  for (let i = 0; i < candidates.length; i += batchSize) {
    const batch = candidates.slice(i, i + batchSize);
    const promises = batch.map(async (candidate) => {
      const result = await analyzeCandidate(candidate);
      return { name: candidate.name, result };
    });

    const batchResults = await Promise.all(promises);
    batchResults.forEach(({ name, result }) => {
      results.set(name, result);
    });

    // Small delay between batches to avoid rate limits
    if (i + batchSize < candidates.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}
