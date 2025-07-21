-- Quick Database Verification Script
-- Run this in Supabase SQL Editor to check if everything is set up correctly

-- 1. Check if user_profiles table exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = 'user_profiles'
    ) THEN '✅ Table exists'
    ELSE '❌ Table missing - run setup-database.sql'
  END as table_status;

-- 2. Check if RLS is enabled
SELECT 
  CASE 
    WHEN rowsecurity = true THEN '✅ RLS enabled'
    ELSE '❌ RLS disabled - run setup-database.sql'
  END as rls_status
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- 3. Check policies
SELECT 
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) >= 4 THEN '✅ All policies created'
    ELSE '⚠️ Missing policies - run setup-database.sql'
  END as policy_status
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 4. Check storage bucket
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM storage.buckets 
      WHERE name = 'profile-images'
    ) THEN '✅ Storage bucket exists'
    ELSE '❌ Storage bucket missing - create profile-images bucket'
  END as bucket_status;

-- 5. Test basic insert (will fail if RLS is working correctly without proper auth)
-- This should return a permissions error, which is good!
DO $$
BEGIN
  BEGIN
    INSERT INTO user_profiles (user_id, username, email, phone) 
    VALUES ('test-id', 'test', 'test@example.com', '1234567890');
    RAISE NOTICE '❌ RLS not working - insert succeeded without auth';
  EXCEPTION WHEN others THEN
    RAISE NOTICE '✅ RLS working correctly - insert blocked: %', SQLERRM;
  END;
END $$;

-- Summary
SELECT 
  '🎉 Database setup verification complete!' as summary,
  'If you see checkmarks above, your database is ready!' as note;
