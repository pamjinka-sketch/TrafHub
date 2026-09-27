import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase, type Profile } from '@/lib/supabase';
import { translate, type Lang } from '@/lib/i18n';

type AuthState = {
  session: import('@supabase/supabase-js').Session | null;
  profile: Profile | null;
  loading: boolean;
};

type AppContextType = AuthState & {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ session: null, profile: null, loading: true });
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('trafhub-lang') as Lang | null;
    return saved ?? 'en';
  });

  const setLang = useCallback((l: Lang) => {
    localStorage.setItem('trafhub-lang', l);
    setLangState(l);
  }, []);

  const t = useCallback((key: string) => translate(lang, key), [lang]);

  const fetchProfile = useCallback(async (uid: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
    return data as Profile | null;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (state.session?.user?.id) {
      const p = await fetchProfile(state.session.user.id);
      setState((s) => ({ ...s, profile: p }));
    }
  }, [state.session, fetchProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setState({ session: null, profile: null, loading: false });
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      if (session) {
        const p = await fetchProfile(session.user.id);
        if (mounted) setState({ session, profile: p, loading: false });
      } else {
        if (mounted) setState({ session: null, profile: null, loading: false });
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (session) {
          const p = await fetchProfile(session.user.id);
          setState({ session, profile: p, loading: false });
        } else {
          setState({ session: null, profile: null, loading: false });
        }
      })();
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  return (
    <AppContext.Provider value={{ ...state, lang, setLang, t, refreshProfile, signOut }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
