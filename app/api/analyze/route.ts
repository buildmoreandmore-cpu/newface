import { NextResponse } from 'next/server';
import { analyzeCandidate } from '@/lib/ai/analyze';
import type { CSVCandidate } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const candidate: CSVCandidate = {
      name: body.name,
      handle: body.handle,
      platform: body.platform,
      bio: body.bio,
      followers: body.followers,
      engagement_rate: body.engagement_rate,
      location: body.location,
    };

    const { score, analysis } = await analyzeCandidate(candidate);

    return NextResponse.json({ score, analysis });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze candidate' },
      { status: 500 }
    );
  }
}
