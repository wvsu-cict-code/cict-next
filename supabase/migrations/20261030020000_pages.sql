-- Standalone pages whose text the college edits in the CMS, such as
-- Admissions. Each slug is served by the public route of the same name
-- (admissions → /admissions), so pages are added here together with their
-- route, not created in the CMS.

create table public.pages (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  summary text not null default '',
  body text not null default '',
  status public.post_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger pages_set_updated_at
  before update on public.pages
  for each row execute function public.set_updated_at();

alter table public.pages enable row level security;

create policy "Published pages are public"
  on public.pages for select
  to anon, authenticated
  using (status = 'published');

create policy "Admins can view all pages"
  on public.pages for select
  to authenticated
  using ((select public.is_admin()));

create policy "Admins can update pages"
  on public.pages for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Starts as a draft outline for the admissions office to fill in; until it
-- is published, /admissions points visitors to the college's contact details.
insert into public.pages (slug, title, summary, body) values (
  'admissions',
  'Admissions',
  'How to apply to a CICT program: who can apply, what to prepare, and the key dates for the coming school year.',
  $body$## Who can apply

_Describe who may apply: incoming first-year students, transferees, and graduate applicants for the MIT program._

## Requirements

- _List each document applicants must prepare._

## How to apply

1. _First step, such as taking the WVSU admission test._
2. _Next step._
3. _Final step, such as enrollment._

## Important dates

| Step | Date |
| --- | --- |
| _Application opens_ | _Date_ |
| _Admission test_ | _Date_ |
| _Results released_ | _Date_ |

## Scholarships and financial aid

_Describe scholarships and free tuition options available to CICT students._

## Questions

_Tell applicants whom to contact, with the office email and phone number._$body$
);
