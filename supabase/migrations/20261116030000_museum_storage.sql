-- BSEMC virtual museum: storage for student submissions. Files go in a
-- public bucket, one folder per student and work; the database refuses any
-- work that points at someone else's files.

-- SUBMISSION_MEDIA_MAX_BYTES in src/lib/museum/limits.ts (20 MB)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'submissions',
  'submissions',
  true,
  20971520,
  array['image/webp', 'video/webm', 'audio/webm']
)
on conflict (id) do nothing;

-- Path convention: <user_id>/<work_id>/<random>.<webp|webm>
-- Public URLs work because the bucket is public, so no policy lets anyone
-- list it. The select policy below is only for the owner and admins:
-- Postgres needs row visibility for an update or delete to match any row.
create policy "Owners and admins can see submission files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'submissions'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or (select public.is_admin())
    )
  );

create policy "Students can upload to their own submissions folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'submissions'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Students can update files in their own submissions folder"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'submissions'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'submissions'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Students can delete files in their own submissions folder"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'submissions'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Admins can delete any submission file"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'submissions' and (select public.is_admin()));

-- ============================================================
-- Usage report for the storage budget (admins only)
-- ============================================================
create or replace function public.submissions_storage_bytes()
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (select public.is_admin()) then
    raise exception 'not_admin' using errcode = '42501';
  end if;

  return coalesce((
    select sum((o.metadata->>'size')::bigint)
    from storage.objects o
    where o.bucket_id = 'submissions'
  ), 0);
end;
$$;

revoke execute on function public.submissions_storage_bytes() from public, anon;
grant execute on function public.submissions_storage_bytes() to authenticated;

-- ============================================================
-- Where this project serves its storage from. Student media URLs must start
-- with it, so a work cannot point at another host. Set the production value
-- after pushing (docs/virtual-museum-launch.md).
-- ============================================================
create table public.museum_config (
  id boolean primary key default true check (id),
  storage_origin text not null check (storage_origin ~ '^https?://[^/?#]+$')
);

alter table public.museum_config enable row level security;

create policy "Anyone can read the museum config"
  on public.museum_config for select
  to anon, authenticated
  using (true);

revoke all on public.museum_config from anon, authenticated;
grant select on public.museum_config to anon, authenticated;

insert into public.museum_config (storage_origin) values ('http://127.0.0.1:54321');

-- True when the url is null or points at an existing file in the caller's
-- folder for this work. Fails closed: no config row or no signed-in user
-- means false.
create or replace function public.museum_media_ok(url text, work_id uuid)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  uid text := (select auth.uid())::text;
  origin text := (select c.storage_origin from public.museum_config c limit 1);
  folder text;
  prefix text;
  file_name text;
begin
  if url is null then
    return true;
  end if;
  if uid is null or origin is null or work_id is null then
    return false;
  end if;

  folder := uid || '/' || work_id::text || '/';
  prefix := origin || '/storage/v1/object/public/submissions/' || folder;
  if left(url, length(prefix)) is distinct from prefix then
    return false;
  end if;

  file_name := substr(url, length(prefix) + 1);
  if file_name !~ '^[A-Za-z0-9._-]+$' then
    return false;
  end if;

  return exists (
    select 1
    from storage.objects o
    where o.bucket_id = 'submissions' and o.name = folder || file_name
  );
end;
$$;

revoke execute on function public.museum_media_ok(text, uuid) from public, anon;
grant execute on function public.museum_media_ok(text, uuid) to authenticated;

-- ============================================================
-- Students may only point at their own uploads (extends the works guard)
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
  work_id uuid;
begin
  if (select public.is_admin()) or current_user not in ('authenticated', 'anon') then
    return new;
  end if;

  if tg_op = 'INSERT' then
    -- Refused here, before the quota count, so the error never depends on
    -- someone else's works
    if new.submitted_by is distinct from (select auth.uid()) then
      raise exception 'not_owner' using errcode = '42501';
    end if;
  else
    if new.submitted_by is distinct from old.submitted_by then
      raise exception 'submitted_by cannot be changed' using errcode = '42501';
    end if;
    -- Resubmitting a rejected work makes it active again
    needs_slot := old.status = 'rejected';
    self_id := old.id;
  end if;

  -- Students may only point at files they uploaded for this very work
  -- (the id is immutable, so the old one names the folder on update)
  work_id := case when tg_op = 'INSERT' then new.id else old.id end;

  if not (
    public.museum_media_ok(new.image_url, work_id)
    and public.museum_media_ok(new.video_url, work_id)
    and public.museum_media_ok(new.audio_url, work_id)
  )
    or new.zoom_url is not null
    or new.original_url is not null
    or new.youtube_id is not null
  then
    raise exception 'media_not_owned' using errcode = '42501';
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
    -- The client may pick the id (it names the upload folder), not the date:
    -- galleries order by created_at
    new.created_at := now();
    new.updated_at := now();
    new.featured := false;
    new.like_count := 0;
    new.visible := true;
    -- Students see only public rows and their own, so this can tie with a
    -- hidden work's position; admins reorder approved works anyway
    new.sort_order := (
      select coalesce(max(w.sort_order), -1) + 1 from public.student_works w
    );
  else
    new.id := old.id;
    new.created_at := old.created_at;
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
