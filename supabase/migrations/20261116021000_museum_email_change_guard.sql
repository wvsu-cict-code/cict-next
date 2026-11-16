-- BSEMC virtual museum: accounts stay on @wvsu.edu.ph after sign-up.
-- The before_user_created hook only runs when an account is created, so a
-- student could otherwise sign up with a WVSU address and later change it
-- (updateUser({ email })) to any other address. This trigger refuses that,
-- both for the confirmed email and for a pending email_change.
-- Admins are exempt: app_metadata.cms_admin (set only with the secret key
-- by scripts/create-admin.mjs) or a row in public.admin_users (admins that
-- predate the cms_admin flag).

-- The one WVSU address rule: lowercased and trimmed, the text after the last
-- '@' must be exactly wvsu.edu.ph.
create or replace function public.is_wvsu_email(email text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select position('@' in lower(trim(coalesce(email, '')))) > 0
     and split_part(lower(trim(coalesce(email, ''))), '@', -1) = 'wvsu.edu.ph';
$$;

revoke execute on function public.is_wvsu_email(text) from public, anon, authenticated;
grant execute on function public.is_wvsu_email(text) to supabase_auth_admin;

-- Same behaviour as in 20261116020000_museum_accounts.sql; the domain rule
-- now comes from is_wvsu_email so sign-up and email changes share it.
create or replace function public.restrict_signup_to_wvsu(event jsonb)
returns jsonb
language plpgsql
stable
set search_path = ''
as $$
begin
  if (event->'user'->'app_metadata'->>'cms_admin') = 'true'
     or public.is_wvsu_email(event->'user'->>'email') then
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

create or replace function public.guard_wvsu_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (new.raw_app_meta_data->>'cms_admin') = 'true'
     or exists (select 1 from public.admin_users a where a.user_id = new.id) then
    return new;
  end if;

  if (new.email is distinct from old.email
        and coalesce(new.email, '') <> ''
        and not public.is_wvsu_email(new.email))
     or (new.email_change is distinct from old.email_change
        and coalesce(new.email_change, '') <> ''
        and not public.is_wvsu_email(new.email_change)) then
    raise exception 'Use your WVSU email address (@wvsu.edu.ph).'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke execute on function public.guard_wvsu_email_change() from public, anon, authenticated;

create trigger guard_wvsu_email_change
  before update of email, email_change on auth.users
  for each row execute function public.guard_wvsu_email_change();
