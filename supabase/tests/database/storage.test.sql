-- Submissions storage and the student media guard.
-- Everything happens inside one transaction that is rolled back.
begin;
create extension if not exists pgtap with schema extensions;

select plan(60);

insert into auth.users (instance_id, id, aud, role, email) values
  ('00000000-0000-0000-0000-000000000000', 'aaaaaaaa-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'pgtap-a@wvsu.edu.ph'),
  ('00000000-0000-0000-0000-000000000000', 'bbbbbbbb-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'pgtap-b@wvsu.edu.ph'),
  ('00000000-0000-0000-0000-000000000000', 'cccccccc-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'pgtap-admin@wvsu.edu.ph');

insert into public.admin_users (user_id) values ('cccccccc-0000-4000-8000-000000000003');

-- ------------------------------------------------------------
-- Bucket
-- ------------------------------------------------------------
select results_eq(
  $$select public, file_size_limit, allowed_mime_types
    from storage.buckets where id = 'submissions'$$,
  $$values (true, 20971520::bigint, array['image/webp', 'video/webm', 'audio/webm']::text[])$$,
  'bucket only allows webp and webm'
);

-- ------------------------------------------------------------
-- Object policies
-- ------------------------------------------------------------
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', 'aaaaaaaa-0000-4000-8000-000000000001', 'role', 'authenticated')::text, true);

select lives_ok(
  $$insert into storage.objects (bucket_id, name, owner_id, metadata)
    values ('submissions', 'aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000001/a.webp',
            'aaaaaaaa-0000-4000-8000-000000000001', '{"size": 1000}')$$,
  'a student can insert an object under their own folder'
);

select throws_ok(
  $$insert into storage.objects (bucket_id, name, owner_id, metadata)
    values ('submissions', 'bbbbbbbb-0000-4000-8000-000000000002/eeeeeeee-0000-4000-8000-000000000002/a.webp',
            'aaaaaaaa-0000-4000-8000-000000000001', '{"size": 500}')$$,
  '42501',
  null,
  'a student cannot insert under another user''s folder'
);

-- Storage blocks raw deletes unless this is set (the Storage API sets it)
select set_config('storage.allow_delete_query', 'true', true);

reset role;
-- B's object, seeded as the table owner
insert into storage.objects (bucket_id, name, owner_id, metadata)
values ('submissions', 'bbbbbbbb-0000-4000-8000-000000000002/eeeeeeee-0000-4000-8000-000000000003/b.webp',
        'bbbbbbbb-0000-4000-8000-000000000002', '{"size": 2000}');

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', 'aaaaaaaa-0000-4000-8000-000000000001', 'role', 'authenticated')::text, true);

delete from storage.objects where bucket_id = 'submissions' and name like 'bbbbbbbb-%';

reset role;
select is(
  (select count(*)::int from storage.objects where bucket_id = 'submissions' and name like 'bbbbbbbb-%'),
  1,
  'a student cannot delete another user''s object'
);

set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', 'aaaaaaaa-0000-4000-8000-000000000001', 'role', 'authenticated')::text, true);
select is(
  (select count(*)::int from storage.objects where bucket_id = 'submissions'),
  1,
  'a student sees only their own submission files'
);
delete from storage.objects where bucket_id = 'submissions' and name like 'aaaaaaaa-%';
reset role;
select is(
  (select count(*)::int from storage.objects where bucket_id = 'submissions' and name like 'aaaaaaaa-%'),
  0,
  'a student can delete their own object'
);
insert into storage.objects (bucket_id, name, owner_id, metadata)
values ('submissions', 'aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000001/a.webp',
        'aaaaaaaa-0000-4000-8000-000000000001', '{"size": 1000}');

-- ------------------------------------------------------------
-- Usage report
-- ------------------------------------------------------------
select throws_ok(
  $$select public.submissions_storage_bytes()$$,
  null,
  'not_admin',
  'submissions_storage_bytes refuses non-admins'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', 'cccccccc-0000-4000-8000-000000000003', 'role', 'authenticated')::text, true);

select is(
  (select public.submissions_storage_bytes()),
  3000::bigint,
  'submissions_storage_bytes sums object sizes for admins'
);

delete from storage.objects where bucket_id = 'submissions';

reset role;
select is(
  (select count(*)::int from storage.objects where bucket_id = 'submissions'),
  0,
  'an admin can delete any submission object'
);

-- ------------------------------------------------------------
-- Student media guard
-- ------------------------------------------------------------
reset role;
insert into storage.objects (bucket_id, name, owner_id) values
  ('submissions', 'aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/a.webp', 'aaaaaaaa-0000-4000-8000-000000000001'),
  ('submissions', 'aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/v.webm', 'aaaaaaaa-0000-4000-8000-000000000001'),
  ('submissions', 'aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/s.webm', 'aaaaaaaa-0000-4000-8000-000000000001'),
  ('submissions', 'bbbbbbbb-0000-4000-8000-000000000002/eeeeeeee-0000-4000-8000-000000000040/other.webp', 'bbbbbbbb-0000-4000-8000-000000000002'),
  ('submissions', 'aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000020/a.webp', 'aaaaaaaa-0000-4000-8000-000000000001'),
  ('submissions', 'aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000021/a.webp', 'aaaaaaaa-0000-4000-8000-000000000001'),
  ('submissions', 'aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000022/a.webp', 'aaaaaaaa-0000-4000-8000-000000000001'),
  ('submissions', 'aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000030/a.webp', 'aaaaaaaa-0000-4000-8000-000000000001'),
  ('submissions', 'aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/a/b.webp', 'aaaaaaaa-0000-4000-8000-000000000001');

reset role;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', 'aaaaaaaa-0000-4000-8000-000000000001', 'role', 'authenticated')::text, true);

select throws_ok(
  $$insert into public.student_works (id, title, student, description, category, image_width, image_height, submitted_by, image_url, video_url, audio_url) values ('eeeeeeee-0000-4000-8000-000000000040', 'pgtap media', 'A', 'd', 'sound_design', 10, 10, 'aaaaaaaa-0000-4000-8000-000000000001', 'https://evil.test/image_url.webp', null, 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/s.webm')$$,
  '42501',
  'media_not_owned',
  'insert: image_url external URL refused'
);

select throws_ok(
  $$insert into public.student_works (id, title, student, description, category, image_width, image_height, submitted_by, image_url, video_url, audio_url) values ('eeeeeeee-0000-4000-8000-000000000040', 'pgtap media', 'A', 'd', 'sound_design', 10, 10, 'aaaaaaaa-0000-4000-8000-000000000001', 'https://evil.test/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/a.webp', null, 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/s.webm')$$,
  '42501',
  'media_not_owned',
  'insert: image_url foreign host with the right path refused'
);

select throws_ok(
  $$insert into public.student_works (id, title, student, description, category, image_width, image_height, submitted_by, image_url, video_url, audio_url) values ('eeeeeeee-0000-4000-8000-000000000040', 'pgtap media', 'A', 'd', 'sound_design', 10, 10, 'aaaaaaaa-0000-4000-8000-000000000001', 'https://evil.test/x?/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/', null, 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/s.webm')$$,
  '42501',
  'media_not_owned',
  'insert: image_url right path hidden in a query string refused'
);

select throws_ok(
  $$insert into public.student_works (id, title, student, description, category, image_width, image_height, submitted_by, image_url, video_url, audio_url) values ('eeeeeeee-0000-4000-8000-000000000040', 'pgtap media', 'A', 'd', 'sound_design', 10, 10, 'aaaaaaaa-0000-4000-8000-000000000001', 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/missing.webp', null, 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/s.webm')$$,
  '42501',
  'media_not_owned',
  'insert: image_url file missing from storage refused'
);

select throws_ok(
  $$insert into public.student_works (id, title, student, description, category, image_width, image_height, submitted_by, image_url, video_url, audio_url) values ('eeeeeeee-0000-4000-8000-000000000040', 'pgtap media', 'A', 'd', 'sound_design', 10, 10, 'aaaaaaaa-0000-4000-8000-000000000001', 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/a/b.webp', null, 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/s.webm')$$,
  '42501',
  'media_not_owned',
  'insert: image_url nested path refused'
);

select throws_ok(
  $$insert into public.student_works (id, title, student, description, category, image_width, image_height, submitted_by, image_url, video_url, audio_url) values ('eeeeeeee-0000-4000-8000-000000000040', 'pgtap media', 'A', 'd', 'sound_design', 10, 10, 'aaaaaaaa-0000-4000-8000-000000000001', 'http://127.0.0.1:54321/storage/v1/object/public/submissions/bbbbbbbb-0000-4000-8000-000000000002/eeeeeeee-0000-4000-8000-000000000040/other.webp', null, 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/s.webm')$$,
  '42501',
  'media_not_owned',
  'insert: image_url another user''s folder refused'
);

select throws_ok(
  $$insert into public.student_works (id, title, student, description, category, image_width, image_height, submitted_by, image_url, video_url, audio_url) values ('eeeeeeee-0000-4000-8000-000000000040', 'pgtap media', 'A', 'd', 'sound_design', 10, 10, 'aaaaaaaa-0000-4000-8000-000000000001', 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/a.webp?x=1', null, 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/s.webm')$$,
  '42501',
  'media_not_owned',
  'insert: image_url bad file name refused'
);

select throws_ok(
  $$insert into public.student_works (id, title, student, description, category, image_width, image_height, submitted_by, image_url, video_url, audio_url) values ('eeeeeeee-0000-4000-8000-000000000040', 'pgtap media', 'A', 'd', 'sound_design', 10, 10, 'aaaaaaaa-0000-4000-8000-000000000001', 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/a.webp', 'https://evil.test/video_url.webp', 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/s.webm')$$,
  '42501',
  'media_not_owned',
  'insert: video_url external URL refused'
);

select throws_ok(
  $$insert into public.student_works (id, title, student, description, category, image_width, image_height, submitted_by, image_url, video_url, audio_url) values ('eeeeeeee-0000-4000-8000-000000000040', 'pgtap media', 'A', 'd', 'sound_design', 10, 10, 'aaaaaaaa-0000-4000-8000-000000000001', 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/a.webp', 'https://evil.test/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/v.webm', 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/s.webm')$$,
  '42501',
  'media_not_owned',
  'insert: video_url foreign host with the right path refused'
);

select throws_ok(
  $$insert into public.student_works (id, title, student, description, category, image_width, image_height, submitted_by, image_url, video_url, audio_url) values ('eeeeeeee-0000-4000-8000-000000000040', 'pgtap media', 'A', 'd', 'sound_design', 10, 10, 'aaaaaaaa-0000-4000-8000-000000000001', 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/a.webp', 'https://evil.test/x?/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/', 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/s.webm')$$,
  '42501',
  'media_not_owned',
  'insert: video_url right path hidden in a query string refused'
);

select throws_ok(
  $$insert into public.student_works (id, title, student, description, category, image_width, image_height, submitted_by, image_url, video_url, audio_url) values ('eeeeeeee-0000-4000-8000-000000000040', 'pgtap media', 'A', 'd', 'sound_design', 10, 10, 'aaaaaaaa-0000-4000-8000-000000000001', 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/a.webp', 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/missing.webp', 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/s.webm')$$,
  '42501',
  'media_not_owned',
  'insert: video_url file missing from storage refused'
);

select throws_ok(
  $$insert into public.student_works (id, title, student, description, category, image_width, image_height, submitted_by, image_url, video_url, audio_url) values ('eeeeeeee-0000-4000-8000-000000000040', 'pgtap media', 'A', 'd', 'sound_design', 10, 10, 'aaaaaaaa-0000-4000-8000-000000000001', 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/a.webp', 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/a/b.webp', 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/s.webm')$$,
  '42501',
  'media_not_owned',
  'insert: video_url nested path refused'
);

select throws_ok(
  $$insert into public.student_works (id, title, student, description, category, image_width, image_height, submitted_by, image_url, video_url, audio_url) values ('eeeeeeee-0000-4000-8000-000000000040', 'pgtap media', 'A', 'd', 'sound_design', 10, 10, 'aaaaaaaa-0000-4000-8000-000000000001', 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/a.webp', 'http://127.0.0.1:54321/storage/v1/object/public/submissions/bbbbbbbb-0000-4000-8000-000000000002/eeeeeeee-0000-4000-8000-000000000040/other.webp', 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/s.webm')$$,
  '42501',
  'media_not_owned',
  'insert: video_url another user''s folder refused'
);

select throws_ok(
  $$insert into public.student_works (id, title, student, description, category, image_width, image_height, submitted_by, image_url, video_url, audio_url) values ('eeeeeeee-0000-4000-8000-000000000040', 'pgtap media', 'A', 'd', 'sound_design', 10, 10, 'aaaaaaaa-0000-4000-8000-000000000001', 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/a.webp', 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/a.webp?x=1', 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/s.webm')$$,
  '42501',
  'media_not_owned',
  'insert: video_url bad file name refused'
);

select throws_ok(
  $$insert into public.student_works (id, title, student, description, category, image_width, image_height, submitted_by, image_url, video_url, audio_url) values ('eeeeeeee-0000-4000-8000-000000000040', 'pgtap media', 'A', 'd', 'sound_design', 10, 10, 'aaaaaaaa-0000-4000-8000-000000000001', 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/a.webp', null, 'https://evil.test/audio_url.webp')$$,
  '42501',
  'media_not_owned',
  'insert: audio_url external URL refused'
);

select throws_ok(
  $$insert into public.student_works (id, title, student, description, category, image_width, image_height, submitted_by, image_url, video_url, audio_url) values ('eeeeeeee-0000-4000-8000-000000000040', 'pgtap media', 'A', 'd', 'sound_design', 10, 10, 'aaaaaaaa-0000-4000-8000-000000000001', 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/a.webp', null, 'https://evil.test/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/s.webm')$$,
  '42501',
  'media_not_owned',
  'insert: audio_url foreign host with the right path refused'
);

select throws_ok(
  $$insert into public.student_works (id, title, student, description, category, image_width, image_height, submitted_by, image_url, video_url, audio_url) values ('eeeeeeee-0000-4000-8000-000000000040', 'pgtap media', 'A', 'd', 'sound_design', 10, 10, 'aaaaaaaa-0000-4000-8000-000000000001', 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/a.webp', null, 'https://evil.test/x?/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/')$$,
  '42501',
  'media_not_owned',
  'insert: audio_url right path hidden in a query string refused'
);

select throws_ok(
  $$insert into public.student_works (id, title, student, description, category, image_width, image_height, submitted_by, image_url, video_url, audio_url) values ('eeeeeeee-0000-4000-8000-000000000040', 'pgtap media', 'A', 'd', 'sound_design', 10, 10, 'aaaaaaaa-0000-4000-8000-000000000001', 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/a.webp', null, 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/missing.webp')$$,
  '42501',
  'media_not_owned',
  'insert: audio_url file missing from storage refused'
);

select throws_ok(
  $$insert into public.student_works (id, title, student, description, category, image_width, image_height, submitted_by, image_url, video_url, audio_url) values ('eeeeeeee-0000-4000-8000-000000000040', 'pgtap media', 'A', 'd', 'sound_design', 10, 10, 'aaaaaaaa-0000-4000-8000-000000000001', 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/a.webp', null, 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/a/b.webp')$$,
  '42501',
  'media_not_owned',
  'insert: audio_url nested path refused'
);

select throws_ok(
  $$insert into public.student_works (id, title, student, description, category, image_width, image_height, submitted_by, image_url, video_url, audio_url) values ('eeeeeeee-0000-4000-8000-000000000040', 'pgtap media', 'A', 'd', 'sound_design', 10, 10, 'aaaaaaaa-0000-4000-8000-000000000001', 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/a.webp', null, 'http://127.0.0.1:54321/storage/v1/object/public/submissions/bbbbbbbb-0000-4000-8000-000000000002/eeeeeeee-0000-4000-8000-000000000040/other.webp')$$,
  '42501',
  'media_not_owned',
  'insert: audio_url another user''s folder refused'
);

select throws_ok(
  $$insert into public.student_works (id, title, student, description, category, image_width, image_height, submitted_by, image_url, video_url, audio_url) values ('eeeeeeee-0000-4000-8000-000000000040', 'pgtap media', 'A', 'd', 'sound_design', 10, 10, 'aaaaaaaa-0000-4000-8000-000000000001', 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/a.webp', null, 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/a.webp?x=1')$$,
  '42501',
  'media_not_owned',
  'insert: audio_url bad file name refused'
);

select lives_ok(
  $$insert into public.student_works (id, title, student, description, category, image_width, image_height, submitted_by, image_url, video_url, audio_url) values ('eeeeeeee-0000-4000-8000-000000000040', 'pgtap media', 'A', 'd', 'sound_design', 10, 10, 'aaaaaaaa-0000-4000-8000-000000000001', 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/a.webp', 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/v.webm', 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/s.webm')$$,
  'insert: a correct own-folder URL for an existing object is accepted'
);

select throws_ok(
  $$update public.student_works set image_url = 'https://evil.test/image_url.webp' where id = 'eeeeeeee-0000-4000-8000-000000000040'$$,
  '42501',
  'media_not_owned',
  'update: image_url external URL refused'
);

select throws_ok(
  $$update public.student_works set image_url = 'https://evil.test/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/a.webp' where id = 'eeeeeeee-0000-4000-8000-000000000040'$$,
  '42501',
  'media_not_owned',
  'update: image_url foreign host with the right path refused'
);

select throws_ok(
  $$update public.student_works set image_url = 'https://evil.test/x?/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/' where id = 'eeeeeeee-0000-4000-8000-000000000040'$$,
  '42501',
  'media_not_owned',
  'update: image_url right path hidden in a query string refused'
);

select throws_ok(
  $$update public.student_works set image_url = 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/missing.webp' where id = 'eeeeeeee-0000-4000-8000-000000000040'$$,
  '42501',
  'media_not_owned',
  'update: image_url file missing from storage refused'
);

select throws_ok(
  $$update public.student_works set image_url = 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/a/b.webp' where id = 'eeeeeeee-0000-4000-8000-000000000040'$$,
  '42501',
  'media_not_owned',
  'update: image_url nested path refused'
);

select throws_ok(
  $$update public.student_works set image_url = 'http://127.0.0.1:54321/storage/v1/object/public/submissions/bbbbbbbb-0000-4000-8000-000000000002/eeeeeeee-0000-4000-8000-000000000040/other.webp' where id = 'eeeeeeee-0000-4000-8000-000000000040'$$,
  '42501',
  'media_not_owned',
  'update: image_url another user''s folder refused'
);

select throws_ok(
  $$update public.student_works set image_url = 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/a.webp?x=1' where id = 'eeeeeeee-0000-4000-8000-000000000040'$$,
  '42501',
  'media_not_owned',
  'update: image_url bad file name refused'
);

select throws_ok(
  $$update public.student_works set video_url = 'https://evil.test/video_url.webp' where id = 'eeeeeeee-0000-4000-8000-000000000040'$$,
  '42501',
  'media_not_owned',
  'update: video_url external URL refused'
);

select throws_ok(
  $$update public.student_works set video_url = 'https://evil.test/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/v.webm' where id = 'eeeeeeee-0000-4000-8000-000000000040'$$,
  '42501',
  'media_not_owned',
  'update: video_url foreign host with the right path refused'
);

select throws_ok(
  $$update public.student_works set video_url = 'https://evil.test/x?/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/' where id = 'eeeeeeee-0000-4000-8000-000000000040'$$,
  '42501',
  'media_not_owned',
  'update: video_url right path hidden in a query string refused'
);

select throws_ok(
  $$update public.student_works set video_url = 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/missing.webp' where id = 'eeeeeeee-0000-4000-8000-000000000040'$$,
  '42501',
  'media_not_owned',
  'update: video_url file missing from storage refused'
);

select throws_ok(
  $$update public.student_works set video_url = 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/a/b.webp' where id = 'eeeeeeee-0000-4000-8000-000000000040'$$,
  '42501',
  'media_not_owned',
  'update: video_url nested path refused'
);

select throws_ok(
  $$update public.student_works set video_url = 'http://127.0.0.1:54321/storage/v1/object/public/submissions/bbbbbbbb-0000-4000-8000-000000000002/eeeeeeee-0000-4000-8000-000000000040/other.webp' where id = 'eeeeeeee-0000-4000-8000-000000000040'$$,
  '42501',
  'media_not_owned',
  'update: video_url another user''s folder refused'
);

select throws_ok(
  $$update public.student_works set video_url = 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/a.webp?x=1' where id = 'eeeeeeee-0000-4000-8000-000000000040'$$,
  '42501',
  'media_not_owned',
  'update: video_url bad file name refused'
);

select throws_ok(
  $$update public.student_works set audio_url = 'https://evil.test/audio_url.webp' where id = 'eeeeeeee-0000-4000-8000-000000000040'$$,
  '42501',
  'media_not_owned',
  'update: audio_url external URL refused'
);

select throws_ok(
  $$update public.student_works set audio_url = 'https://evil.test/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/s.webm' where id = 'eeeeeeee-0000-4000-8000-000000000040'$$,
  '42501',
  'media_not_owned',
  'update: audio_url foreign host with the right path refused'
);

select throws_ok(
  $$update public.student_works set audio_url = 'https://evil.test/x?/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/' where id = 'eeeeeeee-0000-4000-8000-000000000040'$$,
  '42501',
  'media_not_owned',
  'update: audio_url right path hidden in a query string refused'
);

select throws_ok(
  $$update public.student_works set audio_url = 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/missing.webp' where id = 'eeeeeeee-0000-4000-8000-000000000040'$$,
  '42501',
  'media_not_owned',
  'update: audio_url file missing from storage refused'
);

select throws_ok(
  $$update public.student_works set audio_url = 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/a/b.webp' where id = 'eeeeeeee-0000-4000-8000-000000000040'$$,
  '42501',
  'media_not_owned',
  'update: audio_url nested path refused'
);

select throws_ok(
  $$update public.student_works set audio_url = 'http://127.0.0.1:54321/storage/v1/object/public/submissions/bbbbbbbb-0000-4000-8000-000000000002/eeeeeeee-0000-4000-8000-000000000040/other.webp' where id = 'eeeeeeee-0000-4000-8000-000000000040'$$,
  '42501',
  'media_not_owned',
  'update: audio_url another user''s folder refused'
);

select throws_ok(
  $$update public.student_works set audio_url = 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/a.webp?x=1' where id = 'eeeeeeee-0000-4000-8000-000000000040'$$,
  '42501',
  'media_not_owned',
  'update: audio_url bad file name refused'
);

select lives_ok(
  $$update public.student_works set video_url = 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/v.webm' where id = 'eeeeeeee-0000-4000-8000-000000000040'$$,
  'update: a correct own-folder URL for an existing object is accepted'
);

select lives_ok(
  $$update public.student_works set image_url = 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/a.webp' where id = 'eeeeeeee-0000-4000-8000-000000000040'$$,
  'update: re-saving the image is accepted'
);

reset role;
delete from public.museum_config;
reset role;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', 'aaaaaaaa-0000-4000-8000-000000000001', 'role', 'authenticated')::text, true);

select throws_ok(
  $$insert into public.student_works (id, title, student, description, category, image_width, image_height, submitted_by, image_url, video_url, audio_url) values ('eeeeeeee-0000-4000-8000-000000000041', 'pgtap media', 'A', 'd', 'sound_design', 10, 10, 'aaaaaaaa-0000-4000-8000-000000000001', 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/a.webp', null, 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000040/s.webm')$$,
  '42501',
  'media_not_owned',
  'insert: with no museum_config even a correct URL is refused'
);

select throws_ok(
  $$update public.student_works set title = 'pgtap x' where id = 'eeeeeeee-0000-4000-8000-000000000040'$$,
  '42501',
  'media_not_owned',
  'update: with no museum_config even a correct URL is refused'
);

reset role;
insert into public.museum_config (storage_origin) values ('http://127.0.0.1:54321');
reset role;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', 'aaaaaaaa-0000-4000-8000-000000000001', 'role', 'authenticated')::text, true);

select throws_ok(
  $$insert into public.student_works (id, title, student, description, category, image_url, image_width, image_height, submitted_by, youtube_id) values ('eeeeeeee-0000-4000-8000-000000000020', 'pgtap youtube_id', 'A', 'd', 'digital_art', 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000020/a.webp', 10, 10, 'aaaaaaaa-0000-4000-8000-000000000001', 'dQw4w9WgXcQ')$$,
  '42501',
  'media_not_owned',
  'students cannot set youtube_id, zoom_url or original_url (youtube_id)'
);

select throws_ok(
  $$insert into public.student_works (id, title, student, description, category, image_url, image_width, image_height, submitted_by, zoom_url) values ('eeeeeeee-0000-4000-8000-000000000021', 'pgtap zoom_url', 'A', 'd', 'digital_art', 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000021/a.webp', 10, 10, 'aaaaaaaa-0000-4000-8000-000000000001', 'https://zoom.test/x')$$,
  '42501',
  'media_not_owned',
  'students cannot set youtube_id, zoom_url or original_url (zoom_url)'
);

select throws_ok(
  $$insert into public.student_works (id, title, student, description, category, image_url, image_width, image_height, submitted_by, original_url) values ('eeeeeeee-0000-4000-8000-000000000022', 'pgtap original_url', 'A', 'd', 'digital_art', 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000022/a.webp', 10, 10, 'aaaaaaaa-0000-4000-8000-000000000001', 'https://x.test/o.zip')$$,
  '42501',
  'media_not_owned',
  'students cannot set youtube_id, zoom_url or original_url (original_url)'
);

insert into public.student_works (id, title, student, description, category, image_url, image_width, image_height, submitted_by, updated_at)
values ('eeeeeeee-0000-4000-8000-000000000030', 'pgtap stamp', 'A', 'd', 'digital_art', 'http://127.0.0.1:54321/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000030/a.webp', 10, 10, 'aaaaaaaa-0000-4000-8000-000000000001', '2000-01-01 00:00:00+00');

select is(
  (select updated_at = now() from public.student_works where id = 'eeeeeeee-0000-4000-8000-000000000030'),
  true,
  'student insert forces updated_at'
);

select * from finish();
rollback;
