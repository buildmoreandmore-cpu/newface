'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Users, Filter, GripVertical } from 'lucide-react';
import type { Candidate, CandidateStatus } from '@/types';
import { cn } from '@/lib/utils';

interface Column {
  id: CandidateStatus;
  title: string;
  color: string;
}

interface PipelineBoardProps {
  columns: Column[];
  initialCandidates: Record<CandidateStatus, Candidate[]>;
}

export function PipelineBoard({ columns, initialCandidates }: PipelineBoardProps) {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [draggedCandidate, setDraggedCandidate] = useState<Candidate | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleDragStart = (candidate: Candidate) => {
    setDraggedCandidate(candidate);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (newStatus: CandidateStatus) => {
    if (!draggedCandidate || draggedCandidate.status === newStatus) {
      setDraggedCandidate(null);
      return;
    }

    const oldStatus = draggedCandidate.status;

    // Optimistically update UI
    setCandidates((prev) => ({
      ...prev,
      [oldStatus]: prev[oldStatus].filter((c) => c.id !== draggedCandidate.id),
      [newStatus]: [{ ...draggedCandidate, status: newStatus }, ...prev[newStatus]],
    }));

    // Update in database
    const { error } = await supabase
      .from('candidates')
      .update({ status: newStatus })
      .eq('id', draggedCandidate.id);

    if (error) {
      // Revert on error
      setCandidates((prev) => ({
        ...prev,
        [newStatus]: prev[newStatus].filter((c) => c.id !== draggedCandidate.id),
        [oldStatus]: [draggedCandidate, ...prev[oldStatus]],
      }));
    }

    setDraggedCandidate(null);
    router.refresh();
  };

  const filterCandidates = (columnCandidates: Candidate[]) => {
    return columnCandidates.filter((candidate) => {
      const matchesSearch =
        search === '' ||
        candidate.name.toLowerCase().includes(search.toLowerCase()) ||
        candidate.handle?.toLowerCase().includes(search.toLowerCase());

      const matchesPlatform =
        platformFilter === 'all' || candidate.platform === platformFilter;

      return matchesSearch && matchesPlatform;
    });
  };

  const totalCandidates = Object.values(candidates).flat().length;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{totalCandidates} candidates</span>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search candidates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-[200px] pl-9 bg-background"
            />
          </div>
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {columns.map((column) => {
          const columnCandidates = filterCandidates(candidates[column.id] || []);

          return (
            <div
              key={column.id}
              className="flex flex-col"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
            >
              <Card className="flex-1">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn('h-3 w-3 rounded-full', column.color)} />
                      <CardTitle className="text-sm font-medium">
                        {column.title}
                      </CardTitle>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {columnCandidates.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 min-h-[400px]">
                  {columnCandidates.length === 0 ? (
                    <div className="flex h-[100px] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                      No candidates
                    </div>
                  ) : (
                    columnCandidates.map((candidate) => (
                      <div
                        key={candidate.id}
                        draggable
                        onDragStart={() => handleDragStart(candidate)}
                        className={cn(
                          'group cursor-grab rounded-lg border border-border bg-card p-3 transition-all hover:border-gold/50 hover:shadow-md active:cursor-grabbing',
                          draggedCandidate?.id === candidate.id && 'opacity-50'
                        )}
                      >
                        <Link href={`/candidates/${candidate.id}`}>
                          <div className="flex items-start gap-3">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={candidate.avatar_url || undefined} />
                              <AvatarFallback className="bg-gold/10 text-gold text-xs">
                                {candidate.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {candidate.name}
                              </p>
                              {candidate.handle && (
                                <p className="text-xs text-muted-foreground truncate">
                                  @{candidate.handle}
                                </p>
                              )}
                            </div>
                            {candidate.ai_score !== null && (
                              <div
                                className={cn(
                                  'text-xs font-medium px-1.5 py-0.5 rounded',
                                  candidate.ai_score >= 80
                                    ? 'bg-green-500/10 text-green-500'
                                    : candidate.ai_score >= 60
                                    ? 'bg-gold/10 text-gold'
                                    : 'bg-orange-500/10 text-orange-500'
                                )}
                              >
                                {candidate.ai_score}
                              </div>
                            )}
                          </div>
                        </Link>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
