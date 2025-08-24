-- Add new columns to existing waitlist table for enhanced functionality
-- Run this script in your Supabase SQL editor

-- Add columns for additional user information
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS source VARCHAR(255);
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS additional_data_collected BOOLEAN DEFAULT FALSE;

-- Add column for unsubscribe functionality
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMP;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_additional_data_collected ON waitlist(additional_data_collected);
CREATE INDEX IF NOT EXISTS idx_waitlist_unsubscribed_at ON waitlist(unsubscribed_at);

-- Add a composite index for beta testing priority queries
CREATE INDEX IF NOT EXISTS idx_waitlist_beta_priority ON waitlist(additional_data_collected, unsubscribed_at) 
WHERE additional_data_collected = TRUE AND unsubscribed_at IS NULL;

-- Update existing records to set additional_data_collected to FALSE for existing users
UPDATE waitlist SET additional_data_collected = FALSE WHERE additional_data_collected IS NULL;

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'waitlist' 
ORDER BY ordinal_position;
