-- Update waitlist table to add structured columns for technical data
-- Run this in your Supabase SQL Editor

-- Add new columns for structured data
ALTER TABLE waitlist 
ADD COLUMN IF NOT EXISTS ip_address VARCHAR,
ADD COLUMN IF NOT EXISTS country VARCHAR,
ADD COLUMN IF NOT EXISTS city VARCHAR,
ADD COLUMN IF NOT EXISTS region VARCHAR,
ADD COLUMN IF NOT EXISTS device_type VARCHAR,
ADD COLUMN IF NOT EXISTS browser_name VARCHAR,
ADD COLUMN IF NOT EXISTS browser_version VARCHAR,
ADD COLUMN IF NOT EXISTS os_name VARCHAR,
ADD COLUMN IF NOT EXISTS os_version VARCHAR,
ADD COLUMN IF NOT EXISTS screen_width INTEGER,
ADD COLUMN IF NOT EXISTS screen_height INTEGER,
ADD COLUMN IF NOT EXISTS language VARCHAR,
ADD COLUMN IF NOT EXISTS timezone VARCHAR,
ADD COLUMN IF NOT EXISTS referrer TEXT,
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS signup_timestamp TIMESTAMP DEFAULT NOW();

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_waitlist_country ON waitlist(country);
CREATE INDEX IF NOT EXISTS idx_waitlist_device_type ON waitlist(device_type);
CREATE INDEX IF NOT EXISTS idx_waitlist_browser_name ON waitlist(browser_name);
CREATE INDEX IF NOT EXISTS idx_waitlist_os_name ON waitlist(os_name);
CREATE INDEX IF NOT EXISTS idx_waitlist_signup_timestamp ON waitlist(signup_timestamp);
CREATE INDEX IF NOT EXISTS idx_waitlist_ip_address ON waitlist(ip_address);

-- Create a composite index for common queries
CREATE INDEX IF NOT EXISTS idx_waitlist_country_device ON waitlist(country, device_type);
CREATE INDEX IF NOT EXISTS idx_waitlist_country_browser ON waitlist(country, browser_name);

-- Add comments to document the columns
COMMENT ON COLUMN waitlist.ip_address IS 'User IP address';
COMMENT ON COLUMN waitlist.country IS 'Country derived from IP address';
COMMENT ON COLUMN waitlist.city IS 'City derived from IP address';
COMMENT ON COLUMN waitlist.region IS 'Region/state derived from IP address';
COMMENT ON COLUMN waitlist.device_type IS 'Device type: desktop, mobile, or tablet';
COMMENT ON COLUMN waitlist.browser_name IS 'Browser name (Chrome, Safari, Firefox, etc.)';
COMMENT ON COLUMN waitlist.browser_version IS 'Browser version number';
COMMENT ON COLUMN waitlist.os_name IS 'Operating system name (Windows, macOS, Android, etc.)';
COMMENT ON COLUMN waitlist.os_version IS 'Operating system version';
COMMENT ON COLUMN waitlist.screen_width IS 'Screen width in pixels';
COMMENT ON COLUMN waitlist.screen_height IS 'Screen height in pixels';
COMMENT ON COLUMN waitlist.language IS 'User language preference';
COMMENT ON COLUMN waitlist.timezone IS 'User timezone';
COMMENT ON COLUMN waitlist.referrer IS 'Referring website URL';
COMMENT ON COLUMN waitlist.user_agent IS 'Full browser user agent string';
COMMENT ON COLUMN waitlist.signup_timestamp IS 'Timestamp when user signed up';
COMMENT ON COLUMN waitlist.technical_data IS 'Full technical data as JSON backup';

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'waitlist' 
ORDER BY ordinal_position;