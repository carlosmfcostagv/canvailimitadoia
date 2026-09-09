REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.bootstrap_user() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.renew_plan(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.consume_credits(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.renew_plan(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.consume_credits(text) TO authenticated;