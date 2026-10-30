-- ============================================================
-- Site settings: one row of switches edited in the CMS.
-- maintenance_mode replaces the landing page with a notice; the
-- public site reads it in the visitor's browser, like other content.
-- ============================================================
create table public.site_settings (
  id boolean primary key default true check (id),
  maintenance_mode boolean not null default false,
  maintenance_message text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

insert into public.site_settings (id) values (true);

alter table public.site_settings enable row level security;

create policy "Site settings are public"
  on public.site_settings for select
  to anon, authenticated
  using (true);

create policy "Admins can update site settings"
  on public.site_settings for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

grant select on public.site_settings to anon, authenticated;
grant update on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
