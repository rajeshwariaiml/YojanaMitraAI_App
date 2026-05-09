-- Add match_percentage to saved_schemes so the user's match score is preserved when saving.
ALTER TABLE public.saved_schemes
  ADD COLUMN IF NOT EXISTS match_percentage numeric NOT NULL DEFAULT 0;
