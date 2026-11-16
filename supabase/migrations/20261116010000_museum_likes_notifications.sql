-- BSEMC virtual museum: signed-in users like approved works, and students
-- are notified when an admin approves or rejects a submission.

-- ============================================================
-- Likes
-- ============================================================
create table public.work_likes (
  work_id uuid not null references public.student_works (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (work_id, user_id)
);

create index work_likes_user_id_idx on public.work_likes (user_id);

alter table public.work_likes enable row level security;

revoke all on public.work_likes from anon, authenticated;
grant select, insert, delete on public.work_likes to authenticated;

create policy "Users can view their own likes"
  on public.work_likes for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "Users can like approved works"
  on public.work_likes for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.student_works w
      where w.id = work_id and w.visible and w.status = 'approved'
    )
  );

create policy "Users can remove their own likes"
  on public.work_likes for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- The counter is maintained here, never by clients: like_count is not
-- writable by students (guard_student_work) and this function runs as its
-- owner, which the guard lets through.
create or replace function public.sync_like_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.student_works
    set like_count = like_count + 1
    where id = new.work_id;
  else
    update public.student_works
    set like_count = greatest(like_count - 1, 0)
    where id = old.work_id;
  end if;
  return null;
end;
$$;

revoke execute on function public.sync_like_count() from public, anon, authenticated;

create trigger work_likes_sync_count
  after insert or delete on public.work_likes
  for each row execute function public.sync_like_count();

-- ============================================================
-- Notifications
-- ============================================================
create type public.notification_kind as enum ('approved', 'rejected');

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  work_id uuid references public.student_works (id) on delete set null,
  kind public.notification_kind not null,
  work_title text not null,
  reason text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

revoke all on public.notifications from anon, authenticated;
grant select on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;

create policy "Users can view their own notifications"
  on public.notifications for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "Users can mark their own notifications read"
  on public.notifications for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create or replace function public.notify_review()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.submitted_by is not null
     and new.status in ('approved', 'rejected')
     and new.status is distinct from old.status then
    insert into public.notifications (user_id, work_id, kind, work_title, reason)
    values (
      new.submitted_by,
      new.id,
      new.status::text::public.notification_kind,
      new.title,
      new.rejection_reason
    );
  end if;
  return null;
end;
$$;

revoke execute on function public.notify_review() from public, anon, authenticated;

create trigger student_works_notify_review
  after update of status on public.student_works
  for each row execute function public.notify_review();

-- ============================================================
-- Re-approving a rejected work drops the stale rejection reason
-- ============================================================
create or replace function public.stamp_review()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.status is distinct from old.status and (select public.is_admin()) then
    new.reviewed_at := now();
    if new.status <> 'rejected' then
      new.rejection_reason := null;
    end if;
  end if;
  return new;
end;
$$;
