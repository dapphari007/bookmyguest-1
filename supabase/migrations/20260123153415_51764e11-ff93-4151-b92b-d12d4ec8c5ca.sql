-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('organizer', 'speaker');

-- Create booking_status enum
CREATE TYPE public.booking_status AS ENUM ('available', 'booked', 'pending');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create speakers table for speaker profiles
CREATE TABLE public.speakers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    location TEXT NOT NULL,
    bio TEXT,
    price_min INTEGER DEFAULT 25000,
    price_max INTEGER DEFAULT 100000,
    experience_years INTEGER DEFAULT 1,
    total_events INTEGER DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 4.5,
    review_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    is_instant_book BOOLEAN DEFAULT false,
    image_url TEXT,
    languages TEXT[] DEFAULT ARRAY['English', 'Hindi'],
    topics TEXT[] DEFAULT ARRAY[]::TEXT[],
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create speaker_availability table for time slots
CREATE TABLE public.speaker_availability (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    speaker_id UUID REFERENCES public.speakers(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status booking_status NOT NULL DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(speaker_id, date, start_time)
);

-- Create bookings table
CREATE TABLE public.bookings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    availability_id UUID REFERENCES public.speaker_availability(id) ON DELETE CASCADE NOT NULL,
    speaker_id UUID REFERENCES public.speakers(id) ON DELETE CASCADE NOT NULL,
    organizer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    event_name TEXT NOT NULL,
    event_type TEXT,
    event_location TEXT,
    attendees INTEGER,
    notes TEXT,
    status TEXT DEFAULT 'confirmed',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inquiries table for contact requests
CREATE TABLE public.inquiries (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    speaker_id UUID REFERENCES public.speakers(id) ON DELETE CASCADE NOT NULL,
    organizer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    event_date DATE,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create saved_speakers table for wishlist functionality
CREATE TABLE public.saved_speakers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    speaker_id UUID REFERENCES public.speakers(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, speaker_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speaker_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_speakers ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Helper function to get user's speaker_id
CREATE OR REPLACE FUNCTION public.get_speaker_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.speakers WHERE user_id = _user_id LIMIT 1
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- User roles policies (read-only for users, managed by triggers)
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Speakers policies
CREATE POLICY "Anyone can view speakers"
ON public.speakers FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Speakers can insert their own profile"
ON public.speakers FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'speaker'));

CREATE POLICY "Speakers can update their own profile"
ON public.speakers FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Speaker availability policies
CREATE POLICY "Anyone can view availability"
ON public.speaker_availability FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Speakers can manage their availability"
ON public.speaker_availability FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (SELECT 1 FROM public.speakers WHERE id = speaker_id AND user_id = auth.uid())
);

CREATE POLICY "Speakers can update their availability"
ON public.speaker_availability FOR UPDATE
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.speakers WHERE id = speaker_id AND user_id = auth.uid())
);

CREATE POLICY "Speakers can delete their availability"
ON public.speaker_availability FOR DELETE
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.speakers WHERE id = speaker_id AND user_id = auth.uid())
    AND status = 'available'
);

-- Bookings policies
CREATE POLICY "Organizers can view their bookings"
ON public.bookings FOR SELECT
TO authenticated
USING (auth.uid() = organizer_id);

CREATE POLICY "Speakers can view bookings for their slots"
ON public.bookings FOR SELECT
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.speakers WHERE id = speaker_id AND user_id = auth.uid())
);

CREATE POLICY "Organizers can create bookings"
ON public.bookings FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = organizer_id 
    AND public.has_role(auth.uid(), 'organizer')
);

-- Inquiries policies
CREATE POLICY "Anyone can create inquiries"
ON public.inquiries FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Speakers can view their inquiries"
ON public.inquiries FOR SELECT
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.speakers WHERE id = speaker_id AND user_id = auth.uid())
);

CREATE POLICY "Organizers can view their inquiries"
ON public.inquiries FOR SELECT
TO authenticated
USING (auth.uid() = organizer_id);

-- Saved speakers policies
CREATE POLICY "Users can view their saved speakers"
ON public.saved_speakers FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can save speakers"
ON public.saved_speakers FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave speakers"
ON public.saved_speakers FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Function to handle new user signup and create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$;

-- Trigger to auto-create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_speakers_updated_at
    BEFORE UPDATE ON public.speakers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_speaker_availability_updated_at
    BEFORE UPDATE ON public.speaker_availability
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to mark slot as booked when booking is created
CREATE OR REPLACE FUNCTION public.mark_slot_as_booked()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.speaker_availability
    SET status = 'booked'
    WHERE id = NEW.availability_id;
    RETURN NEW;
END;
$$;

-- Trigger to mark slot as booked
CREATE TRIGGER on_booking_created
    AFTER INSERT ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION public.mark_slot_as_booked();