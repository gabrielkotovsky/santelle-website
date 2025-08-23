-- Sample Analytics Queries for Santelle Waitlist Data
-- Run these in your Supabase SQL Editor after updating the table structure

-- 1. Geographic Distribution of Users
SELECT 
  country,
  COUNT(*) as user_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM waitlist 
WHERE country IS NOT NULL
GROUP BY country 
ORDER BY user_count DESC;

-- 2. Device Type Breakdown
SELECT 
  device_type,
  COUNT(*) as user_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM waitlist 
WHERE device_type IS NOT NULL
GROUP BY device_type 
ORDER BY user_count DESC;

-- 3. Browser Distribution
SELECT 
  browser_name,
  COUNT(*) as user_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM waitlist 
WHERE browser_name IS NOT NULL
GROUP BY browser_name 
ORDER BY user_count DESC;

-- 4. Operating System Distribution
SELECT 
  os_name,
  COUNT(*) as user_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM waitlist 
WHERE os_name IS NOT NULL
GROUP BY os_name 
ORDER BY user_count DESC;

-- 5. Screen Resolution Analysis
SELECT 
  CASE 
    WHEN screen_width >= 1920 THEN '2K+ (1920+)'
    WHEN screen_width >= 1366 THEN 'HD (1366-1919)'
    WHEN screen_width >= 1024 THEN 'Tablet (1024-1365)'
    ELSE 'Mobile (<1024)'
  END as resolution_category,
  COUNT(*) as user_count
FROM waitlist 
WHERE screen_width IS NOT NULL
GROUP BY resolution_category 
ORDER BY user_count DESC;

-- 6. Top Countries by Device Type
SELECT 
  country,
  device_type,
  COUNT(*) as user_count
FROM waitlist 
WHERE country IS NOT NULL AND device_type IS NOT NULL
GROUP BY country, device_type
ORDER BY country, user_count DESC;

-- 7. Signup Trends Over Time
SELECT 
  DATE(signup_timestamp) as signup_date,
  COUNT(*) as daily_signups
FROM waitlist 
WHERE signup_timestamp IS NOT NULL
GROUP BY DATE(signup_timestamp)
ORDER BY signup_date DESC
LIMIT 30;

-- 8. Language Preferences
SELECT 
  language,
  COUNT(*) as user_count
FROM waitlist 
WHERE language IS NOT NULL
GROUP BY language 
ORDER BY user_count DESC;

-- 9. Referrer Analysis
SELECT 
  CASE 
    WHEN referrer IS NULL THEN 'Direct Visit'
    WHEN referrer LIKE '%google%' THEN 'Google'
    WHEN referrer LIKE '%facebook%' THEN 'Facebook'
    WHEN referrer LIKE '%twitter%' THEN 'Twitter'
    WHEN referrer LIKE '%linkedin%' THEN 'LinkedIn'
    WHEN referrer LIKE '%instagram%' THEN 'Instagram'
    ELSE 'Other'
  END as traffic_source,
  COUNT(*) as user_count
FROM waitlist 
GROUP BY traffic_source
ORDER BY user_count DESC;

-- 10. High-Value Users (2K+ displays, specific countries)
SELECT 
  email,
  country,
  city,
  device_type,
  browser_name,
  os_name,
  screen_width,
  screen_height,
  signup_timestamp
FROM waitlist 
WHERE screen_width >= 1920 
  AND country IN ('United States', 'United Kingdom', 'Germany', 'France', 'Canada', 'Australia')
ORDER BY signup_timestamp DESC;

-- 11. Mobile vs Desktop by Country
SELECT 
  country,
  SUM(CASE WHEN device_type = 'mobile' THEN 1 ELSE 0 END) as mobile_users,
  SUM(CASE WHEN device_type = 'desktop' THEN 1 ELSE 0 END) as desktop_users,
  SUM(CASE WHEN device_type = 'tablet' THEN 1 ELSE 0 END) as tablet_users,
  COUNT(*) as total_users
FROM waitlist 
WHERE country IS NOT NULL AND device_type IS NOT NULL
GROUP BY country
HAVING COUNT(*) >= 5
ORDER BY total_users DESC;

-- 12. Recent Signups with Full Technical Details
SELECT 
  email,
  country,
  city,
  device_type,
  browser_name,
  browser_version,
  os_name,
  os_version,
  screen_width,
  screen_height,
  language,
  timezone,
  referrer,
  signup_timestamp
FROM waitlist 
ORDER BY signup_timestamp DESC
LIMIT 20;