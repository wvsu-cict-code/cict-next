-- ============================================================
-- Sustainable Development Goals a post supports, by goal number
-- (1 = No Poverty ... 17 = Partnerships for the Goals).
-- ============================================================
alter table public.posts
  add column sdgs smallint[] not null default '{}'
  constraint posts_sdgs_valid
    check (sdgs <@ '{1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17}'::smallint[]);
