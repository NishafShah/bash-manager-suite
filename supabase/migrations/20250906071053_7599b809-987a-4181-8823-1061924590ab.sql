-- Promote the specified user to admin role
INSERT INTO public.user_roles (user_id, role)
VALUES ('68df7ccf-3335-4471-ab64-3842d4801950', 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;