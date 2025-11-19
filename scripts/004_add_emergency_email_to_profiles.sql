-- Add emergency_email column to profiles table
ALTER TABLE IF EXISTS public.profiles
ADD COLUMN IF NOT EXISTS emergency_email TEXT;

-- Update RLS policy to allow emergency_email updates
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create new policy if it doesn't exist
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles 
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
