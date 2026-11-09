-- CICT website CMS schema
-- Public visitors can read published content; only users listed in
-- public.admin_users can create, update or delete anything.

-- ============================================================
-- Admins
-- ============================================================
create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  );
$$;

create policy "Admins can view admin list"
  on public.admin_users for select
  to authenticated
  using ((select public.is_admin()));

-- ============================================================
-- Shared trigger: keep updated_at current
-- ============================================================
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

-- ============================================================
-- Posts (news + announcements)
-- ============================================================
create type public.post_category as enum ('news', 'announcement');
create type public.post_status as enum ('draft', 'published');

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  excerpt text,
  body text not null default '',
  cover_image_url text,
  category public.post_category not null default 'news',
  status public.post_status not null default 'draft',
  is_featured boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index posts_published_idx on public.posts (status, published_at desc);

create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

alter table public.posts enable row level security;

create policy "Published posts are public"
  on public.posts for select
  to anon, authenticated
  using (status = 'published' and published_at <= now());

create policy "Admins can view all posts"
  on public.posts for select
  to authenticated
  using ((select public.is_admin()));

create policy "Admins can insert posts"
  on public.posts for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "Admins can update posts"
  on public.posts for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins can delete posts"
  on public.posts for delete
  to authenticated
  using ((select public.is_admin()));

-- ============================================================
-- Programs
-- ============================================================
create table public.programs (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  code text not null,
  name text not null,
  logo_url text,
  description text not null default '',
  objectives text not null default '',
  duration text,
  semesters text,
  curriculum_pdf_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger programs_set_updated_at
  before update on public.programs
  for each row execute function public.set_updated_at();

alter table public.programs enable row level security;

create policy "Programs are public"
  on public.programs for select
  to anon, authenticated
  using (true);

create policy "Admins can insert programs"
  on public.programs for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "Admins can update programs"
  on public.programs for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins can delete programs"
  on public.programs for delete
  to authenticated
  using ((select public.is_admin()));

-- ============================================================
-- Departments (faculty directory groups)
-- x/y/logo_anchor_* position the label on the interactive
-- directory diagram (viewBox -300 0 1600 1000).
-- ============================================================
create table public.departments (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  side text not null default 'left' check (side in ('left', 'right')),
  x numeric not null default 0,
  y numeric not null default 0,
  logo_anchor_x numeric not null default 0,
  logo_anchor_y numeric not null default 0,
  zoom_scale numeric not null default 6,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger departments_set_updated_at
  before update on public.departments
  for each row execute function public.set_updated_at();

alter table public.departments enable row level security;

create policy "Departments are public"
  on public.departments for select
  to anon, authenticated
  using (true);

create policy "Admins can insert departments"
  on public.departments for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "Admins can update departments"
  on public.departments for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins can delete departments"
  on public.departments for delete
  to authenticated
  using ((select public.is_admin()));

-- ============================================================
-- Faculty members
-- ============================================================
create table public.faculty_members (
  id uuid primary key default gen_random_uuid(),
  department_slug text not null
    references public.departments (slug) on update cascade on delete cascade,
  name text not null,
  title text not null default '',
  description text not null default '',
  image_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index faculty_members_department_idx
  on public.faculty_members (department_slug, sort_order);

create trigger faculty_members_set_updated_at
  before update on public.faculty_members
  for each row execute function public.set_updated_at();

alter table public.faculty_members enable row level security;

create policy "Faculty members are public"
  on public.faculty_members for select
  to anon, authenticated
  using (true);

create policy "Admins can insert faculty members"
  on public.faculty_members for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "Admins can update faculty members"
  on public.faculty_members for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins can delete faculty members"
  on public.faculty_members for delete
  to authenticated
  using ((select public.is_admin()));

-- ============================================================
-- Table privileges (RLS policies above decide which rows)
-- ============================================================
grant usage on schema public to anon, authenticated;

grant select on public.posts, public.programs, public.departments, public.faculty_members
  to anon, authenticated;

grant insert, update, delete on public.posts, public.programs, public.departments, public.faculty_members
  to authenticated;

grant select on public.admin_users to authenticated;

grant all on public.posts, public.programs, public.departments, public.faculty_members, public.admin_users
  to service_role;

grant execute on function public.is_admin() to anon, authenticated;

-- ============================================================
-- Storage: public "media" bucket for CMS uploads
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml', 'application/pdf']
)
on conflict (id) do nothing;

create policy "Admins can upload media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and (select public.is_admin()));

create policy "Admins can update media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));

create policy "Admins can delete media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));
