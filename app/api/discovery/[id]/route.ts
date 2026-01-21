import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/discovery/[id] - Get discovery job status
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get job with candidate count
    const { data: job, error: jobError } = await supabase
      .from('discovery_jobs')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Discovery job not found' },
        { status: 404 }
      );
    }

    // Get candidates from this job
    const { data: candidates, error: candidatesError } = await supabase
      .from('candidates')
      .select('id, name, handle, ai_score, status, physical_potential_score, unsigned_probability_score')
      .eq('discovery_job_id', id)
      .order('ai_score', { ascending: false })
      .limit(20);

    return NextResponse.json({
      job,
      candidates: candidates || [],
      top_candidates: (candidates || []).slice(0, 5),
    });
  } catch (error) {
    console.error('Get job error:', error);
    return NextResponse.json(
      { error: 'Failed to get discovery job' },
      { status: 500 }
    );
  }
}

// DELETE /api/discovery/[id] - Cancel/delete discovery job
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete the job (candidates will have discovery_job_id set to null due to ON DELETE SET NULL)
    const { error: deleteError } = await supabase
      .from('discovery_jobs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete discovery job' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete job error:', error);
    return NextResponse.json(
      { error: 'Failed to delete discovery job' },
      { status: 500 }
    );
  }
}
