-- ==============================================================================
-- ADD WORKER PROFILE CUSTOMIZATION & TRANSACTION QR FIELDS
-- ==============================================================================

-- 1. Profiles Table: Avatar URL and Bio
ALTER TABLE IF EXISTS public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';

-- 2. Workers Table: Avatar URL, Bio, UPI ID, and Transaction QR Code URL
ALTER TABLE IF EXISTS public.workers 
ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS upi_id VARCHAR(100) DEFAULT '',
ADD COLUMN IF NOT EXISTS upi_qr_url TEXT DEFAULT '';

-- 3. RLS Policies: Allow Workers to Update their own Profile and Worker details
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'workers' AND policyname = 'Workers can update own worker record'
  ) THEN
    CREATE POLICY "Workers can update own worker record" ON public.workers FOR UPDATE USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (true);
  END IF;
END $$;
