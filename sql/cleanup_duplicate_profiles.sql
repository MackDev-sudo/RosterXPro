-- Cleanup script to remove duplicate user profiles
-- BACKUP YOUR DATA BEFORE RUNNING THIS SCRIPT!

-- First, let's see the duplicates
SELECT user_id, email, username, COUNT(*) as duplicate_count
FROM public.user_profiles
GROUP BY user_id, email, username
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Remove duplicates keeping the oldest record for each user_id
DELETE FROM public.user_profiles
WHERE id NOT IN (
  SELECT MIN(id)
  FROM public.user_profiles
  GROUP BY user_id
);

-- Verify no duplicates remain
SELECT user_id, email, username, COUNT(*) as duplicate_count
FROM public.user_profiles
GROUP BY user_id, email, username
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Add unique constraint to prevent future duplicates
ALTER TABLE public.user_profiles 
ADD CONSTRAINT IF NOT EXISTS user_profiles_user_id_unique UNIQUE (user_id);

-- Optional: If you want to also make email unique
-- ALTER TABLE public.user_profiles 
-- ADD CONSTRAINT IF NOT EXISTS user_profiles_email_unique UNIQUE (email);
