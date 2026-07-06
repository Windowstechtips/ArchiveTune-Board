-- ─────────────────────────────────────────────────────────
-- Run this in Supabase SQL Editor to fix profile creation.
-- This replaces the manual INSERT approach with a trigger.
-- ─────────────────────────────────────────────────────────

-- 1. Create the trigger function (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'username'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Attach the trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

-- 3. (Optional cleanup) Drop the old manual insert policy since
--    the trigger handles it now via the service role.
DROP POLICY IF EXISTS "profiles_own_insert" ON profiles;
