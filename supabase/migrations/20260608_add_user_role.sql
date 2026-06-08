-- Add role column to users table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/qfccyyrnjwfozpznnsjh/sql/new

-- 1. Add role column (default to 'teacher' since that's our primary user)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role text DEFAULT 'teacher';

-- 2. Add check constraint: only 'teacher' or 'school'
ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role IN ('teacher', 'school'));

-- 3. Update RLS: users can read their own role
-- (existing policies should cover this, but just in case)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4. Create a policy that lets users read/update their own row
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own role' AND tablename = 'users'
  ) THEN
    CREATE POLICY "Users can update own role" ON public.users
      FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;
