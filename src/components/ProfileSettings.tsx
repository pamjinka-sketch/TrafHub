import { useState, useEffect } from 'react';
import { User, Send, Check, Bitcoin, CreditCard } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/context/AppContext';

export default function ProfileSettings() {
  const { t, profile, refreshProfile } = useApp();
  const [nickname, setNickname] = useState('');
  const [telegram, setTelegram] = useState('');
  const [payoutMethod, setPayoutMethod] = useState<'Crypto' | 'Card'>('Crypto');
  const [requisites, setRequisites] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setNickname(profile.nickname || '');
      setTelegram(profile.telegram || '');
      setPayoutMethod(profile.payout_method || 'Crypto');
      setRequisites(profile.payout_requisites || '');
    }
  }, [profile]);

  if (!profile) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      nickname,
      telegram,
      payout_method: payoutMethod,
      payout_requisites: requisites,
    }).eq('id', profile.id);

    if (!error) {
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">{t('profile.title')}</h1>

      <form onSubmit={handleSave} className="glass-card p-6 space-y-5">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">{t('profile.nickname')}</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} className="input-field pl-10" placeholder="partner_pro" />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">{t('profile.telegram')}</label>
          <input type="text" value={telegram} onChange={(e) => setTelegram(e.target.value)} className="input-field" placeholder="@username" />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">{t('profile.payoutMethod')}</label>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setPayoutMethod('Crypto')} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border transition-all ${payoutMethod === 'Crypto' ? 'border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan' : 'border-white/10 bg-ink-800 text-gray-400 hover:border-white/20'}`}>
              <Bitcoin className="w-5 h-5" />
              <span className="font-semibold">Crypto</span>
            </button>
            <button type="button" onClick={() => setPayoutMethod('Card')} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border transition-all ${payoutMethod === 'Card' ? 'border-neon-blue/40 bg-neon-blue/10 text-neon-blue' : 'border-white/10 bg-ink-800 text-gray-400 hover:border-white/20'}`}>
              <CreditCard className="w-5 h-5" />
              <span className="font-semibold">Card</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">{t('profile.requisites')}</label>
          <textarea value={requisites} onChange={(e) => setRequisites(e.target.value)} className="input-field min-h-[100px] resize-y" placeholder={payoutMethod === 'Crypto' ? 'USDT TRC20: T...' : 'Card number, name, expiry...'} />
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-50">
            {saving ? '...' : <><Send className="w-4 h-4" /> {t('profile.save')}</>}
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-neon-emerald animate-fade-in">
              <Check className="w-4 h-4" /> {t('profile.saved')}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
