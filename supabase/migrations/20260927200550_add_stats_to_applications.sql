/*
# Add traffic statistics columns to applications

1. Modified Tables
- `applications`: added `stat_clicks` (int, default 0), `stat_leads` (int, default 0), `stat_conversions` (int, default 0).
  These let the admin manually enter how many clicks, leads (form fills), and conversions (paid) each partner's application generated.
2. Security
- No RLS changes needed — existing application policies already cover these new columns.
*/

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS stat_clicks int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stat_leads int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stat_conversions int NOT NULL DEFAULT 0;
