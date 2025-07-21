-- Create profiles for existing users who don't have one
INSERT INTO public.user_profiles (user_id, username, email, phone, profile_image_url, created_at, updated_at)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)) as username,
  au.email,
  au.raw_user_meta_data->>'phone' as phone,
  NULL as profile_image_url,
  NOW() as created_at,
  NOW() as updated_at
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
WHERE up.user_id IS NULL  -- Only users without profiles
AND au.email IS NOT NULL  -- Only users with email
ON CONFLICT (user_id) DO NOTHING;
