'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Copy,
  MoreVertical,
  Pencil,
  Trash2,
  Check,
  MessageSquare,
  Sparkles,
  Loader2,
} from 'lucide-react';
import type { Template } from '@/types';

const defaultTemplates = [
  {
    name: 'Initial Contact',
    content: `Hi {{name}},

I came across your profile and was immediately impressed by your unique look and engaging content. I'm reaching out from {{agency_name}}, a leading modeling agency.

We're always on the lookout for fresh talent, and I believe you have incredible potential in the fashion industry. Would you be interested in discussing opportunities with us?

Looking forward to hearing from you!

Best regards`,
  },
  {
    name: 'Follow-up',
    content: `Hi {{name}},

I hope this message finds you well! I reached out a few days ago about potential modeling opportunities with {{agency_name}}.

I wanted to follow up and see if you had a chance to consider our offer. We'd love to schedule a brief call to discuss how we can help launch your modeling career.

Let me know if you're available this week!

Best,`,
  },
  {
    name: 'Meeting Request',
    content: `Hi {{name}},

Thank you for your interest in {{agency_name}}! We've reviewed your profile and would love to meet with you.

Are you available for a brief video call this week? We'd like to discuss:
- Your modeling goals and aspirations
- Potential categories that suit your look
- Next steps in the representation process

Please let me know your availability, and I'll send over a calendar invite.

Best regards`,
  },
];

interface TemplatesListProps {
  initialTemplates: Template[];
}

export function TemplatesList({ initialTemplates }: TemplatesListProps) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSave = async () => {
    if (!name || !content) return;

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    if (editingTemplate) {
      // Update existing template
      const { data, error } = await supabase
        .from('templates')
        .update({ name, content })
        .eq('id', editingTemplate.id)
        .select()
        .single();

      if (!error && data) {
        setTemplates((prev) =>
          prev.map((t) => (t.id === editingTemplate.id ? (data as Template) : t))
        );
      }
    } else {
      // Create new template
      const { data, error } = await supabase
        .from('templates')
        .insert({ user_id: user.id, name, content })
        .select()
        .single();

      if (!error && data) {
        setTemplates((prev) => [data as Template, ...prev]);
      }
    }

    setLoading(false);
    setIsDialogOpen(false);
    setName('');
    setContent('');
    setEditingTemplate(null);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('templates').delete().eq('id', id);

    if (!error) {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      router.refresh();
    }
  };

  const handleCopy = async (template: Template) => {
    await navigator.clipboard.writeText(template.content);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setName(template.name);
    setContent(template.content);
    setIsDialogOpen(true);
  };

  const handleUseDefault = (defaultTemplate: typeof defaultTemplates[0]) => {
    setName(defaultTemplate.name);
    setContent(defaultTemplate.content);
    setEditingTemplate(null);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setName('');
    setContent('');
    setEditingTemplate(null);
  };

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleDialogClose()}>
          <DialogTrigger asChild>
            <Button className="bg-gold text-background hover:bg-gold-hover">
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Edit Template' : 'Create Template'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Initial Contact"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Message Content</Label>
                <Textarea
                  id="content"
                  placeholder="Write your outreach message here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[250px] bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  Use variables like{' '}
                  <code className="rounded bg-muted px-1">{'{{name}}'}</code>,{' '}
                  <code className="rounded bg-muted px-1">{'{{handle}}'}</code>,{' '}
                  <code className="rounded bg-muted px-1">{'{{agency_name}}'}</code>
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleDialogClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loading || !name || !content}
                  className="bg-gold text-background hover:bg-gold-hover"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Template'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <div className="space-y-6">
          {/* Empty State */}
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-semibold">No templates yet</h3>
              <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
                Create your first outreach template or start with one of our defaults
                below
              </p>
            </CardContent>
          </Card>

          {/* Default Templates */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Sparkles className="h-5 w-5 text-gold" />
              Starter Templates
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {defaultTemplates.map((template) => (
                <Card key={template.name} className="cursor-pointer transition-all hover:border-gold/50">
                  <CardHeader>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-4">
                      {template.content}
                    </p>
                    <Button
                      className="mt-4 w-full"
                      variant="outline"
                      onClick={() => handleUseDefault(template)}
                    >
                      Use This Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="group">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {template.content.split(' ').length} words
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(template)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(template.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">
                  {template.content}
                </p>
                <Button
                  className="mt-4 w-full"
                  variant="outline"
                  onClick={() => handleCopy(template)}
                >
                  {copiedId === template.id ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy to Clipboard
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Variable Reference */}
      {templates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Available Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                '{{name}}',
                '{{handle}}',
                '{{platform}}',
                '{{agency_name}}',
                '{{location}}',
              ].map((variable) => (
                <Badge key={variable} variant="secondary" className="font-mono">
                  {variable}
                </Badge>
              ))}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              These variables will be replaced with candidate information when you
              use the template
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
