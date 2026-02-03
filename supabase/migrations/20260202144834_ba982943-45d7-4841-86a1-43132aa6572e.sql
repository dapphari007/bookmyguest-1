-- 2. Add approval_status to speakers table
ALTER TABLE public.speakers 
ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- 3. Add travel/accommodation pricing fields to speakers
ALTER TABLE public.speakers 
ADD COLUMN IF NOT EXISTS base_district text,
ADD COLUMN IF NOT EXISTS travel_charge integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS accommodation_charge integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS includes_travel_local boolean DEFAULT true;

-- 4. Add approval_status to profiles for organizers
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- 5. Create admin check function
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'::app_role
  )
$$;

-- 6. Drop existing conflicting policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- 7. Create RLS policies for admin access
-- Admins can view all profiles (or users view their own)
CREATE POLICY "Users and admins can view profiles" 
ON public.profiles FOR SELECT 
TO authenticated
USING (public.is_admin(auth.uid()) OR auth.uid() = user_id);

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles" 
ON public.profiles FOR UPDATE 
TO authenticated
USING (public.is_admin(auth.uid()));

-- Admins can delete profiles
CREATE POLICY "Admins can delete profiles"
ON public.profiles FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Admins can update all speakers
CREATE POLICY "Admins can update all speakers" 
ON public.speakers FOR UPDATE 
TO authenticated
USING (public.is_admin(auth.uid()));

-- Admins can delete speakers
CREATE POLICY "Admins can delete speakers"
ON public.speakers FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Drop existing user_roles policy and recreate
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Admins can view all user_roles
CREATE POLICY "Users and admins can view roles" 
ON public.user_roles FOR SELECT 
TO authenticated
USING (public.is_admin(auth.uid()) OR auth.uid() = user_id);

-- Admins can delete user_roles
CREATE POLICY "Admins can delete user roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings" 
ON public.bookings FOR SELECT 
TO authenticated
USING (public.is_admin(auth.uid()));

-- Admins can delete bookings
CREATE POLICY "Admins can delete bookings"
ON public.bookings FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Admins can update bookings
CREATE POLICY "Admins can update bookings"
ON public.bookings FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

-- 8. Update handle_new_user_role to set pending status
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
  
  -- Update profile approval status to pending
  UPDATE public.profiles 
  SET approval_status = 'pending'
  WHERE user_id = NEW.id;
  
  -- If speaker, create a speaker profile with pending status
  IF user_role = 'speaker' THEN
    INSERT INTO public.speakers (user_id, name, title, category, location, approval_status)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Speaker'),
      'Professional Speaker',
      'Motivational',
      'India',
      'pending'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- 9. Create notifications table for booking reminders
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info',
  is_read boolean DEFAULT false,
  related_booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Users can update their notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- 10. Create trigger to send notification when booking is created
CREATE OR REPLACE FUNCTION public.notify_on_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  speaker_user_id uuid;
  event_date date;
BEGIN
  -- Get speaker's user_id
  SELECT user_id INTO speaker_user_id FROM public.speakers WHERE id = NEW.speaker_id;
  
  -- Get event date from availability
  SELECT date INTO event_date FROM public.speaker_availability WHERE id = NEW.availability_id;
  
  -- Create notification for speaker
  INSERT INTO public.notifications (user_id, title, message, type, related_booking_id)
  VALUES (
    speaker_user_id,
    'New Booking Request',
    'You have a new booking for "' || NEW.event_name || '" on ' || event_date::text,
    'booking',
    NEW.id
  );
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_booking_created ON public.bookings;
CREATE TRIGGER on_booking_created
AFTER INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_booking();

-- 11. Approve existing demo speakers
UPDATE public.speakers SET approval_status = 'approved' WHERE approval_status IS NULL;
UPDATE public.profiles SET approval_status = 'approved' WHERE approval_status IS NULL;