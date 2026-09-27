import { useState, useEffect } from 'react';
import { X, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/context/AppContext';

type Mode = 'login' | 'register';

export default function AuthModal({ mode, open, onClose, onSwitchMode }: { mode: Mode; open: boolean; onClose: () => void; onSwitchMode: (m: Mode) => void }) {
  const { t } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setError('');
      setEmail('');
      setPassword('');
      setNickname('');
    }
  }, [open]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { nickname } },
        });
        if (signUpError) throw signUpError;

        // Update nickname on profile after trigger creates the row
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user) {
          await supabase.from('profiles').update({ nickname }).eq('id', sessionData.session.user.id);
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('already registered') || msg.includes('already been registered')) {
        setError(t('auth.error') + ' — email already registered');
      } else if (msg.includes('Invalid login')) {
        setError(t('auth.error') + ' — invalid credentials');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md glass-card p-8 animate-scale-in shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-1">
            {mode === 'login' ? t('auth.loginTitle') : t('auth.registerTitle')}
          </h2>
          {mode === 'register' && (
            <p className="text-xs text-neon-cyan/70 bg-neon-cyan/5 border border-neon-cyan/10 rounded-lg px-3 py-2 mt-2">
              {t('auth.firstUserNote')}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">{t('auth.nickname')}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} className="input-field pl-10" placeholder="partner_pro" required />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">{t('auth.email')}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-10" placeholder="you@example.com" required />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">{t('auth.password')}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pl-10" placeholder="••••••••" required minLength={6} />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? '...' : mode === 'login' ? t('auth.loginBtn') : t('auth.registerBtn')}
          </button>
        </form>

        <button onClick={() => onSwitchMode(mode === 'login' ? 'register' : 'login')} className="w-full mt-4 text-sm text-gray-400 hover:text-neon-cyan transition-colors text-center">
          {mode === 'login' ? t('auth.noAccount') : t('auth.haveAccount')}
        </button>
      </div>
    </div>
  );
}
