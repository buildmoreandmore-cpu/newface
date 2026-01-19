'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import type { CSVCandidate } from '@/types';

type UploadStatus = 'idle' | 'parsing' | 'analyzing' | 'saving' | 'complete' | 'error';

interface ProcessedCandidate extends CSVCandidate {
  ai_score?: number;
  ai_analysis?: object;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [candidates, setCandidates] = useState<ProcessedCandidate[]>([]);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const parseCSV = (text: string): CSVCandidate[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));
    const data: CSVCandidate[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim().replace(/['"]/g, ''));
      const row: Record<string, string> = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      if (row.name) {
        data.push({
          name: row.name,
          handle: row.handle || row.username || undefined,
          platform: row.platform || undefined,
          profile_url: row.profile_url || row.url || undefined,
          avatar_url: row.avatar_url || row.avatar || row.image || undefined,
          bio: row.bio || row.description || undefined,
          followers: row.followers ? parseInt(row.followers.replace(/,/g, ''), 10) : undefined,
          engagement_rate: row.engagement_rate || row.engagement
            ? parseFloat(row.engagement_rate || row.engagement)
            : undefined,
          location: row.location || row.city || undefined,
        });
      }
    }

    return data;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile);
      setError(null);
    } else {
      setError('Please upload a CSV file');
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const processUpload = async () => {
    if (!file) return;

    setStatus('parsing');
    setProgress(0);

    try {
      // Parse CSV
      const text = await file.text();
      const parsed = parseCSV(text);

      if (parsed.length === 0) {
        setError('No valid candidates found in CSV. Make sure it has a "name" column.');
        setStatus('error');
        return;
      }

      const processedCandidates: ProcessedCandidate[] = parsed.map((c) => ({
        ...c,
        status: 'pending' as const,
      }));
      setCandidates(processedCandidates);
      setProgress(10);

      // Get user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Not authenticated');
        setStatus('error');
        return;
      }

      // Analyze with AI
      setStatus('analyzing');
      let analyzedCount = 0;

      for (let i = 0; i < processedCandidates.length; i++) {
        const candidate = processedCandidates[i];

        // Update status to processing
        setCandidates((prev) =>
          prev.map((c, idx) => (idx === i ? { ...c, status: 'processing' as const } : c))
        );

        try {
          // Call AI analysis API
          const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: candidate.name,
              handle: candidate.handle,
              platform: candidate.platform,
              bio: candidate.bio,
              followers: candidate.followers,
              engagement_rate: candidate.engagement_rate,
              location: candidate.location,
            }),
          });

          if (response.ok) {
            const { score, analysis } = await response.json();
            processedCandidates[i] = {
              ...processedCandidates[i],
              ai_score: score,
              ai_analysis: analysis,
              status: 'success',
            };
          } else {
            processedCandidates[i] = {
              ...processedCandidates[i],
              ai_score: 50,
              status: 'success',
            };
          }
        } catch {
          processedCandidates[i] = {
            ...processedCandidates[i],
            ai_score: 50,
            status: 'success',
          };
        }

        analyzedCount++;
        setProgress(10 + (analyzedCount / processedCandidates.length) * 60);
        setCandidates([...processedCandidates]);
      }

      // Save to database
      setStatus('saving');
      setProgress(75);

      const candidatesToInsert = processedCandidates.map((c) => ({
        user_id: user.id,
        name: c.name,
        handle: c.handle || null,
        platform: c.platform || null,
        profile_url: c.profile_url || null,
        avatar_url: c.avatar_url || null,
        bio: c.bio || null,
        followers: c.followers || null,
        engagement_rate: c.engagement_rate || null,
        location: c.location || null,
        ai_score: c.ai_score || null,
        ai_analysis: c.ai_analysis || null,
        status: 'discovered',
      }));

      const { error: insertError } = await supabase
        .from('candidates')
        .insert(candidatesToInsert);

      if (insertError) {
        setError('Failed to save candidates: ' + insertError.message);
        setStatus('error');
        return;
      }

      setProgress(100);
      setStatus('complete');

      // Redirect after delay
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStatus('error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Profiles</h1>
        <p className="text-muted-foreground">
          Import candidate profiles from CSV for AI analysis
        </p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          {status === 'idle' && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="relative rounded-lg border-2 border-dashed border-border p-12 text-center transition-colors hover:border-gold/50"
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 font-semibold">
                {file ? file.name : 'Drop your CSV here'}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                or click to browse
              </p>
              {file && (
                <Badge className="mt-4 bg-gold/10 text-gold">
                  <FileText className="mr-1 h-3 w-3" />
                  {file.name}
                </Badge>
              )}
            </div>
          )}

          {status !== 'idle' && status !== 'complete' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Loader2 className="h-5 w-5 animate-spin text-gold" />
                <span className="font-medium">
                  {status === 'parsing' && 'Parsing CSV...'}
                  {status === 'analyzing' && 'Analyzing profiles with AI...'}
                  {status === 'saving' && 'Saving to database...'}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {Math.round(progress)}% complete
              </p>
            </div>
          )}

          {status === 'complete' && (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="mt-4 text-xl font-semibold">Upload Complete!</h3>
              <p className="mt-2 text-muted-foreground">
                {candidates.length} candidates imported successfully
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Redirecting to dashboard...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-8">
              <XCircle className="mx-auto h-12 w-12 text-destructive" />
              <h3 className="mt-4 text-xl font-semibold">Upload Failed</h3>
              <p className="mt-2 text-destructive">{error}</p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => {
                  setStatus('idle');
                  setFile(null);
                  setCandidates([]);
                  setError(null);
                }}
              >
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* File selected, ready to process */}
      {file && status === 'idle' && (
        <div className="flex justify-end">
          <Button
            onClick={processUpload}
            className="bg-gold text-background hover:bg-gold-hover"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Analyze Profiles
          </Button>
        </div>
      )}

      {/* Processing candidates list */}
      {candidates.length > 0 && status !== 'complete' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Processing Candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-auto">
              {candidates.map((candidate, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 text-gold text-sm font-medium">
                      {candidate.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{candidate.name}</p>
                      {candidate.handle && (
                        <p className="text-sm text-muted-foreground">
                          @{candidate.handle}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {candidate.ai_score && (
                      <Badge variant="secondary">Score: {candidate.ai_score}</Badge>
                    )}
                    {candidate.status === 'pending' && (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                    {candidate.status === 'processing' && (
                      <Badge className="bg-blue-500/10 text-blue-500">
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Analyzing
                      </Badge>
                    )}
                    {candidate.status === 'success' && (
                      <Badge className="bg-green-500/10 text-green-500">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Done
                      </Badge>
                    )}
                    {candidate.status === 'error' && (
                      <Badge className="bg-destructive/10 text-destructive">
                        <XCircle className="mr-1 h-3 w-3" />
                        Error
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CSV Format Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertCircle className="h-5 w-5 text-gold" />
            CSV Format Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Your CSV should include the following columns (only name is required):
          </p>
          <div className="rounded-lg bg-muted p-4 font-mono text-sm overflow-x-auto">
            <code>
              name,handle,platform,bio,followers,engagement_rate,location,profile_url
            </code>
          </div>
          <div className="mt-4 grid gap-2 text-sm">
            <div className="flex gap-2">
              <Badge variant="outline">name</Badge>
              <span className="text-muted-foreground">Full name (required)</span>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">handle</Badge>
              <span className="text-muted-foreground">Social media username</span>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">platform</Badge>
              <span className="text-muted-foreground">
                instagram, tiktok, linkedin
              </span>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">followers</Badge>
              <span className="text-muted-foreground">Number of followers</span>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">engagement_rate</Badge>
              <span className="text-muted-foreground">Percentage (e.g., 3.5)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
