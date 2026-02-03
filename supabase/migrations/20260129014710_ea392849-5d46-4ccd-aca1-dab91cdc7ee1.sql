-- Drop existing RLS policy that causes issues
DROP POLICY IF EXISTS "Users can insert their own role" ON public.user_roles;

-- Create a function to handle role assignment during signup
-- This uses SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Get the role from user metadata, default to 'organizer' if not specified
  user_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::app_role, 
    'organizer'::app_role
  );
  
  -- Insert the role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  -- If speaker, create a speaker profile
  IF user_role = 'speaker' THEN
    INSERT INTO public.speakers (user_id, name, title, category, location)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Speaker'),
      'Professional Speaker',
      'Motivational',
      'India'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically assign role on user creation
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Ensure speakers table has proper defaults for new columns
ALTER TABLE public.speakers 
  ALTER COLUMN bio SET DEFAULT 'I am a professional speaker passionate about sharing knowledge and inspiring audiences.',
  ALTER COLUMN price_min SET DEFAULT 10000,
  ALTER COLUMN price_max SET DEFAULT 50000,
  ALTER COLUMN experience_years SET DEFAULT 1,
  ALTER COLUMN total_events SET DEFAULT 0,
  ALTER COLUMN rating SET DEFAULT 0,
  ALTER COLUMN review_count SET DEFAULT 0;

-- Add organizer_name to bookings for easier display
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS organizer_name text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS organizer_email text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS organizer_phone text;