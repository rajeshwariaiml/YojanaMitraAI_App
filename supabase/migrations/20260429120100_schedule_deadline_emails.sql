-- Feature 1 Part D: Schedule daily deadline-email send at 02:30 UTC (08:00 IST)
-- Requires the following Postgres settings to be configured (run once):
--   ALTER DATABASE postgres SET app.supabase_url = 'https://<project>.supabase.co';
--   ALTER DATABASE postgres SET app.supabase_anon_key = '<anon-key>';
-- Or store equivalents in Supabase Vault.

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

DO $$
BEGIN
  PERFORM cron.unschedule('send-deadline-emails-daily');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

SELECT cron.schedule(
  'send-deadline-emails-daily',
  '30 2 * * *',
  $cron$
    SELECT net.http_post(
      url := current_setting('app.supabase_url', true) || '/functions/v1/send-deadline-emails',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key', true)
      ),
      body := '{}'::jsonb
    );
  $cron$
);
