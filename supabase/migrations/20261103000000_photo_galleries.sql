-- ============================================================
-- Gallery photos on news posts and events.
-- ============================================================
alter table public.posts
  add column photos jsonb not null default '[]'
  constraint posts_photos_is_array check (jsonb_typeof(photos) = 'array');

alter table public.events
  add column photos jsonb not null default '[]'
  constraint events_photos_is_array check (jsonb_typeof(photos) = 'array');

comment on column public.posts.photos is 'Gallery photos shown below the article and used by the social post composer: [{url,width,height,alt}]';
comment on column public.events.photos is 'Gallery photos shown below the article and used by the social post composer: [{url,width,height,alt}]';
