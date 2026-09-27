import { useState } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import LandingPage from '@/components/LandingPage';
import PartnerCabinet from '@/components/PartnerCabinet';
import AdminPanel from '@/components/AdminPanel';

function AppContent() {
  const { profile, loading } = useApp();
  const [authModal, setAuthModal] = useState<null | 'login' | 'register'>(null);
  const [page, setPage] = useState<'home' | 'dashboard' | 'admin'>('home');

  const handleNavigate = (target: string) => {
    if (target === 'home') setPage('home');
    else if (target === 'admin') setPage('admin');
    else setPage('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-neon-cyan/20 border-t-neon-cyan animate-spin" />
          <p className="text-gray-500 text-sm">Loading TrafHub...</p>
        </div>
      </div>
    );
  }

  // Determine which page to show
  const isAdmin = profile?.role === 'admin';

  // If logged in and on home, show landing page (with header showing dashboard link)
  // If logged in and page is dashboard, show partner cabinet
  // If admin and page is admin, show admin panel
  const showLanding = page === 'home';
  const showDashboard = !!profile && page === 'dashboard';
  const showAdmin = !!isAdmin && page === 'admin';

  return (
    <div className="min-h-screen bg-ink-950">
      <Header
        onLogin={() => setAuthModal('login')}
        onRegister={() => setAuthModal('register')}
        onNavigate={handleNavigate}
      />

      {showLanding && <LandingPage onRegister={() => setAuthModal('register')} />}
      {showDashboard && <PartnerCabinet />}
      {showAdmin && <AdminPanel />}

      {showLanding && <Footer />}

      <AuthModal
        mode={authModal ?? 'login'}
        open={authModal !== null}
        onClose={() => setAuthModal(null)}
        onSwitchMode={(m) => setAuthModal(m)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
