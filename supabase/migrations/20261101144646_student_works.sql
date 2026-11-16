-- Featured student works shown on the BSEMC page: digital art, videos and
-- games. Visible works are public; admins manage them from the dashboard.

create type public.student_work_kind as enum ('art', 'video', 'game');
create type public.video_orientation as enum ('landscape', 'vertical');

create table public.student_works (
  id uuid primary key default gen_random_uuid(),
  kind public.student_work_kind not null,
  title text not null check (title <> ''),
  student text not null check (student <> ''),
  description text not null check (description <> ''),
  -- Display version (wall and spotlight); for videos, an optional thumbnail
  image_url text,
  image_width integer check (image_width > 0),
  image_height integer check (image_height > 0),
  -- Loaded when a visitor zooms in; art and games only
  zoom_url text,
  zoom_width integer check (zoom_width > 0),
  zoom_height integer check (zoom_height > 0),
  -- The upload as-is, kept as an archive; never shown on the site
  original_url text,
  youtube_id text check (youtube_id ~ '^[A-Za-z0-9_-]{11}$'),
  orientation public.video_orientation,
  store_url text,
  portfolio_url text,
  visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_works_image_complete check (
    (image_url is null) = (image_width is null)
    and (image_url is null) = (image_height is null)
    and (zoom_url is null) = (zoom_width is null)
    and (zoom_url is null) = (zoom_height is null)
  ),
  constraint student_works_media_for_kind check (
    case kind
      when 'art' then image_url is not null
      when 'game' then image_url is not null and store_url is not null
      when 'video' then youtube_id is not null and orientation is not null
    end
  )
);

create index student_works_visible_order_idx
  on public.student_works (visible, sort_order);

create trigger student_works_set_updated_at
  before update on public.student_works
  for each row execute function public.set_updated_at();

alter table public.student_works enable row level security;

-- Table privileges; RLS below decides which rows each role can actually touch
grant select on public.student_works to anon;
grant select, insert, update, delete on public.student_works to authenticated;
grant all on public.student_works to service_role;

create policy "Visible student works are public"
  on public.student_works for select
  to anon, authenticated
  using (visible);

create policy "Admins can view all student works"
  on public.student_works for select
  to authenticated
  using ((select public.is_admin()));

create policy "Admins can insert student works"
  on public.student_works for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "Admins can update student works"
  on public.student_works for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins can delete student works"
  on public.student_works for delete
  to authenticated
  using ((select public.is_admin()));

-- Digital art originals can be large; uploads go straight from the admin's
-- browser to Storage, so the 4.5 MB request limit on Vercel doesn't apply
update storage.buckets set file_size_limit = 26214400 where id = 'media';
