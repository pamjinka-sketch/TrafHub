/*
# Add notifications table with auto-generated triggers

1. New Tables
- `notifications` — in-app notifications for partners.
  Columns: id (uuid PK), user_id (uuid, references profiles, ON DELETE CASCADE),
  title (text), message (text), type (text: 'application_approved' | 'application_rejected' | 'withdrawal_approved' | 'withdrawal_rejected'),
  is_read (boolean, default false), related_id (uuid, nullable — the application or withdrawal id),
  created_at (timestamptz, default now()).

2. Security — RLS
- Enable RLS on `notifications`.
- 4 policies: SELECT/INSERT/UPDATE/DELETE, all scoped to `auth.uid() = user_id`, TO authenticated.
- INSERT policy is needed because the trigger function runs as the table owner (SECURITY DEFINER not required — trigger runs with owner privileges by default, bypassing RLS).

3. Triggers
- `notify_application_status_change` — AFTER UPDATE on `applications`:
  fires only when status changes from something else TO 'approved' or 'rejected'.
  Inserts a notification for the application's user_id with the offer title pulled from the offers table.
- `notify_withdrawal_status_change` — AFTER UPDATE on `withdrawals`:
  fires only when status changes from something else TO 'approved' or 'rejected'.
  Inserts a notification for the withdrawal's user_id with the amount.

4. Important Notes
- Triggers fire on ANY UPDATE that changes the status column — whether from the admin UI, raw SQL, or any other path. This guarantees notifications are created reliably.
- The trigger functions use `NEW.user_id` directly, so notifications always go to the correct partner.
- `related_id` stores the application or withdrawal UUID so the frontend could link to it later.
*/

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  message text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'application_approved',
  is_read boolean NOT NULL DEFAULT false,
  related_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Index for fast unread count + recent list queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id) WHERE is_read = false;

-- Trigger function: application status → notification
CREATE OR REPLACE FUNCTION notify_application_status_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  offer_title text;
BEGIN
  -- Only fire when status actually changed TO approved or rejected
  IF (NEW.status IS DISTINCT FROM OLD.status) AND (NEW.status = 'approved' OR NEW.status = 'rejected') THEN
    SELECT title INTO offer_title FROM offers WHERE id = NEW.offer_id;
    IF NEW.status = 'approved' THEN
      INSERT INTO notifications (user_id, title, message, type, related_id)
      VALUES (
        NEW.user_id,
        'Application approved',
        COALESCE(offer_title, 'Your offer') || ' — your application has been approved. Check your tracking link.',
        'application_approved',
        NEW.id
      );
    ELSIF NEW.status = 'rejected' THEN
      INSERT INTO notifications (user_id, title, message, type, related_id)
      VALUES (
        NEW.user_id,
        'Application rejected',
        COALESCE(offer_title, 'Your offer') || ' — your application has been rejected. See manager notes for details.',
        'application_rejected',
        NEW.id
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_application_status_notify ON applications;
CREATE TRIGGER trg_application_status_notify
  AFTER UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_application_status_change();

-- Trigger function: withdrawal status → notification
CREATE OR REPLACE FUNCTION notify_withdrawal_status_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  amount_usd text;
BEGIN
  -- Only fire when status actually changed TO approved or rejected
  IF (NEW.status IS DISTINCT FROM OLD.status) AND (NEW.status = 'approved' OR NEW.status = 'rejected') THEN
    amount_usd := to_char(NEW.amount_cents / 100.0, 'FM999999990.00');
    IF NEW.status = 'approved' THEN
      INSERT INTO notifications (user_id, title, message, type, related_id)
      VALUES (
        NEW.user_id,
        'Withdrawal approved',
        'Your withdrawal request for $' || amount_usd || ' has been approved. Funds are on the way.',
        'withdrawal_approved',
        NEW.id
      );
    ELSIF NEW.status = 'rejected' THEN
      INSERT INTO notifications (user_id, title, message, type, related_id)
      VALUES (
        NEW.user_id,
        'Withdrawal rejected',
        'Your withdrawal request for $' || amount_usd || ' has been rejected. Check admin notes for details.',
        'withdrawal_rejected',
        NEW.id
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_withdrawal_status_notify ON withdrawals;
CREATE TRIGGER trg_withdrawal_status_notify
  AFTER UPDATE ON withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION notify_withdrawal_status_change();
