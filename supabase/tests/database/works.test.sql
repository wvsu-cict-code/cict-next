-- Student works: categories, review status, and what students may write.
-- Run with `npm run test:db`; everything happens inside one transaction that
-- is rolled back, so the rows below never reach the database.
begin;
create extension if not exists pgtap with schema extensions;

select plan(17);

-- ------------------------------------------------------------
-- Setup: student A, student B and an admin
-- ------------------------------------------------------------
insert into auth.users (instance_id, id, aud, role, email) values
  ('00000000-0000-0000-0000-000000000000', 'aaaaaaaa-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'pgtap-a@wvsu.edu.ph'),
  ('00000000-0000-0000-0000-000000000000', 'bbbbbbbb-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'pgtap-b@wvsu.edu.ph'),
  ('00000000-0000-0000-0000-000000000000', 'cccccccc-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'pgtap-admin@wvsu.edu.ph');

insert into public.admin_users (user_id) values ('cccccccc-0000-4000-8000-000000000003');

-- Seeded as the table owner, so the guard trigger lets every value through
insert into public.student_works
  (title, student, description, category, image_url, image_width, image_height,
   submitted_by, status, rejection_reason, visible, like_count, featured, sort_order)
values
  ('pgtap pending', 'B', 'd', 'digital_art', 'https://cdn.test/1.webp', 10, 10,
   'bbbbbbbb-0000-4000-8000-000000000002', 'pending', null, true, 0, false, 0),
  ('pgtap rejected', 'B', 'd', 'digital_art', 'https://cdn.test/2.webp', 10, 10,
   'bbbbbbbb-0000-4000-8000-000000000002', 'rejected', 'Blurry', true, 0, false, 0),
  ('pgtap hidden', 'B', 'd', 'digital_art', 'https://cdn.test/3.webp', 10, 10,
   'bbbbbbbb-0000-4000-8000-000000000002', 'approved', null, false, 0, false, 0),
  ('pgtap visible', 'B', 'd', 'digital_art', 'https://cdn.test/4.webp', 10, 10,
   'bbbbbbbb-0000-4000-8000-000000000002', 'approved', null, true, 0, false, 0),
  ('pgtap A approved', 'A', 'd', 'digital_art', 'https://cdn.test/5.webp', 10, 10,
   'aaaaaaaa-0000-4000-8000-000000000001', 'approved', null, true, 7, true, 3);

-- ------------------------------------------------------------
-- Reading
-- ------------------------------------------------------------
set local role anon;
select set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);

select is(
  (select count(*)::int from public.student_works where title like 'pgtap %' and student = 'B'),
  1,
  'anon sees only visible approved works'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', 'aaaaaaaa-0000-4000-8000-000000000001', 'role', 'authenticated')::text, true);

select is(
  (select count(*)::int from public.student_works where title = 'pgtap pending'),
  0,
  'student cannot read another student''s pending work'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', 'bbbbbbbb-0000-4000-8000-000000000002', 'role', 'authenticated')::text, true);

select is(
  (select count(*)::int from public.student_works where title like 'pgtap %' and student = 'B'),
  4,
  'student reads all of their own works, whatever the status'
);

-- ------------------------------------------------------------
-- Student writes (as student A)
-- ------------------------------------------------------------
reset role;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', 'aaaaaaaa-0000-4000-8000-000000000001', 'role', 'authenticated')::text, true);

insert into public.student_works
  (title, student, description, category, image_url, image_width, image_height,
   submitted_by, status, featured, like_count, visible, rejection_reason, reviewed_at)
values
  ('pgtap A insert', 'A', 'd', 'digital_art', 'https://cdn.test/6.webp', 10, 10,
   'aaaaaaaa-0000-4000-8000-000000000001', 'approved', true, 99, false, 'x', now());

select results_eq(
  $$select status::text, featured, like_count, visible, rejection_reason, reviewed_at is null, submitted_at is not null
    from public.student_works where title = 'pgtap A insert'$$,
  $$values ('pending', false, 0, true, null::text, true, true)$$,
  'student insert is forced to pending and not featured'
);

select throws_ok(
  $$insert into public.student_works (title, student, description, category, image_url, image_width, image_height, submitted_by)
    values ('pgtap A as B', 'A', 'd', 'digital_art', 'https://cdn.test/7.webp', 10, 10, 'bbbbbbbb-0000-4000-8000-000000000002')$$,
  '42501',
  null,
  'student cannot submit a work in another student''s name'
);

update public.student_works
  set title = 'pgtap A edited', status = 'approved', featured = false,
      like_count = 0, visible = false, sort_order = 99
  where title = 'pgtap A approved';

select results_eq(
  $$select status::text, like_count, featured, visible, sort_order, reviewed_at is null
    from public.student_works where title = 'pgtap A edited'$$,
  $$values ('pending', 7, true, true, 3, true)$$,
  'student update of an approved work sends it back to pending and keeps like_count'
);

select throws_ok(
  $$update public.student_works set submitted_by = 'bbbbbbbb-0000-4000-8000-000000000002'
    where title = 'pgtap A edited'$$,
  '42501',
  'submitted_by cannot be changed',
  'student cannot change submitted_by'
);

with changed as (
  update public.student_works set title = 'pgtap hijacked'
  where title = 'pgtap visible'
  returning 1
)
select is(count(*)::int, 0, 'student cannot update another student''s work') from changed;

-- A has two active works; three more reach the quota of five
insert into public.student_works
  (title, student, description, category, image_url, image_width, image_height, submitted_by)
select 'pgtap A quota ' || n, 'A', 'd', 'digital_art', 'https://cdn.test/q.webp', 10, 10,
       'aaaaaaaa-0000-4000-8000-000000000001'
from generate_series(1, 3) n;

select throws_ok(
  $$insert into public.student_works (title, student, description, category, image_url, image_width, image_height, submitted_by)
    values ('pgtap A sixth', 'A', 'd', 'digital_art', 'https://cdn.test/8.webp', 10, 10, 'aaaaaaaa-0000-4000-8000-000000000001')$$,
  'P0001',
  'quota_reached',
  'sixth active submission raises quota_reached'
);

-- An admin rejects one, which frees a slot
reset role;
update public.student_works
  set status = 'rejected', rejection_reason = 'Wrong file'
  where title = 'pgtap A quota 1';

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', 'aaaaaaaa-0000-4000-8000-000000000001', 'role', 'authenticated')::text, true);

select lives_ok(
  $$insert into public.student_works (title, student, description, category, image_url, image_width, image_height, submitted_by)
    values ('pgtap A after reject', 'A', 'd', 'digital_art', 'https://cdn.test/9.webp', 10, 10, 'aaaaaaaa-0000-4000-8000-000000000001')$$,
  'rejected works do not count toward the quota'
);

select throws_ok(
  $$update public.student_works set description = 'fixed' where title = 'pgtap A quota 1'$$,
  'P0001',
  'quota_reached',
  'resubmitting a rejected work over the quota raises quota_reached'
);

-- ------------------------------------------------------------
-- Review (as the admin)
-- ------------------------------------------------------------
reset role;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', 'cccccccc-0000-4000-8000-000000000003', 'role', 'authenticated')::text, true);

update public.student_works set status = 'approved' where title = 'pgtap A insert';

select results_eq(
  $$select status::text, reviewed_at is not null from public.student_works where title = 'pgtap A insert'$$,
  $$values ('approved', true)$$,
  'admin can approve and the row gets reviewed_at'
);

select throws_ok(
  $$update public.student_works set status = 'rejected' where title = 'pgtap A edited'$$,
  '23514',
  null,
  'rejecting without a reason violates the check constraint'
);

reset role;

-- ------------------------------------------------------------
-- Media each category needs
-- ------------------------------------------------------------
select throws_ok(
  $$insert into public.student_works (title, student, description, category, image_url, image_width, image_height)
    values ('pgtap silent', 'A', 'd', 'sound_design', 'https://cdn.test/10.webp', 10, 10)$$,
  '23514',
  null,
  'a sound design work needs an audio file'
);

select lives_ok(
  $$insert into public.student_works (title, student, description, category, video_url, image_url, image_width, image_height, orientation)
    values ('pgtap uploaded film', 'A', 'd', 'animation', 'https://cdn.test/11.webm', 'https://cdn.test/11.webp', 10, 10, 'landscape')$$,
  'an animation can be an uploaded video with a cover instead of a YouTube id'
);

-- ------------------------------------------------------------
-- Types
-- ------------------------------------------------------------
select enum_has_labels(
  'public', 'exhibit_category',
  array['game', 'interactive_media', 'xr_3d', 'digital_art', 'animation', 'short_film', 'sound_design'],
  'exhibit_category has the seven labels in order'
);

select enum_has_labels(
  'public', 'review_status',
  array['pending', 'approved', 'rejected'],
  'review_status has pending, approved and rejected'
);

select * from finish();
rollback;
