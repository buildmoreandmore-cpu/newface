'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Save, StickyNote } from 'lucide-react';

interface CandidateNotesProps {
  candidateId: string;
  initialNotes: string;
}

export function CandidateNotes({
  candidateId,
  initialNotes,
}: CandidateNotesProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [loading, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    const { error } = await supabase
      .from('candidates')
      .update({ notes })
      .eq('id', candidateId);

    setSaving(false);

    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <StickyNote className="h-5 w-5 text-gold" />
          Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Add your notes about this candidate..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[200px] resize-none bg-background"
        />
        <Button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-gold text-background hover:bg-gold-hover"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            'Saved!'
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Notes
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
