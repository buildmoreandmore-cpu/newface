-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  agency_name text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table profiles enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Candidates table
create table if not exists candidates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  handle text,
  platform text check (platform in ('instagram', 'tiktok', 'linkedin', 'other')),
  profile_url text,
  avatar_url text,
  bio text,
  followers int,
  engagement_rate decimal,
  location text,
  ai_score int check (ai_score >= 0 and ai_score <= 100),
  ai_analysis jsonb,
  status text default 'discovered' check (status in ('discovered', 'contacted', 'responded', 'meeting', 'signed', 'rejected')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table candidates enable row level security;

-- Candidates policies
create policy "Users can view own candidates"
  on candidates for select
  using (auth.uid() = user_id);

create policy "Users can insert own candidates"
  on candidates for insert
  with check (auth.uid() = user_id);

create policy "Users can update own candidates"
  on candidates for update
  using (auth.uid() = user_id);

create policy "Users can delete own candidates"
  on candidates for delete
  using (auth.uid() = user_id);

-- Templates table
create table if not exists templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  content text not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table templates enable row level security;

-- Templates policies
create policy "Users can view own templates"
  on templates for select
  using (auth.uid() = user_id);

create policy "Users can insert own templates"
  on templates for insert
  with check (auth.uid() = user_id);

create policy "Users can update own templates"
  on templates for update
  using (auth.uid() = user_id);

create policy "Users can delete own templates"
  on templates for delete
  using (auth.uid() = user_id);

-- Function to update updated_at timestamp
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for candidates updated_at
create trigger candidates_updated_at
  before update on candidates
  for each row
  execute function update_updated_at();

-- Function to create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function handle_new_user();

-- Indexes for performance
create index if not exists idx_candidates_user_id on candidates(user_id);
create index if not exists idx_candidates_status on candidates(status);
create index if not exists idx_candidates_ai_score on candidates(ai_score desc);
create index if not exists idx_templates_user_id on templates(user_id);
