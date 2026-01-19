import { createClient } from '@/lib/supabase/server';
import { PipelineBoard } from './PipelineBoard';
import type { Candidate, CandidateStatus } from '@/types';

const columns: { id: CandidateStatus; title: string; color: string }[] = [
  { id: 'discovered', title: 'Discovered', color: 'bg-blue-500' },
  { id: 'contacted', title: 'Contacted', color: 'bg-yellow-500' },
  { id: 'responded', title: 'Responded', color: 'bg-purple-500' },
  { id: 'meeting', title: 'Meeting', color: 'bg-orange-500' },
  { id: 'signed', title: 'Signed', color: 'bg-green-500' },
  { id: 'rejected', title: 'Rejected', color: 'bg-red-500' },
];

async function getCandidates() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from('candidates')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  return (data as Candidate[]) || [];
}

export default async function PipelinePage() {
  const candidates = await getCandidates();

  // Group candidates by status
  const groupedCandidates = columns.reduce((acc, column) => {
    acc[column.id] = candidates.filter((c) => c.status === column.id);
    return acc;
  }, {} as Record<CandidateStatus, Candidate[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pipeline</h1>
        <p className="text-muted-foreground">
          Track candidates through your scouting pipeline
        </p>
      </div>

      {/* Pipeline Board */}
      <PipelineBoard columns={columns} initialCandidates={groupedCandidates} />
    </div>
  );
}
