-- Likes, like counts and review notifications.
-- Run with `npm run test:db`; everything happens inside one transaction that
-- is rolled back, so the rows below never reach the database.
begin;
create extension if not exists pgtap with schema extensions;

select plan(14);

-- Setup: student A, student B and an admin
insert into auth.users (instance_id, id, aud, role, email) values
  ('00000000-0000-0000-0000-000000000000', 'aaaaaaaa-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'pgtap-a@wvsu.edu.ph'),
  ('00000000-0000-0000-0000-000000000000', 'bbbbbbbb-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'pgtap-b@wvsu.edu.ph'),
  ('00000000-0000-0000-0000-000000000000', 'cccccccc-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'pgtap-admin@wvsu.edu.ph');

insert into public.admin_users (user_id) values ('cccccccc-0000-4000-8000-000000000003');

-- Seeded as the table owner, so the guard trigger lets every value through
insert into public.student_works
  (id, title, student, description, category, image_url, image_width, image_height,
   submitted_by, status, rejection_reason, visible, sort_order)
values
  ('11111111-0000-4000-8000-000000000001', 'pgtap approved', 'B', 'd', 'digital_art', 'https://cdn.test/1.webp', 10, 10,
   'bbbbbbbb-0000-4000-8000-000000000002', 'approved', null, true, 0),
  ('11111111-0000-4000-8000-000000000002', 'pgtap pending', 'B', 'd', 'digital_art', 'https://cdn.test/2.webp', 10, 10,
   'bbbbbbbb-0000-4000-8000-000000000002', 'pending', null, true, 0),
  ('11111111-0000-4000-8000-000000000003', 'pgtap to reject', 'B', 'd', 'digital_art', 'https://cdn.test/3.webp', 10, 10,
   'bbbbbbbb-0000-4000-8000-000000000002', 'pending', null, true, 0),
  ('11111111-0000-4000-8000-000000000004', 'pgtap admin work', 'Admin', 'd', 'digital_art', 'https://cdn.test/4.webp', 10, 10,
   null, 'pending', null, true, 0),
  ('11111111-0000-4000-8000-000000000005', 'pgtap rejected', 'B', 'd', 'digital_art', 'https://cdn.test/5.webp', 10, 10,
   'bbbbbbbb-0000-4000-8000-000000000002', 'rejected', 'Blurry', true, 0);

-- ------------------------------------------------------------
-- Likes (as student A)
-- ------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', 'aaaaaaaa-0000-4000-8000-000000000001', 'role', 'authenticated')::text, true);

select lives_ok(
  $$insert into public.work_likes (work_id) values ('11111111-0000-4000-8000-000000000001')$$,
  'a signed-in user can like an approved work'
);

select throws_ok(
  $$insert into public.work_likes (work_id) values ('11111111-0000-4000-8000-000000000001')$$,
  '23505',
  null,
  'a second like of the same work is a unique violation'
);

select is(
  (select like_count from public.student_works where id = '11111111-0000-4000-8000-000000000001'),
  1,
  'liking increments like_count'
);

delete from public.work_likes where work_id = '11111111-0000-4000-8000-000000000001';

select is(
  (select like_count from public.student_works where id = '11111111-0000-4000-8000-000000000001'),
  0,
  'unliking decrements like_count'
);

select throws_ok(
  $$insert into public.work_likes (work_id) values ('11111111-0000-4000-8000-000000000002')$$,
  '42501',
  null,
  'liking a pending work is refused'
);

-- B likes the approved work too; A must not see it
insert into public.work_likes (work_id, user_id) values ('11111111-0000-4000-8000-000000000001', 'aaaaaaaa-0000-4000-8000-000000000001');

reset role;
insert into public.work_likes (work_id, user_id) values ('11111111-0000-4000-8000-000000000001', 'bbbbbbbb-0000-4000-8000-000000000002');
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', 'aaaaaaaa-0000-4000-8000-000000000001', 'role', 'authenticated')::text, true);

select is(
  (select count(*)::int from public.work_likes),
  1,
  'a user sees only their own likes'
);

reset role;
set local role anon;
select set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);

select throws_ok(
  $$insert into public.work_likes (work_id, user_id) values ('11111111-0000-4000-8000-000000000001', 'aaaaaaaa-0000-4000-8000-000000000001')$$,
  '42501',
  null,
  'anon cannot like'
);

-- ------------------------------------------------------------
-- Review notifications (as the admin)
-- ------------------------------------------------------------
reset role;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', 'cccccccc-0000-4000-8000-000000000003', 'role', 'authenticated')::text, true);

update public.student_works set status = 'approved' where id = '11111111-0000-4000-8000-000000000002';

-- Notifications are read as the table owner: admins have no read policy
reset role;
select results_eq(
  $$select user_id, kind::text, work_title, reason, read_at is null, work_id
    from public.notifications where work_id = '11111111-0000-4000-8000-000000000002'$$,
  $$select 'bbbbbbbb-0000-4000-8000-000000000002'::uuid, 'approved', 'pgtap pending', null::text, true,
           '11111111-0000-4000-8000-000000000002'::uuid$$,
  'approving a submission notifies its student'
);

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', 'cccccccc-0000-4000-8000-000000000003', 'role', 'authenticated')::text, true);
update public.student_works
  set status = 'rejected', rejection_reason = 'Too dark'
  where id = '11111111-0000-4000-8000-000000000003';
update public.student_works set status = 'approved' where id = '11111111-0000-4000-8000-000000000004';

reset role;
select results_eq(
  $$select kind::text, reason from public.notifications where work_id = '11111111-0000-4000-8000-000000000003'$$,
  $$values ('rejected', 'Too dark')$$,
  'rejecting notifies with the reason'
);

-- Checked as the table owner, which sees every row
select is(
  (select count(*)::int from public.notifications where work_id = '11111111-0000-4000-8000-000000000004'),
  0,
  'admin-created works produce no notification'
);
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', 'cccccccc-0000-4000-8000-000000000003', 'role', 'authenticated')::text, true);

-- ------------------------------------------------------------
-- Re-approval clears the reason
-- ------------------------------------------------------------
update public.student_works set status = 'approved' where id = '11111111-0000-4000-8000-000000000005';

select results_eq(
  $$select status::text, rejection_reason from public.student_works where id = '11111111-0000-4000-8000-000000000005'$$,
  $$values ('approved', null::text)$$,
  'approving a previously rejected work clears its rejection_reason'
);

-- ------------------------------------------------------------
-- Reading notifications
-- ------------------------------------------------------------
reset role;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', 'aaaaaaaa-0000-4000-8000-000000000001', 'role', 'authenticated')::text, true);

select is(
  (select count(*)::int from public.notifications),
  0,
  'a user cannot read another user''s notifications'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', 'bbbbbbbb-0000-4000-8000-000000000002', 'role', 'authenticated')::text, true);

update public.notifications set read_at = now() where work_id = '11111111-0000-4000-8000-000000000002';

select isnt(
  (select read_at from public.notifications where work_id = '11111111-0000-4000-8000-000000000002'),
  null,
  'a user can set read_at on their own notification'
);

select throws_ok(
  $$update public.notifications set work_title = 'hijacked' where work_id = '11111111-0000-4000-8000-000000000002'$$,
  '42501',
  null,
  'a user cannot change work_title'
);

select * from finish();
rollback;
