import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  role: 'admin' | 'member';
  nickname: string;
  telegram: string;
  payout_method: 'Crypto' | 'Card';
  payout_requisites: string;
  balance_cents: number;
  created_at: string;
};

export type Offer = {
  id: string;
  title: string;
  category: string;
  geo: string;
  payout_type: string;
  payout_amount: number;
  description: string;
  requirements: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
};

export type Application = {
  id: string;
  user_id: string;
  offer_id: string;
  status: 'pending' | 'approved' | 'rejected';
  tracking_link: string;
  admin_message: string;
  stat_clicks: number;
  stat_leads: number;
  stat_conversions: number;
  created_at: string;
  updated_at: string;
  offer?: Offer;
};

export type Payout = {
  id: string;
  partner_name: string;
  amount_cents: number;
  method: 'Crypto' | 'Card';
  created_at: string;
};

export type Withdrawal = {
  id: string;
  user_id: string;
  amount_cents: number;
  method: 'Crypto' | 'Card';
  status: 'pending' | 'approved' | 'rejected';
  admin_note: string;
  created_at: string;
  processed_at: string | null;
};
