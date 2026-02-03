-- Create admin account entry (you'll need to create the auth user manually in Supabase dashboard)
-- This inserts the admin role for a specific user ID that you'll create

-- First, let's make sure existing demo speakers are approved
UPDATE public.speakers SET approval_status = 'approved' WHERE approval_status IS NULL OR approval_status = 'pending';
UPDATE public.profiles SET approval_status = 'approved' WHERE approval_status IS NULL;