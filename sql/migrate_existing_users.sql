-- Migration script to create user profiles for existing users
-- Run this AFTER creating the trigger

DO $$
DECLARE
  auth_user RECORD;
BEGIN
  -- Loop through all auth users who don't have a profile
  FOR auth_user IN 
    SELECT au.id, au.email, au.raw_user_meta_data, au.created_at
    FROM auth.users au
    LEFT JOIN public.user_profiles up ON au.id = up.user_id
    WHERE up.user_id IS NULL
  LOOP
    -- Create profile for this user
    INSERT INTO public.user_profiles (user_id, username, email, phone, profile_image_url, created_at, updated_at)
    VALUES (
      auth_user.id,
      COALESCE(auth_user.raw_user_meta_data->>'username', split_part(auth_user.email, '@', 1)),
      auth_user.email,
      auth_user.raw_user_meta_data->>'phone',
      NULL,
      auth_user.created_at,
      NOW()
    );
    
    RAISE NOTICE 'Created profile for user: %', auth_user.email;
  END LOOP;
END $$;
