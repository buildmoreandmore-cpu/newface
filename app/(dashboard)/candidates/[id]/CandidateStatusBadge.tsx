'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

const statusOptions = [
  { value: 'discovered', label: 'Discovered' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'responded', label: 'Responded' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'signed', label: 'Signed' },
  { value: 'rejected', label: 'Rejected' },
];

interface CandidateStatusBadgeProps {
  currentStatus: string;
  statusColors: Record<string, string>;
}

export function CandidateStatusBadge({
  currentStatus,
  statusColors,
}: CandidateStatusBadgeProps) {
  const [status, setStatus] = useState(currentStatus);

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    // In demo mode, we just update local state
    // In production, this would call Supabase
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-none">
          <Badge
            className={`${statusColors[status] || statusColors['discovered']} border-0 font-medium capitalize cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1`}
          >
            {status}
            <ChevronDown className="h-3 w-3" />
          </Badge>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="bg-white">
        {statusOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            className={`cursor-pointer ${status === option.value ? 'font-semibold' : ''}`}
          >
            <span className={`w-2 h-2 rounded-full mr-2 ${statusColors[option.value]?.split(' ')[0] || 'bg-zinc-300'}`} />
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
