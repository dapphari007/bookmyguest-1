-- Fix the overly permissive inquiry INSERT policy
DROP POLICY IF EXISTS "Anyone can create inquiries" ON public.inquiries;

-- Create a more restrictive policy for inquiries
CREATE POLICY "Authenticated users can create inquiries"
ON public.inquiries FOR INSERT
TO authenticated
WITH CHECK (
    (organizer_id IS NULL OR auth.uid() = organizer_id)
    AND speaker_id IS NOT NULL
);

-- Also allow anonymous users with proper validation
CREATE POLICY "Anonymous users can create inquiries with email"
ON public.inquiries FOR INSERT
TO anon
WITH CHECK (
    organizer_id IS NULL
    AND email IS NOT NULL
    AND name IS NOT NULL
    AND message IS NOT NULL
    AND speaker_id IS NOT NULL
);