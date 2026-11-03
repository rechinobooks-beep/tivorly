-- Tivorly: initial account and personal-data schema
-- Run this file in Supabase SQL Editor after creating the project.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) <= 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  language text not null default 'pt' check (language in ('pt', 'en')),
  theme text not null default 'dark' check (theme in ('dark', 'light', 'system')),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  tool_id text not null check (char_length(tool_id) between 1 and 80),
  created_at timestamptz not null default now(),
  primary key (user_id, tool_id)
);

-- Store tool identifiers only. Never put passwords, typed text, or file contents here.
create table if not exists public.tool_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tool_id text not null check (char_length(tool_id) between 1 and 80),
  used_at timestamptz not null default now()
);

create index if not exists tool_history_user_used_at_idx
  on public.tool_history (user_id, used_at desc);

-- Optional user-saved snippets/settings. The app must only write here after an explicit save action.
create table if not exists public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  item_type text not null default 'note' check (char_length(item_type) <= 40),
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists saved_items_user_updated_idx
  on public.saved_items (user_id, updated_at desc);

-- Keep profile and default preferences in sync with newly registered accounts.
create or replace function public.handle_new_tivorly_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_tivorly_user_created on auth.users;
create trigger on_tivorly_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_tivorly_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists preferences_set_updated_at on public.user_preferences;
create trigger preferences_set_updated_at before update on public.user_preferences
for each row execute procedure public.set_updated_at();

drop trigger if exists saved_items_set_updated_at on public.saved_items;
create trigger saved_items_set_updated_at before update on public.saved_items
for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.user_favorites enable row level security;
alter table public.tool_history enable row level security;
alter table public.saved_items enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles
for select to authenticated using (id = (select auth.uid()));

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
for update to authenticated using (id = (select auth.uid()))
with check (id = (select auth.uid()));

drop policy if exists "Users can read own preferences" on public.user_preferences;
create policy "Users can read own preferences" on public.user_preferences
for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "Users can insert own preferences" on public.user_preferences;
create policy "Users can insert own preferences" on public.user_preferences
for insert to authenticated with check (user_id = (select auth.uid()));

drop policy if exists "Users can update own preferences" on public.user_preferences;
create policy "Users can update own preferences" on public.user_preferences
for update to authenticated using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "Users manage own favorites" on public.user_favorites;
create policy "Users manage own favorites" on public.user_favorites
for all to authenticated using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "Users manage own tool history" on public.tool_history;
create policy "Users manage own tool history" on public.tool_history
for all to authenticated using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "Users manage own saved items" on public.saved_items;
create policy "Users manage own saved items" on public.saved_items
for all to authenticated using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

revoke all on public.profiles, public.user_preferences, public.user_favorites,
  public.tool_history, public.saved_items from anon;
grant select, update on public.profiles to authenticated;
grant select, insert, update on public.user_preferences to authenticated;
grant select, insert, delete on public.user_favorites to authenticated;
grant select, insert, delete on public.tool_history to authenticated;
grant select, insert, update, delete on public.saved_items to authenticated;

-- Private file bucket. Each user's files must be stored under a folder named with their auth UID.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tivorly-user-files',
  'tivorly-user-files',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'application/pdf', 'text/plain']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg', 'image/png', 'application/pdf', 'text/plain'];

drop policy if exists "Users read own Tivorly files" on storage.objects;
create policy "Users read own Tivorly files" on storage.objects
for select to authenticated
using (bucket_id = 'tivorly-user-files' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Users upload own Tivorly files" on storage.objects;
create policy "Users upload own Tivorly files" on storage.objects
for insert to authenticated
with check (bucket_id = 'tivorly-user-files' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Users update own Tivorly files" on storage.objects;
create policy "Users update own Tivorly files" on storage.objects
for update to authenticated
using (bucket_id = 'tivorly-user-files' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'tivorly-user-files' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Users delete own Tivorly files" on storage.objects;
create policy "Users delete own Tivorly files" on storage.objects
for delete to authenticated
using (bucket_id = 'tivorly-user-files' and (storage.foldername(name))[1] = (select auth.uid())::text);
