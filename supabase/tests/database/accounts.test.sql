-- Profiles and the WVSU-only "before user created" auth hook.
-- Run with `npm run test:db`; everything happens inside one transaction that
-- is rolled back, so the rows below never reach the database.
begin;
create extension if not exists pgtap with schema extensions;

select plan(20);

-- Checked before this file adds users: the migration backfilled a profile
-- for every account that existed before the profiles table.
select is(
  (select count(*) from auth.users u
   where not exists (select 1 from public.profiles p where p.user_id = u.id)),
  0::bigint,
  'every existing user has a profile'
);

-- ------------------------------------------------------------
-- restrict_signup_to_wvsu(event): called directly with hook payloads
-- ------------------------------------------------------------
select is(
  public.restrict_signup_to_wvsu(
    '{"user": {"email": "Juan.Cruz@WVSU.edu.ph ", "app_metadata": {}, "user_metadata": {}}}'::jsonb
  ),
  '{}'::jsonb,
  'wvsu address is allowed'
);

select is(
  public.restrict_signup_to_wvsu(
    '{"user": {"email": "juan@gmail.com", "app_metadata": {}, "user_metadata": {}}}'::jsonb
  ),
  '{"error": {"http_code": 403, "message": "Use your WVSU email address (@wvsu.edu.ph) to sign up."}}'::jsonb,
  'other domains are refused with http_code 403'
);

select is(
  array[
    public.restrict_signup_to_wvsu('{"user": {"email": "a@wvsu.edu.ph.evil.com", "app_metadata": {}, "user_metadata": {}}}'::jsonb)->'error'->>'http_code',
    public.restrict_signup_to_wvsu('{"user": {"email": "a@notwvsu.edu.ph", "app_metadata": {}, "user_metadata": {}}}'::jsonb)->'error'->>'http_code',
    public.restrict_signup_to_wvsu('{"user": {"email": "a@student.wvsu.edu.ph", "app_metadata": {}, "user_metadata": {}}}'::jsonb)->'error'->>'http_code'
  ],
  array['403', '403', '403'],
  'look-alike domains are refused'
);

select is(
  public.restrict_signup_to_wvsu(
    '{"user": {"email": "wvsu.edu.ph", "app_metadata": {}, "user_metadata": {}}}'::jsonb
  )->'error'->>'http_code',
  '403',
  'an address without an @ is refused'
);

select is(
  public.restrict_signup_to_wvsu(
    '{"user": {"email": "admin@example.com", "app_metadata": {"cms_admin": true}, "user_metadata": {}}}'::jsonb
  ),
  '{}'::jsonb,
  'cms_admin app_metadata is allowed for any domain'
);

select is(
  public.restrict_signup_to_wvsu(
    '{"user": {"email": "admin@example.com", "app_metadata": {}, "user_metadata": {"cms_admin": true}}}'::jsonb
  )->'error'->>'http_code',
  '403',
  'user_metadata cms_admin does not bypass'
);

select ok(
  not has_function_privilege('anon', 'public.restrict_signup_to_wvsu(jsonb)', 'execute')
  and not has_function_privilege('authenticated', 'public.restrict_signup_to_wvsu(jsonb)', 'execute')
  and has_function_privilege('supabase_auth_admin', 'public.restrict_signup_to_wvsu(jsonb)', 'execute'),
  'only supabase_auth_admin can execute the hook'
);

-- ------------------------------------------------------------
-- Profiles
-- ------------------------------------------------------------
insert into auth.users (instance_id, id, aud, role, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-000000000000', 'aaaaaaaa-0000-4000-8000-000000000001', 'authenticated', 'authenticated',
   'pgtap-a@wvsu.edu.ph', '{"display_name": "  Juan Cruz  "}'),
  ('00000000-0000-0000-0000-000000000000', 'bbbbbbbb-0000-4000-8000-000000000002', 'authenticated', 'authenticated',
   'pgtap-b@wvsu.edu.ph', '{"display_name": "   "}');

select is(
  (select display_name from public.profiles where user_id = 'aaaaaaaa-0000-4000-8000-000000000001'),
  'Juan Cruz',
  'new auth user gets a profile with their display name'
);

select is(
  (select display_name from public.profiles where user_id = 'bbbbbbbb-0000-4000-8000-000000000002'),
  'pgtap-b',
  'profile falls back to the email''s local part'
);

-- As user A
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', 'aaaaaaaa-0000-4000-8000-000000000001', 'role', 'authenticated')::text, true);

select is(
  (select array_agg(user_id) from public.profiles),
  array['aaaaaaaa-0000-4000-8000-000000000001'::uuid],
  'a user cannot read another user''s profile'
);

update public.profiles set display_name = 'Team Aurora' where user_id = 'aaaaaaaa-0000-4000-8000-000000000001';
update public.profiles set display_name = 'hijacked' where user_id = 'bbbbbbbb-0000-4000-8000-000000000002';

select throws_ok(
  $$update public.profiles set user_id = 'bbbbbbbb-0000-4000-8000-000000000002' where user_id = 'aaaaaaaa-0000-4000-8000-000000000001'$$,
  '42501',
  null,
  'a user cannot change their profile''s user_id'
);

reset role;

select is(
  (select display_name from public.profiles where user_id = 'aaaaaaaa-0000-4000-8000-000000000001'),
  'Team Aurora',
  'a user can update their own display name'
);

select is(
  (select display_name from public.profiles where user_id = 'bbbbbbbb-0000-4000-8000-000000000002'),
  'pgtap-b',
  'a user cannot update another user''s profile'
);

-- ------------------------------------------------------------
-- Email changes stay on @wvsu.edu.ph (guard_wvsu_email_change)
-- ------------------------------------------------------------
insert into auth.users (instance_id, id, aud, role, email, raw_app_meta_data) values
  ('00000000-0000-0000-0000-000000000000', 'cccccccc-0000-4000-8000-000000000003', 'authenticated', 'authenticated',
   'pgtap-admin@example.com', '{}'),
  ('00000000-0000-0000-0000-000000000000', 'dddddddd-0000-4000-8000-000000000004', 'authenticated', 'authenticated',
   'pgtap-cms@example.com', '{"cms_admin": true}');
insert into public.admin_users (user_id) values ('cccccccc-0000-4000-8000-000000000003');

select throws_ok(
  $$update auth.users set email = 'pgtap-a@gmail.com' where id = 'aaaaaaaa-0000-4000-8000-000000000001'$$,
  '42501',
  'Use your WVSU email address (@wvsu.edu.ph).',
  'a student cannot change their email to gmail'
);

select throws_ok(
  $$update auth.users set email_change = 'pgtap-a@gmail.com' where id = 'aaaaaaaa-0000-4000-8000-000000000001'$$,
  '42501',
  'Use your WVSU email address (@wvsu.edu.ph).',
  'a pending email_change to gmail is refused'
);

select lives_ok(
  $$update auth.users set email_change = 'pgtap-a2@WVSU.edu.ph', email = 'pgtap-a3@wvsu.edu.ph' where id = 'aaaaaaaa-0000-4000-8000-000000000001'$$,
  'a student can change to another wvsu address'
);

select lives_ok(
  $$update auth.users set email_change = '', last_sign_in_at = now() where id = 'aaaaaaaa-0000-4000-8000-000000000001'$$,
  'clearing a pending email_change is allowed'
);

select lives_ok(
  $$update auth.users set email = 'pgtap-admin2@gmail.com', email_change = 'pgtap-admin3@gmail.com' where id = 'cccccccc-0000-4000-8000-000000000003'$$,
  'an admin can change to any address'
);

select lives_ok(
  $$update auth.users set email = 'pgtap-cms2@gmail.com' where id = 'dddddddd-0000-4000-8000-000000000004'$$,
  'a cms_admin account can change to any address'
);

select * from finish();
rollback;
