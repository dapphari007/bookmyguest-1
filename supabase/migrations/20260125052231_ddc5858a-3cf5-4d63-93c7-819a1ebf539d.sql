-- Allow users to insert their own role during signup
CREATE POLICY "Users can insert their own role" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create demo speaker user's profile and availability
-- Note: We'll create the demo accounts via application signup, 
-- but first let's create sample speaker data that can be browsed

-- Insert sample speakers for demo purposes (these will have placeholder user_ids that we'll update)
-- We need to insert profiles first, then we can have demo users claim them

-- Create a function to generate sample availability for speakers
CREATE OR REPLACE FUNCTION public.generate_sample_availability(_speaker_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    i integer;
    slot_date date;
    start_hour integer;
BEGIN
    -- Generate slots for the next 14 days
    FOR i IN 1..14 LOOP
        slot_date := CURRENT_DATE + i;
        -- Add 2-3 slots per day
        FOR start_hour IN 9..11 LOOP
            INSERT INTO public.speaker_availability (speaker_id, date, start_time, end_time, status)
            VALUES (
                _speaker_id,
                slot_date,
                (start_hour || ':00')::time,
                ((start_hour + 1) || ':00')::time,
                CASE WHEN random() > 0.7 THEN 'booked' ELSE 'available' END::booking_status
            );
        END LOOP;
    END LOOP;
END;
$$;