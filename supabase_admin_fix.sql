-- Run this in Supabase SQL Editor to add the admin role column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
