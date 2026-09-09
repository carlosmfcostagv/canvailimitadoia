-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can read their own roles" ON public.user_roles
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  credits integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT TO authenticated USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- PLANS
CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  price_cents integer NOT NULL DEFAULT 0,
  validity_days integer NOT NULL DEFAULT 30,
  credits integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.plans TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plans TO authenticated;
GRANT ALL ON public.plans TO service_role;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view plans" ON public.plans FOR SELECT USING (true);
CREATE POLICY "Admins manage plans" ON public.plans FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.plans (code, name, price_cents, validity_days, credits, sort_order) VALUES
  ('free', 'Plano Grátis', 0, 30, 10, 1),
  ('days_15', 'Plano 15 Dias', 3000, 15, 50, 2),
  ('days_28', 'Plano 28 Dias', 4990, 28, 120, 3);

-- GENERATION COSTS
CREATE TABLE public.generation_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation text NOT NULL UNIQUE,
  label text NOT NULL,
  credits integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.generation_costs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.generation_costs TO authenticated;
GRANT ALL ON public.generation_costs TO service_role;
ALTER TABLE public.generation_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view costs" ON public.generation_costs FOR SELECT USING (true);
CREATE POLICY "Admins manage costs" ON public.generation_costs FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.generation_costs (operation, label, credits) VALUES
  ('image', 'Texto para Imagem', 1),
  ('video', 'Texto para Vídeo', 5),
  ('i2v', 'Imagem para Vídeo', 5);

-- SUBSCRIPTIONS
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.plans(id),
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active',
  credits_granted integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX subscriptions_user_idx ON public.subscriptions (user_id, created_at DESC);
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own subscriptions" ON public.subscriptions
FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- CREDIT TRANSACTIONS
CREATE TABLE public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  reason text NOT NULL,
  balance_after integer NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX credit_tx_user_idx ON public.credit_transactions (user_id, created_at DESC);
GRANT SELECT ON public.credit_transactions TO authenticated;
GRANT ALL ON public.credit_transactions TO service_role;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own transactions" ON public.credit_transactions
FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- BOOTSTRAP: create profile + free plan on first login
CREATE OR REPLACE FUNCTION public.bootstrap_user()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  free_plan public.plans%ROWTYPE;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = uid) THEN RETURN; END IF;

  SELECT * INTO free_plan FROM public.plans WHERE code = 'free';

  INSERT INTO public.profiles (id, email, full_name, credits)
  SELECT uid, u.email, COALESCE(u.raw_user_meta_data->>'full_name', u.email), COALESCE(free_plan.credits, 0)
  FROM auth.users u WHERE u.id = uid;

  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'user') ON CONFLICT DO NOTHING;

  IF free_plan.id IS NOT NULL THEN
    INSERT INTO public.subscriptions (user_id, plan_id, expires_at, credits_granted)
    VALUES (uid, free_plan.id, now() + (free_plan.validity_days || ' days')::interval, free_plan.credits);

    INSERT INTO public.credit_transactions (user_id, amount, reason, balance_after, metadata)
    VALUES (uid, free_plan.credits, 'Plano Grátis', free_plan.credits, jsonb_build_object('plan', free_plan.code));
  END IF;
END;
$$;

-- RENEW / SUBSCRIBE
CREATE OR REPLACE FUNCTION public.renew_plan(_plan_code text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
$$;

-- CONSUME CREDITS
CREATE OR REPLACE FUNCTION public.consume_credits(_operation text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  cost integer;
  new_balance integer;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  PERFORM public.bootstrap_user();

  SELECT credits INTO cost FROM public.generation_costs WHERE operation = _operation;
  IF cost IS NULL THEN RAISE EXCEPTION 'Operação desconhecida'; END IF;

  UPDATE public.profiles SET credits = credits - cost, updated_at = now()
  WHERE id = uid AND credits >= cost RETURNING credits INTO new_balance;

  IF new_balance IS NULL THEN RAISE EXCEPTION 'Créditos insuficientes'; END IF;

  INSERT INTO public.credit_transactions (user_id, amount, reason, balance_after, metadata)
  VALUES (uid, -cost, 'Geração: ' || _operation, new_balance, jsonb_build_object('operation', _operation));

  RETURN jsonb_build_object('cost', cost, 'credits', new_balance);
END;
$$;

GRANT EXECUTE ON FUNCTION public.bootstrap_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.renew_plan(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.consume_credits(text) TO authenticated;