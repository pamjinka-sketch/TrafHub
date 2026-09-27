/*
# Add payout_method to profiles

1. Modified Tables
- `profiles`: added `payout_method` column (text, default 'Crypto', CHECK constraint for 'Crypto' or 'Card').
  This lets partners specify whether they want to be paid via Crypto or Card, alongside their requisites.
2. Security
- No RLS policy changes needed — existing policies already cover the new column (profiles_update_own allows updating own row).
*/

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS payout_method text NOT NULL DEFAULT 'Crypto' CHECK (payout_method IN ('Crypto', 'Card'));
