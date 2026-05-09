-- Feature 1 Part A: Add email notification opt-in columns to user_profiles
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS notification_email TEXT,
  ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN NOT NULL DEFAULT false;
