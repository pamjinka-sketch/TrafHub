import { useState } from 'react';
import { LayoutDashboard, Store, FileText, Settings, Package, MessageCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import Dashboard from '@/components/Dashboard';
import OfferCatalog from '@/components/OfferCatalog';
import Applications from '@/components/Applications';
import ProfileSettings from '@/components/ProfileSettings';

const MATERIALS_URL = 'https://trafhub.com/materials';
const TELEGRAM_URL = 'https://t.me/trafhub_support';

export default function PartnerCabinet() {
  const { t } = useApp();
  const [page, setPage] = useState('dashboard');

  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'catalog', label: t('catalog.title'), icon: Store },
    { id: 'applications', label: t('apps.title'), icon: FileText },
    { id: 'profile', label: t('profile.title'), icon: Settings },
  ];

  return (
    <div className="pt-16 min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="lg:w-60 lg:fixed lg:left-0 lg:top-16 lg:bottom-0 glass border-r border-white/5 p-4 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto">
        <nav className="flex lg:flex-col gap-2 flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                page === item.id
                  ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent'
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline lg:inline">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Quick links in sidebar */}
        <div className="flex lg:flex-col gap-2 lg:mt-4 lg:pt-4 lg:border-t lg:border-white/5">
          <a href={MATERIALS_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-white/5 hover:text-neon-cyan transition-all whitespace-nowrap">
            <Package className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline lg:inline">{t('nav.materials')}</span>
          </a>
          <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-white/5 hover:text-neon-emerald transition-all whitespace-nowrap">
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline lg:inline">{t('nav.support')}</span>
          </a>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 lg:ml-60">
        {page === 'dashboard' && <Dashboard onNavigate={setPage} />}
        {page === 'catalog' && <OfferCatalog />}
        {page === 'applications' && <Applications />}
        {page === 'profile' && <ProfileSettings />}
      </main>
    </div>
  );
}
