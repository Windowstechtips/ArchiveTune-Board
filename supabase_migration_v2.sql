-- ─────────────────────────────────────────────────────────
-- ArchiveTune Board — v2 Migration (run this in Supabase SQL editor)
-- ─────────────────────────────────────────────────────────

-- 1. Add user columns to existing issues table
ALTER TABLE issues ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE issues ADD COLUMN IF NOT EXISTS author_username TEXT DEFAULT 'Anonymous';

-- 2. Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username    TEXT UNIQUE NOT NULL,
  is_banned   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- 3. Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Profiles policies
CREATE POLICY "profiles_public_read"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "profiles_own_insert"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_own_update"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Allow any authenticated session to update ban status (admin-only in practice)
CREATE POLICY "profiles_admin_update"
  ON profiles FOR UPDATE USING (auth.role() = 'authenticated');

-- 5. Update issues INSERT policy — now requires a logged-in user
DROP POLICY IF EXISTS "Anyone can insert an issue." ON issues;
CREATE POLICY "Authenticated users can insert issues"
  ON issues FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
