'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save, StickyNote, Check } from 'lucide-react';

interface CandidateNotesProps {
  candidateId: string;
  initialNotes: string;
}

export function CandidateNotes({
  candidateId,
  initialNotes,
}: CandidateNotesProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In demo mode, we just show a saved confirmation
    // In production, this would call Supabase
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
      <h2 className="flex items-center gap-2 text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">
        <StickyNote className="h-4 w-4" />
        Notes
      </h2>
      <div className="space-y-4">
        <Textarea
          placeholder="Add your notes about this candidate..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[150px] resize-none bg-zinc-50 border-zinc-200 text-zinc-700 placeholder:text-zinc-400 focus:border-zinc-300 focus:ring-zinc-200"
        />
        <Button
          onClick={handleSave}
          className={`w-full transition-colors ${
            saved
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
              : 'bg-zinc-900 hover:bg-zinc-800 text-white'
          }`}
        >
          {saved ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Notes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
