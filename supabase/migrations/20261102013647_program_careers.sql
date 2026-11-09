-- Possible careers per program, shown on each program page and edited in the
-- CMS (Programs). Existing RLS on programs already covers the new column:
-- everyone can read, only admins can write.

alter table public.programs
  add column careers text[] not null default '{}';

-- Starting lists for the current programs. Admins can change them in the CMS.
update public.programs set careers = array[
  'Software engineer',
  'Software developer',
  'Data scientist',
  'Machine learning / AI engineer',
  'Systems architect',
  'Computer science researcher',
  'Database administrator',
  'Computer science instructor'
] where id = 'bscs' and careers = '{}';

update public.programs set careers = array[
  'Software developer',
  'Web developer',
  'Mobile app developer',
  'Network administrator',
  'Systems administrator',
  'Cybersecurity analyst',
  'Cloud engineer',
  'IT support specialist'
] where id = 'bsit' and careers = '{}';

update public.programs set careers = array[
  'Business analyst',
  'Systems analyst',
  'Data analyst',
  'Business application developer',
  'ERP consultant',
  'Database administrator',
  'IT auditor',
  'IS project manager'
] where id = 'bsis' and careers = '{}';

update public.programs set careers = array[
  'Game developer',
  'Game designer',
  '2D / 3D animator',
  '3D modeler and artist',
  'Technical artist',
  'Visual effects artist',
  'Level designer',
  'Multimedia designer'
] where id = 'bsemc' and careers = '{}';

update public.programs set careers = array[
  'Licensed librarian',
  'Archivist',
  'Records manager',
  'Cataloger and metadata specialist',
  'Digital librarian',
  'Knowledge manager',
  'Information specialist',
  'Library systems administrator'
] where id = 'blis' and careers = '{}';

update public.programs set careers = array[
  'IT manager',
  'Chief information officer',
  'IT consultant',
  'Solutions architect',
  'IT project manager',
  'Research and development specialist',
  'College instructor or professor'
] where id = 'mit' and careers = '{}';
