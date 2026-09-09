INSERT INTO public.profiles (id, email, full_name, credits)
SELECT u.id, u.email, COALESCE(u.raw_user_meta_data->>'full_name', u.email), 1000
FROM auth.users u WHERE u.email = 'carlosmfcosta47@gmail.com'
ON CONFLICT (id) DO UPDATE SET credits = GREATEST(public.profiles.credits, 1000);

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::app_role FROM auth.users u WHERE u.email = 'carlosmfcosta47@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'user'::app_role FROM auth.users u WHERE u.email = 'carlosmfcosta47@gmail.com'
ON CONFLICT DO NOTHING;