-- Events and academic calendar dates. Published events are public; there is
-- no scheduled publishing, since the event's own date is what matters.

create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  summary text,
  body text not null default '',
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz check (ends_at is null or ends_at >= starts_at),
  -- Date-only events (holidays, enrollment periods) hide their times
  all_day boolean not null default false,
  cover_image_url text,
  status public.post_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_published_idx on public.events (status, starts_at);

create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

alter table public.events enable row level security;

create policy "Published events are public"
  on public.events for select
  to anon, authenticated
  using (status = 'published');

create policy "Admins can view all events"
  on public.events for select
  to authenticated
  using ((select public.is_admin()));

create policy "Admins can insert events"
  on public.events for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "Admins can update events"
  on public.events for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins can delete events"
  on public.events for delete
  to authenticated
  using ((select public.is_admin()));
