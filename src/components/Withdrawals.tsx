import { useState, useEffect } from 'react';
import { Bitcoin, CreditCard, Wallet, Clock, CheckCircle2, XCircle, Send, Check, Info } from 'lucide-react';
import { supabase, type Withdrawal, type Profile } from '@/lib/supabase';
import { useApp } from '@/context/AppContext';

export default function Withdrawals() {
  const { t, profile, refreshProfile } = useApp();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'Crypto' | 'Card'>('Crypto');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      setMethod(profile.payout_method || 'Crypto');
      fetchWithdrawals();
    }
  }, [profile]);

  const fetchWithdrawals = async () => {
    if (!profile) return;
    const { data } = await supabase.from('withdrawals').select('*').eq('user_id', profile.id).order('created_at', { ascending: false });
    setWithdrawals((data ?? []) as Withdrawal[]);
    setLoading(false);
  };

  // Check 7-day cooldown
  const lastWithdrawal = withdrawals.find((w) => w.status !== 'rejected');
  const cooldownDaysLeft = (() => {
    if (!lastWithdrawal) return 0;
    const lastDate = new Date(lastWithdrawal.created_at);
    const nextAvailable = new Date(lastDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();
    if (now >= nextAvailable) return 0;
    return Math.ceil((nextAvailable.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  })();

  const balanceUSD = profile ? profile.balance_cents / 100 : 0;
  const canWithdraw = cooldownDaysLeft === 0 && balanceUSD >= 50;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < 50) {
      setFeedback({ type: 'error', msg: t('withdraw.minAmount') });
      return;
    }
    const amountCents = Math.round(amountNum * 100);
    if (amountCents > profile.balance_cents) {
      setFeedback({ type: 'error', msg: t('withdraw.insufficient') });
      return;
    }
    if (cooldownDaysLeft > 0) return;

    setSubmitting(true);
    const { error } = await supabase.from('withdrawals').insert({
      user_id: profile.id,
      amount_cents: amountCents,
      method,
    });

    if (!error) {
      setFeedback({ type: 'success', msg: t('withdraw.success') });
      setAmount('');
      fetchWithdrawals();
    } else {
      setFeedback({ type: 'error', msg: error.message });
    }
    setSubmitting(false);
    setTimeout(() => setFeedback(null), 4000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 glass-card animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">{t('withdraw.title')}</h1>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Balance card */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="w-5 h-5 text-neon-emerald" />
            <span className="text-sm text-gray-400">{t('withdraw.available')}</span>
          </div>
          <div className="text-3xl font-bold text-neon-emerald">${balanceUSD.toFixed(2)}</div>
        </div>

        {/* Cooldown info */}
        <div className="glass-card p-6 lg:col-span-2">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cooldownDaysLeft === 0 ? 'bg-neon-emerald/10' : 'bg-amber-500/10'}`}>
              {cooldownDaysLeft === 0 ? <CheckCircle2 className="w-5 h-5 text-neon-emerald" /> : <Clock className="w-5 h-5 text-amber-400" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-200">
                {cooldownDaysLeft === 0 ? t('withdraw.cooldown') : t('withdraw.cooldownActive').replace('{days}', String(cooldownDaysLeft))}
              </p>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Info className="w-3 h-3" />
                {t('withdraw.minAmount')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal form */}
      <div className="glass-card p-6 mb-8">
        <h2 className="text-lg font-bold text-white mb-4">{t('withdraw.request')}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">{t('withdraw.amount')}</label>
            <input
              type="number"
              step="0.01"
              min="50"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field"
              placeholder="50.00"
              disabled={!canWithdraw}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">{t('withdraw.method')}</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setMethod('Crypto')} disabled={!canWithdraw}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border transition-all disabled:opacity-50 ${method === 'Crypto' ? 'border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan' : 'border-white/10 bg-ink-800 text-gray-400'}`}>
                <Bitcoin className="w-5 h-5" /><span className="font-semibold">Crypto</span>
              </button>
              <button type="button" onClick={() => setMethod('Card')} disabled={!canWithdraw}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border transition-all disabled:opacity-50 ${method === 'Card' ? 'border-neon-blue/40 bg-neon-blue/10 text-neon-blue' : 'border-white/10 bg-ink-800 text-gray-400'}`}>
                <CreditCard className="w-5 h-5" /><span className="font-semibold">Card</span>
              </button>
            </div>
          </div>

          {profile?.payout_requisites && (
            <div className="text-xs text-gray-500 bg-ink-800/50 rounded-lg px-3 py-2 border border-white/5">
              <span className="text-gray-400">{t('withdraw.method')}:</span> {profile.payout_requisites}
            </div>
          )}

          {feedback && (
            <div className={`flex items-center gap-2 text-sm rounded-lg px-4 py-2.5 animate-fade-in ${feedback.type === 'success' ? 'text-neon-emerald bg-neon-emerald/10 border border-neon-emerald/20' : 'text-red-400 bg-red-500/10 border border-red-500/20'}`}>
              {feedback.type === 'success' ? <Check className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {feedback.msg}
            </div>
          )}

          <button type="submit" disabled={!canWithdraw || submitting} className="btn-primary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
            {submitting ? '...' : <><Send className="w-4 h-4" /> {t('withdraw.submit')}</>}
          </button>
        </form>
      </div>

      {/* Withdrawal history */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-bold text-white mb-4">{t('withdraw.history')}</h2>
        {withdrawals.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">{t('withdraw.empty')}</p>
        ) : (
          <div className="space-y-2">
            {withdrawals.map((w) => (
              <div key={w.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${w.method === 'Crypto' ? 'bg-neon-emerald/10 text-neon-emerald' : 'bg-neon-blue/10 text-neon-blue'}`}>
                    {w.method === 'Crypto' ? <Bitcoin className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-200">${(w.amount_cents / 100).toFixed(2)}</div>
                    <div className="text-xs text-gray-500">{new Date(w.created_at).toLocaleDateString()}</div>
                    {w.admin_note && <div className="text-xs text-gray-500 mt-0.5">{t('withdraw.adminNote')}: {w.admin_note}</div>}
                  </div>
                </div>
                <span className={`badge ${w.status === 'approved' ? 'bg-neon-emerald/10 text-neon-emerald' : w.status === 'rejected' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  {w.status === 'approved' ? <CheckCircle2 className="w-3.5 h-3.5" /> : w.status === 'rejected' ? <XCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  {t(`withdraw.status.${w.status}`)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
