-- public.rls_auto_enable() backs the platform's "auto-enable RLS" event
-- trigger. It lives in an exposed schema with the default EXECUTE grant, so
-- the advisors flag it as a public RPC. Event triggers don't check EXECUTE
-- when they fire, so revoking it leaves the trigger working.
--
-- The function is created by the platform, not by these migrations, so local
-- stacks may not have it.

do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end
$$;
