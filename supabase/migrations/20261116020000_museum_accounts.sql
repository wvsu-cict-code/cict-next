-- BSEMC virtual museum: student accounts.
--   * public.profiles holds each account's display name, created by a
--     trigger on auth.users (and backfilled for accounts that already exist).
--   * public.restrict_signup_to_wvsu is a "before user created" auth hook:
--     only @wvsu.edu.ph addresses may sign up, except admins created by
--     scripts/create-admin.mjs (app_metadata.cms_admin = true, which only the
--     service-role key can set).

-- ============================================================
-- Profiles
-- ============================================================
create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

-- Own row only; the only column a user may change is display_name.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;

create policy "Users can view their own profile"
  on public.profiles for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Display name chosen at sign-up (user_metadata.display_name), or the
-- email's local part. Clipped to the column's 80-character limit so an
-- over-long name can never make account creation fail.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (
    new.id,
    left(
      coalesce(
        nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
        split_part(new.email, '@', 1)
      ),
      80
    )
  );
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Accounts that existed before this migration get a profile by the same rule.
insert into public.profiles (user_id, display_name)
select
  u.id,
  left(
    coalesce(
      nullif(trim(u.raw_user_meta_data->>'display_name'), ''),
      split_part(u.email, '@', 1)
    ),
    80
  )
from auth.users u
on conflict (user_id) do nothing;

-- ============================================================
-- Before User Created hook: WVSU addresses only
-- ============================================================
-- Payload: event->'user' is the user about to be created. Return '{}' to
-- allow it, or an error object to refuse it. user_metadata is chosen by the
-- person signing up, so only app_metadata can mark an admin.
create or replace function public.restrict_signup_to_wvsu(event jsonb)
returns jsonb
language plpgsql
stable
set search_path = ''
as $$
declare
  email text := lower(trim(coalesce(event->'user'->>'email', '')));
begin
  if (event->'user'->'app_metadata'->>'cms_admin') = 'true' then
    return '{}'::jsonb;
  end if;

  if position('@' in email) > 0 and split_part(email, '@', -1) = 'wvsu.edu.ph' then
    return '{}'::jsonb;
  end if;

  return jsonb_build_object(
    'error', jsonb_build_object(
      'http_code', 403,
      'message', 'Use your WVSU email address (@wvsu.edu.ph) to sign up.'
    )
  );
end;
$$;

grant execute on function public.restrict_signup_to_wvsu(jsonb) to supabase_auth_admin;
revoke execute on function public.restrict_signup_to_wvsu(jsonb) from public, anon, authenticated;
