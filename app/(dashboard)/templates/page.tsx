import { createClient } from '@/lib/supabase/server';
import { TemplatesList } from './TemplatesList';
import type { Template } from '@/types';

async function getTemplates() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from('templates')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (data as Template[]) || [];
}

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Outreach Templates</h1>
        <p className="text-muted-foreground">
          Create and manage your talent outreach messages
        </p>
      </div>

      {/* Templates List */}
      <TemplatesList initialTemplates={templates} />
    </div>
  );
}
