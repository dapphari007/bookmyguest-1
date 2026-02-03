-- Fix overly permissive notification insert policy
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- More restrictive: only allow users to create notifications for themselves or admins to create for anyone
CREATE POLICY "Users can create own notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));