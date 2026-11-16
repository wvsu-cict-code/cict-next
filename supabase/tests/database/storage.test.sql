-- Submissions storage and the student media guard.
-- Everything happens inside one transaction that is rolled back.
begin;
create extension if not exists pgtap with schema extensions;

select plan(16);

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
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub', 'aaaaaaaa-0000-4000-8000-000000000001', 'role', 'authenticated')::text, true);

select throws_ok(
  $$insert into public.student_works (id, title, student, description, category, image_url, image_width, image_height, submitted_by)
    values ('eeeeeeee-0000-4000-8000-000000000010', 'pgtap ext', 'A', 'd', 'digital_art',
            'https://evil.test/a.webp', 10, 10, 'aaaaaaaa-0000-4000-8000-000000000001')$$,
  '42501',
  'media_not_owned',
  'student media must live in their own submissions folder (external URL refused)'
);

select throws_ok(
  $$insert into public.student_works (id, title, student, description, category, image_url, image_width, image_height, submitted_by)
    values ('eeeeeeee-0000-4000-8000-000000000011', 'pgtap other', 'A', 'd', 'digital_art',
            'https://p.test/storage/v1/object/public/submissions/bbbbbbbb-0000-4000-8000-000000000002/eeeeeeee-0000-4000-8000-000000000011/a.webp',
            10, 10, 'aaaaaaaa-0000-4000-8000-000000000001')$$,
  '42501',
  'media_not_owned',
  'student media must live in their own submissions folder (another user''s folder refused)'
);

select lives_ok(
  $$insert into public.student_works (id, title, student, description, category, image_url, image_width, image_height, submitted_by)
    values ('eeeeeeee-0000-4000-8000-000000000012', 'pgtap own', 'A', 'd', 'digital_art',
            'https://p.test/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000012/a.webp',
            10, 10, 'aaaaaaaa-0000-4000-8000-000000000001')$$,
  'student media must live in their own submissions folder (own folder for this work accepted)'
);

select throws_ok(
  $$insert into public.student_works (id, title, student, description, category, image_url, image_width, image_height, submitted_by, youtube_id)
    values ('eeeeeeee-0000-4000-8000-000000000020', 'pgtap youtube_id', 'A', 'd', 'digital_art',
            'https://p.test/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000020/a.webp',
            10, 10, 'aaaaaaaa-0000-4000-8000-000000000001', 'dQw4w9WgXcQ')$$,
  '42501',
  'media_not_owned',
  'students cannot set youtube_id, zoom_url or original_url (youtube_id)'
);

select throws_ok(
  $$insert into public.student_works (id, title, student, description, category, image_url, image_width, image_height, submitted_by, zoom_url)
    values ('eeeeeeee-0000-4000-8000-000000000021', 'pgtap zoom_url', 'A', 'd', 'digital_art',
            'https://p.test/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000021/a.webp',
            10, 10, 'aaaaaaaa-0000-4000-8000-000000000001', 'https://zoom.test/x')$$,
  '42501',
  'media_not_owned',
  'students cannot set youtube_id, zoom_url or original_url (zoom_url)'
);

select throws_ok(
  $$insert into public.student_works (id, title, student, description, category, image_url, image_width, image_height, submitted_by, original_url)
    values ('eeeeeeee-0000-4000-8000-000000000022', 'pgtap original_url', 'A', 'd', 'digital_art',
            'https://p.test/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000022/a.webp',
            10, 10, 'aaaaaaaa-0000-4000-8000-000000000001', 'https://x.test/o.zip')$$,
  '42501',
  'media_not_owned',
  'students cannot set youtube_id, zoom_url or original_url (original_url)'
);

insert into public.student_works (id, title, student, description, category, image_url, image_width, image_height, submitted_by, updated_at)
values ('eeeeeeee-0000-4000-8000-000000000030', 'pgtap stamp', 'A', 'd', 'digital_art',
        'https://p.test/storage/v1/object/public/submissions/aaaaaaaa-0000-4000-8000-000000000001/eeeeeeee-0000-4000-8000-000000000030/a.webp',
        10, 10, 'aaaaaaaa-0000-4000-8000-000000000001', '2000-01-01 00:00:00+00');

select is(
  (select updated_at = now() from public.student_works where id = 'eeeeeeee-0000-4000-8000-000000000030'),
  true,
  'student insert forces updated_at'
);

select * from finish();
rollback;
