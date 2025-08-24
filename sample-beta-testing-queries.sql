-- Sample queries for selecting beta testers with the new priority system
-- Run these in your Supabase SQL editor after updating the database schema

-- 1. Get all active waitlist members (not unsubscribed)
SELECT 
  email,
  first_name,
  last_name,
  source,
  additional_data_collected,
  signup_timestamp,
  country,
  city
FROM waitlist 
WHERE unsubscribed_at IS NULL
ORDER BY additional_data_collected DESC, signup_timestamp ASC;

-- 2. Get Tier 1 users (complete profiles) - HIGHEST PRIORITY
SELECT 
  email,
  first_name,
  last_name,
  source,
  country,
  city,
  signup_timestamp,
  'Tier 1 - Complete Profile' as priority_level
FROM waitlist 
WHERE unsubscribed_at IS NULL 
  AND additional_data_collected = TRUE
  AND first_name IS NOT NULL 
  AND last_name IS NOT NULL
ORDER BY signup_timestamp ASC;

-- 3. Get Tier 2 users (email only) - LOWER PRIORITY
SELECT 
  email,
  country,
  city,
  signup_timestamp,
  'Tier 2 - Email Only' as priority_level
FROM waitlist 
WHERE unsubscribed_at IS NULL 
  AND (additional_data_collected = FALSE OR additional_data_collected IS NULL)
ORDER BY signup_timestamp ASC;

-- 4. Select top 50 beta testers with priority system
WITH ranked_users AS (
  SELECT 
    email,
    first_name,
    last_name,
    source,
    country,
    city,
    signup_timestamp,
    additional_data_collected,
    ROW_NUMBER() OVER (
      ORDER BY 
        additional_data_collected DESC,  -- Complete profiles first
        signup_timestamp ASC            -- Then by signup time
    ) as rank
  FROM waitlist 
  WHERE unsubscribed_at IS NULL
)
SELECT 
  rank,
  email,
  first_name,
  last_name,
  source,
  country,
  city,
  signup_timestamp,
  CASE 
    WHEN additional_data_collected = TRUE THEN 'Tier 1 - Complete Profile'
    ELSE 'Tier 2 - Email Only'
  END as priority_level
FROM ranked_users 
WHERE rank <= 50
ORDER BY rank;

-- 5. Get statistics for beta testing selection
SELECT 
  COUNT(*) as total_active_users,
  COUNT(CASE WHEN additional_data_collected = TRUE THEN 1 END) as complete_profiles,
  COUNT(CASE WHEN additional_data_collected = FALSE OR additional_data_collected IS NULL THEN 1 END) as email_only,
  COUNT(CASE WHEN unsubscribed_at IS NOT NULL THEN 1 END) as unsubscribed_users
FROM waitlist;

-- 6. Get users by source (for marketing insights)
SELECT 
  source,
  COUNT(*) as user_count,
  COUNT(CASE WHEN additional_data_collected = TRUE THEN 1 END) as completed_profiles
FROM waitlist 
WHERE unsubscribed_at IS NULL 
  AND source IS NOT NULL
GROUP BY source
ORDER BY user_count DESC;

-- 7. Get users by location (for geographic diversity in beta testing)
SELECT 
  country,
  city,
  COUNT(*) as user_count,
  COUNT(CASE WHEN additional_data_collected = TRUE THEN 1 END) as completed_profiles
FROM waitlist 
WHERE unsubscribed_at IS NULL
GROUP BY country, city
ORDER BY user_count DESC
LIMIT 20;
