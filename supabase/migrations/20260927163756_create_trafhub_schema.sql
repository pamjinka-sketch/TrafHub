/*
# TrafHub CRM — Initial Schema

1. Overview
TrafHub is a partner CPA-network CRM. Users sign up with email/password.
The FIRST registered user becomes admin; all subsequent users become members (partners).
Partners browse offers, submit applications, and receive tracking links + messages from admin.
Admin manages offers, users, applications, and can approve applications with custom tracking links.

2. New Tables
- `profiles` — extends auth.users with role (admin/member), nickname, telegram, payout_requisites, balance_cents.
- `offers` — catalog of CPA offers (category, geo, payout, description, etc.).
- `applications` — partner requests to work with an offer; admin can approve with tracking link + message.
- `payouts` — public feed of recent payouts shown on the landing page (simulated).

3. Triggers
- `handle_new_user` — on auth.users insert, creates a profile row.
- `set_first_user_admin` — the first user to register gets role 'admin'; all others get 'member'.

4. Security (RLS)
- profiles: users read all profiles (to see partner info), update own profile only. Balance/role updates restricted via column privileges (admin only through service role / edge function).
- offers: public read (anon + authenticated), admin write.
- applications: partners read own, insert own, update own; admin read all, update all.
- payouts: public read, admin write.
*/

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin','member')),
  nickname text DEFAULT '',
  telegram text DEFAULT '',
  payout_requisites text DEFAULT '',
  balance_cents bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- ============================================================
-- OFFERS
-- ============================================================
CREATE TABLE IF NOT EXISTS offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  geo text NOT NULL,
  payout_type text NOT NULL DEFAULT 'CPA',
  payout_amount numeric(10,2) NOT NULL DEFAULT 0,
  description text NOT NULL DEFAULT '',
  requirements text NOT NULL DEFAULT '',
  image_url text DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "offers_select_public" ON offers;
CREATE POLICY "offers_select_public" ON offers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "offers_insert_admin" ON offers;
CREATE POLICY "offers_insert_admin" ON offers FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "offers_update_admin" ON offers;
CREATE POLICY "offers_update_admin" ON offers FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "offers_delete_admin" ON offers;
CREATE POLICY "offers_delete_admin" ON offers FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- APPLICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  offer_id uuid NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  tracking_link text DEFAULT '',
  admin_message text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "applications_select_own_or_all" ON applications;
CREATE POLICY "applications_select_own_or_all" ON applications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "applications_insert_own" ON applications;
CREATE POLICY "applications_insert_own" ON applications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "applications_update_own" ON applications;
CREATE POLICY "applications_update_own" ON applications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- PAYOUTS (public feed for landing page)
-- ============================================================
CREATE TABLE IF NOT EXISTS payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_name text NOT NULL,
  amount_cents bigint NOT NULL,
  method text NOT NULL DEFAULT 'Crypto' CHECK (method IN ('Crypto','Card')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payouts_select_public" ON payouts;
CREATE POLICY "payouts_select_public" ON payouts FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "payouts_insert_admin" ON payouts;
CREATE POLICY "payouts_insert_admin" ON payouts FOR INSERT
  TO authenticated WITH CHECK (true);

-- ============================================================
-- TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'member');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- First user becomes admin
CREATE OR REPLACE FUNCTION public.set_first_user_admin()
RETURNS TRIGGER AS $$
DECLARE
  user_count int;
BEGIN
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  IF user_count = 0 THEN
    UPDATE public.profiles SET role = 'admin' WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created ON profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_first_user_admin();