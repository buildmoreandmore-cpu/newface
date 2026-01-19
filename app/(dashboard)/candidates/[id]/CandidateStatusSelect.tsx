'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { CandidateStatus } from '@/types';

const statusOptions: { value: CandidateStatus; label: string }[] = [
  { value: 'discovered', label: 'Discovered' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'responded', label: 'Responded' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'signed', label: 'Signed' },
  { value: 'rejected', label: 'Rejected' },
];

interface CandidateStatusSelectProps {
  candidateId: string;
  currentStatus: CandidateStatus;
}

export function CandidateStatusSelect({
  candidateId,
  currentStatus,
}: CandidateStatusSelectProps) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleStatusChange = async (newStatus: CandidateStatus) => {
    setLoading(true);
    setStatus(newStatus);

    const { error } = await supabase
      .from('candidates')
      .update({ status: newStatus })
      .eq('id', candidateId);

    if (error) {
      setStatus(currentStatus);
    }

    setLoading(false);
    router.refresh();
  };

  return (
    <Select
      value={status}
      onValueChange={(value) => handleStatusChange(value as CandidateStatus)}
      disabled={loading}
    >
      <SelectTrigger className="w-[140px]">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <SelectValue />
        )}
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
