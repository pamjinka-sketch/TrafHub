/*
# Add withdrawals table for partner payout requests

1. New Tables
- `withdrawals` — partner requests for balance payout. Contains user_id, amount_cents, method (Crypto/Card), status (pending/approved/rejected), admin_note, created_at, processed_at.
  Partners can request a withdrawal every 7 days (enforced by checking the last request date in the UI).
2. Security
- Enable RLS on `withdrawals`.
- Partners can read own, insert own, update own.
- Admin can read all, update all (approve/reject with notes).
*/

CREATE TABLE IF NOT EXISTS withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  amount_cents bigint NOT NULL DEFAULT 0,
  method text NOT NULL DEFAULT 'Crypto' CHECK (method IN ('Crypto','Card')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  admin_note text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "withdrawals_select_own" ON withdrawals;
CREATE POLICY "withdrawals_select_own" ON withdrawals FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "withdrawals_insert_own" ON withdrawals;
CREATE POLICY "withdrawals_insert_own" ON withdrawals FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "withdrawals_update_own" ON withdrawals;
CREATE POLICY "withdrawals_update_own" ON withdrawals FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Admin needs to see all and update all — admin role check via profiles
DROP POLICY IF EXISTS "withdrawals_admin_all" ON withdrawals;
CREATE POLICY "withdrawals_admin_all" ON withdrawals
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
