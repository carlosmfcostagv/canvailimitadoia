CREATE OR REPLACE FUNCTION public.admin_list_subscribers(_search text DEFAULT '')
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  credits integer,
  updated_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Acesso restrito a administradores';
  END IF;

  RETURN QUERY
  SELECT p.id, p.email, p.full_name, p.credits, p.updated_at
  FROM public.profiles p
  WHERE NULLIF(btrim(_search), '') IS NULL
     OR p.email ILIKE '%' || btrim(_search) || '%'
     OR p.full_name ILIKE '%' || btrim(_search) || '%'
  ORDER BY p.updated_at DESC, p.email ASC
  LIMIT 100;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_adjust_credits(
  _user_id uuid,
  _amount integer,
  _reason text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_id uuid := auth.uid();
  new_balance integer;
  clean_reason text := btrim(_reason);
BEGIN
  IF admin_id IS NULL OR NOT public.has_role(admin_id, 'admin') THEN
    RAISE EXCEPTION 'Acesso restrito a administradores';
  END IF;

  IF _amount = 0 THEN
    RAISE EXCEPTION 'Informe uma quantidade diferente de zero';
  END IF;

  IF clean_reason IS NULL OR char_length(clean_reason) < 3 THEN
    RAISE EXCEPTION 'Informe um motivo para o ajuste';
  END IF;

  UPDATE public.profiles
  SET credits = credits + _amount, updated_at = now()
  WHERE id = _user_id
    AND credits + _amount >= 0
  RETURNING credits INTO new_balance;

  IF new_balance IS NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id) THEN
      RAISE EXCEPTION 'Assinante não encontrado';
    END IF;
    RAISE EXCEPTION 'O saldo não pode ficar negativo';
  END IF;

  INSERT INTO public.credit_transactions (user_id, amount, reason, balance_after, metadata)
  VALUES (
    _user_id,
    _amount,
    'Ajuste administrativo: ' || clean_reason,
    new_balance,
    jsonb_build_object('admin_user_id', admin_id, 'reason', clean_reason)
  );

  RETURN jsonb_build_object('user_id', _user_id, 'amount', _amount, 'credits', new_balance);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_subscribers(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_adjust_credits(uuid, integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_subscribers(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_adjust_credits(uuid, integer, text) TO authenticated;