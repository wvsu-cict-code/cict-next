-- BSEMC virtual museum: student works get exhibit categories, a review
-- status, and an owner. Signed-in students submit and edit their own works;
-- every student write goes back to "pending" until an admin approves it.

-- ============================================================
-- Categories (same values, same order as CATEGORIES in
-- src/lib/museum/categories.ts)
-- ============================================================
create type public.exhibit_category as enum (
  'game',
  'interactive_media',
  'xr_3d',
  'digital_art',
  'animation',
  'short_film',
  'sound_design'
);

create type public.review_status as enum ('pending', 'approved', 'rejected');

alter table public.student_works add column category public.exhibit_category;

update public.student_works
set category = case kind
  when 'art' then 'digital_art'
  when 'game' then 'game'
  when 'video' then 'short_film'
end::public.exhibit_category;

alter table public.student_works
  alter column category set not null,
  drop constraint student_works_media_for_kind,
  drop column kind;

drop type public.student_work_kind;

-- ============================================================
-- Review, ownership and media columns
-- ============================================================
alter table public.student_works
  -- Works added by admins before submissions existed are already approved
  add column status public.review_status not null default 'approved',
  -- Null for works an admin added from the dashboard
  add column submitted_by uuid references auth.users (id) on delete cascade,
  add column rejection_reason text,
  add column featured boolean not null default false,
  add column like_count integer not null default 0 check (like_count >= 0),
  -- Uploaded webm, for animations and short films not on YouTube
  add column video_url text,
  add column audio_url text,
  add column submitted_at timestamptz,
  add column reviewed_at timestamptz,
  add constraint student_works_media_for_category check (
    case
      when category in ('game', 'interactive_media', 'xr_3d')
        then image_url is not null and store_url is not null
      when category = 'digital_art'
        then image_url is not null
      when category in ('animation', 'short_film')
        then (youtube_id is not null and orientation is not null)
          or (video_url is not null and image_url is not null and orientation is not null)
      when category = 'sound_design'
        then audio_url is not null and image_url is not null
    end
  ),
  add constraint student_works_rejection_has_reason check (
    status <> 'rejected' or rejection_reason is not null
  );

create index student_works_submitted_by_idx
  on public.student_works (submitted_by);

create index student_works_status_visible_order_idx
  on public.student_works (status, visible, sort_order);

create index student_works_featured_idx
  on public.student_works (created_at desc)
  where featured;

-- ============================================================
-- Row level security
-- ============================================================
drop policy "Visible student works are public" on public.student_works;

create policy "Approved visible student works are public"
  on public.student_works for select
  to anon, authenticated
  using (visible and status = 'approved');

create policy "Students can view their own works"
  on public.student_works for select
  to authenticated
  using (submitted_by = (select auth.uid()));

create policy "Students can submit their own works"
  on public.student_works for insert
  to authenticated
  with check (submitted_by = (select auth.uid()));

create policy "Students can update their own works"
  on public.student_works for update
  to authenticated
  using (submitted_by = (select auth.uid()))
  with check (submitted_by = (select auth.uid()));

create policy "Students can delete their own works"
  on public.student_works for delete
  to authenticated
  using (submitted_by = (select auth.uid()));

-- ============================================================
-- Student writes: the database, not the client, decides review state,
-- placement and counters. Admins and server-side roles (the service role,
-- security definer triggers) pass through untouched.
-- ============================================================
create or replace function public.guard_student_work()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  -- MAX_ACTIVE_WORKS in src/lib/museum/limits.ts
  max_active constant integer := 5;
  -- Whether this write puts the work into the student's active count
  needs_slot boolean := tg_op = 'INSERT';
  self_id uuid;
begin
  if (select public.is_admin()) or current_user not in ('authenticated', 'anon') then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if new.submitted_by is distinct from old.submitted_by then
      raise exception 'submitted_by cannot be changed' using errcode = '42501';
    end if;
    -- Resubmitting a rejected work makes it active again
    needs_slot := old.status = 'rejected';
    self_id := old.id;
  end if;

  if needs_slot then
    -- Serialise one student's concurrent writes so the quota holds
    perform pg_advisory_xact_lock(hashtext('student_works:' || new.submitted_by::text));

    if (
      select count(*)
      from public.student_works w
      where w.submitted_by = new.submitted_by
        and w.status in ('pending', 'approved')
        and w.id is distinct from self_id
    ) >= max_active then
      raise exception 'quota_reached' using errcode = 'P0001';
    end if;
  end if;

  if tg_op = 'INSERT' then
    new.featured := false;
    new.like_count := 0;
    new.visible := true;
    -- Students see only public rows and their own, so this can tie with a
    -- hidden work's position; admins reorder approved works anyway
    new.sort_order := (
      select coalesce(max(w.sort_order), -1) + 1 from public.student_works w
    );
  else
    new.featured := old.featured;
    new.like_count := old.like_count;
    new.visible := old.visible;
    new.sort_order := old.sort_order;
  end if;

  new.status := 'pending';
  new.rejection_reason := null;
  new.reviewed_at := null;
  new.submitted_at := now();
  return new;
end;
$$;

create trigger student_works_guard
  before insert or update on public.student_works
  for each row execute function public.guard_student_work();

create or replace function public.stamp_review()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.status is distinct from old.status and (select public.is_admin()) then
    new.reviewed_at := now();
  end if;
  return new;
end;
$$;

create trigger student_works_stamp_review
  before update of status on public.student_works
  for each row execute function public.stamp_review();
