import { useState, useEffect } from 'react';
import { Activity, Globe, ChevronDown, LogIn, UserPlus, LogOut, LayoutDashboard, Shield, Package, FileText, MessageCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { languages, type Lang } from '@/lib/i18n';
import NotificationBell from '@/components/NotificationBell';

const MATERIALS_URL = 'https://trafhub.com/materials';
const TELEGRAM_URL = 'https://t.me/trafhub_support';

export default function Header({ onLogin, onRegister, onNavigate }: { onLogin: () => void; onRegister: () => void; onNavigate: (page: string) => void }) {
  const { t, lang, setLang, profile, signOut } = useApp();
  const [langOpen, setLangOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (page: string) => {
    onNavigate(page);
    setMobileMenu(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-lg shadow-black/20' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => handleNav(profile ? (profile.role === 'admin' ? 'admin' : 'dashboard') : 'home')} className="flex items-center gap-2 group">
            <div className="relative">
              <Activity className="w-8 h-8 text-neon-cyan group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-neon-cyan/30 blur-lg group-hover:bg-neon-cyan/50 transition-all" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Traf<span className="neon-text">Hub</span>
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language switcher */}
            <div className="relative">
              <button onClick={() => setLangOpen(!langOpen)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm">
                <Globe className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">{languages.find((l) => l.code === lang)?.flag}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              {langOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setLangOpen(false)} />
                  <div className="absolute right-0 mt-2 w-36 glass rounded-xl shadow-xl z-20 animate-scale-in py-1">
                    {languages.map((l) => (
                      <button key={l.code} onClick={() => { setLang(l.code as Lang); setLangOpen(false); }} className={`w-full px-4 py-2 text-left text-sm hover:bg-white/5 transition-colors ${lang === l.code ? 'text-neon-cyan font-semibold' : 'text-gray-300'}`}>
                        {l.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Materials link */}
            <a href={MATERIALS_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-gray-300">
              <Package className="w-4 h-4" />
              <span>{t('nav.materials')}</span>
            </a>

            {/* Support link */}
            <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-gray-300">
              <MessageCircle className="w-4 h-4" />
              <span>{t('nav.support')}</span>
            </a>

            {/* Auth buttons */}
            {profile ? (
              <>
                <NotificationBell />
                {profile.role === 'admin' && (
                  <button onClick={() => handleNav('admin')} className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-neon-emerald">
                    <Shield className="w-4 h-4" />
                    <span>{t('nav.admin')}</span>
                  </button>
                )}
                <button onClick={() => handleNav('dashboard')} className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-gray-300">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{t('nav.dashboard')}</span>
                </button>
                <button onClick={signOut} className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm text-gray-400">
                  <LogOut className="w-4 h-4" />
                  <span>{t('nav.logout')}</span>
                </button>
              </>
            ) : (
              <>
                <button onClick={onLogin} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all">
                  <LogIn className="w-4 h-4" />
                  <span>{t('nav.login')}</span>
                </button>
                <button onClick={onRegister} className="btn-primary text-sm">
                  <span className="flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4" />
                    {t('nav.register')}
                  </span>
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors">
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className={`h-0.5 bg-gray-300 transition-all ${mobileMenu ? 'rotate-45 translate-y-1.5' : ''}`} />
              <span className={`h-0.5 bg-gray-300 transition-all ${mobileMenu ? 'opacity-0' : ''}`} />
              <span className={`h-0.5 bg-gray-300 transition-all ${mobileMenu ? '-rotate-45 -translate-y-1.5' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="md:hidden pb-4 pt-2 space-y-1 animate-fade-in">
            <a href={MATERIALS_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-white/5 text-sm text-gray-300">
              <Package className="w-4 h-4" /> {t('nav.materials')}
            </a>
            <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-white/5 text-sm text-gray-300">
              <MessageCircle className="w-4 h-4" /> {t('nav.support')}
            </a>
            <div className="flex items-center gap-2 px-3 py-2.5">
              {languages.map((l) => (
                <button key={l.code} onClick={() => setLang(l.code as Lang)} className={`px-3 py-1.5 rounded-lg text-sm ${lang === l.code ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-white/5 text-gray-400'}`}>
                  {l.label}
                </button>
              ))}
            </div>
            {profile ? (
              <>
                <div className="flex items-center justify-between px-3 py-2.5">
                  <NotificationBell />
                </div>
                {profile.role === 'admin' && (
                  <button onClick={() => handleNav('admin')} className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-white/5 text-sm text-neon-emerald w-full">
                    <Shield className="w-4 h-4" /> {t('nav.admin')}
                  </button>
                )}
                <button onClick={() => handleNav('dashboard')} className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-white/5 text-sm text-gray-300 w-full">
                  <LayoutDashboard className="w-4 h-4" /> {t('nav.dashboard')}
                </button>
                <button onClick={() => { signOut(); setMobileMenu(false); }} className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-white/5 text-sm text-gray-400 w-full">
                  <LogOut className="w-4 h-4" /> {t('nav.logout')}
                </button>
              </>
            ) : (
              <div className="flex gap-2 px-3 pt-2">
                <button onClick={() => { onLogin(); setMobileMenu(false); }} className="btn-ghost flex-1 text-sm">{t('nav.login')}</button>
                <button onClick={() => { onRegister(); setMobileMenu(false); }} className="btn-primary flex-1 text-sm">{t('nav.register')}</button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
