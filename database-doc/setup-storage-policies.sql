-- Storage Policies for profile-images bucket
-- Run these in Supabase Dashboard > Storage > Policies

-- STEP 1: Create the bucket first
-- Go to Storage > Create bucket
-- Name: profile-images
-- Public: true

-- STEP 2: Then create these policies in Storage > Policies

-- Policy 1: Users can upload their own profile images
CREATE POLICY "Users can upload their own profile images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-images' AND
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

-- Policy 2: Anyone can view profile images (public read)
CREATE POLICY "Anyone can view profile images" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-images');

-- Policy 3: Users can update their own profile images
CREATE POLICY "Users can update their own profile images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-images' AND
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

-- Policy 4: Users can delete their own profile images
CREATE POLICY "Users can delete their own profile images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-images' AND
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

-- IMPORTANT NOTES:
-- 1. The storage policies assume your profile images are stored with the user ID as the first folder
--    For example: profiles/user-id-123/profile.jpg
-- 2. This matches what your auth.ts file does with this line:
--    const filePath = `profiles/${fileName}`;
-- 3. If you change the folder structure, update these policies accordingly
