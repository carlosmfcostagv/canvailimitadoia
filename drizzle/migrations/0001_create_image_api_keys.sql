CREATE TABLE public.image_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  provider text NOT NULL DEFAULT 'openai',
  api_key text NOT NULL,
  model text,
  position integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  last_error text,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.image_api_keys TO service_role;

ALTER TABLE public.image_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No direct client access" ON public.image_api_keys
  FOR SELECT TO authenticated USING (false);
