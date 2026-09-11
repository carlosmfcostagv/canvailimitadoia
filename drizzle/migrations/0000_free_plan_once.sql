CREATE OR REPLACE FUNCTION public.renew_plan(_plan_code text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  uid uuid := auth.uid();
  p public.plans%ROWTYPE;
  current_expiry timestamptz;
  new_start timestamptz;
  new_expiry timestamptz;
  new_balance integer;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  PERFORM public.bootstrap_user();

  SELECT * INTO p FROM public.plans WHERE code = _plan_code AND is_active;
  IF p.id IS NULL THEN RAISE EXCEPTION 'Plano indisponível'; END IF;

  IF p.price_cents = 0 THEN
    IF EXISTS (
      SELECT 1 FROM public.subscriptions s
      WHERE s.user_id = uid AND s.plan_id = p.id
    ) THEN
      RAISE EXCEPTION 'O plano grátis pode ser ativado apenas uma vez por usuário';
    END IF;
  END IF;

  SELECT max(expires_at) INTO current_expiry FROM public.subscriptions
  WHERE user_id = uid AND status = 'active';

  IF current_expiry IS NOT NULL AND current_expiry > now() THEN
    new_start := now();
    new_expiry := current_expiry + (p.validity_days || ' days')::interval;
  ELSE
    new_start := now();
    new_expiry := now() + (p.validity_days || ' days')::interval;
  END IF;

  UPDATE public.profiles SET credits = credits + p.credits, updated_at = now()
  WHERE id = uid RETURNING credits INTO new_balance;

  INSERT INTO public.subscriptions (user_id, plan_id, started_at, expires_at, credits_granted)
  VALUES (uid, p.id, new_start, new_expiry, p.credits);

  INSERT INTO public.credit_transactions (user_id, amount, reason, balance_after, metadata)
  VALUES (uid, p.credits, 'Renovação: ' || p.name, new_balance, jsonb_build_object('plan', p.code));

  RETURN jsonb_build_object('credits', new_balance, 'expires_at', new_expiry, 'plan', p.name);
END;
$function$;