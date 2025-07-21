-- Complete Database Setup for RosterXPro
-- Run this in your Supabase SQL Editor

-- 1. Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    profile_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy 4: Users can delete their own profile (optional)
CREATE POLICY "Users can delete own profile" ON user_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- 5. Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Create trigger to auto-update updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Storage bucket policies for profile images
-- (Note: These need to be created in Storage > Policies section)
-- 
-- For bucket 'profile-images':
-- 
-- Policy 1: Users can upload their own profile images
-- CREATE POLICY "Users can upload their own profile images" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'profile-images' AND
--     auth.uid()::text = (string_to_array(name, '/'))[1]
--   );
-- 
-- Policy 2: Anyone can view profile images (public read)
-- CREATE POLICY "Anyone can view profile images" ON storage.objects
--   FOR SELECT USING (bucket_id = 'profile-images');
-- 
-- Policy 3: Users can update their own profile images
-- CREATE POLICY "Users can update their own profile images" ON storage.objects
--   FOR UPDATE USING (
--     bucket_id = 'profile-images' AND
--     auth.uid()::text = (string_to_array(name, '/'))[1]
--   );
-- 
-- Policy 4: Users can delete their own profile images
-- CREATE POLICY "Users can delete their own profile images" ON storage.objects
--   FOR DELETE USING (
--     bucket_id = 'profile-images' AND
--     auth.uid()::text = (string_to_array(name, '/'))[1]
--   );

-- 8. Verify setup
SELECT 
    'Table created successfully' as status,
    count(*) as profile_count 
FROM user_profiles;

-- Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'user_profiles';
