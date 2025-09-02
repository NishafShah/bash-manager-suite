-- Update auth.users trigger to disable email confirmation requirement temporarily
-- for easier testing. Users can enable this later in Supabase auth settings.

-- This is actually configured in the Supabase dashboard under Authentication > Settings
-- but we can also set some helpful defaults for new user experience

-- Create a function to automatically confirm users (optional for testing)
-- Note: This should be removed in production and email confirmation enabled

-- Set up email template customization (this requires dashboard configuration)
-- Users should go to Authentication > Templates to customize email templates

-- For now, let's just ensure the trigger handles both confirmed and unconfirmed users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles regardless of email confirmation status
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'first_name', NEW.raw_user_meta_data ->> 'last_name')
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;