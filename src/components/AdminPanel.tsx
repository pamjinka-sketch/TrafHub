import { useState } from 'react';
import { Package, Users, FileText, Package as Materials, MessageCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import AdminOffers from '@/components/AdminOffers';
import AdminUsers from '@/components/AdminUsers';
import AdminApplications from '@/components/AdminApplications';

const MATERIALS_URL = 'https://trafhub.com/materials';
const TELEGRAM_URL = 'https://t.me/trafhub_support';

export default function AdminPanel() {
  const { t } = useApp();
  const [tab, setTab] = useState('offers');

  const tabs = [
    { id: 'offers', label: t('admin.offers'), icon: Package },
    { id: 'users', label: t('admin.users'), icon: Users },
    { id: 'applications', label: t('admin.applications'), icon: FileText },
  ];

  return (
    <div className="pt-16 min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="lg:w-60 lg:fixed lg:left-0 lg:top-16 lg:bottom-0 glass border-r border-white/5 p-4 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto">
        <nav className="flex lg:flex-col gap-2 flex-1">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                tab === item.id
                  ? 'bg-neon-emerald/10 text-neon-emerald border border-neon-emerald/20'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent'
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline lg:inline">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="flex lg:flex-col gap-2 lg:mt-4 lg:pt-4 lg:border-t lg:border-white/5">
          <a href={MATERIALS_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-white/5 hover:text-neon-cyan transition-all whitespace-nowrap">
            <Materials className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline lg:inline">{t('nav.materials')}</span>
          </a>
          <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-white/5 hover:text-neon-emerald transition-all whitespace-nowrap">
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline lg:inline">{t('nav.support')}</span>
          </a>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 lg:ml-60 p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">{t('admin.title')}</h1>
        {tab === 'offers' && <AdminOffers />}
        {tab === 'users' && <AdminUsers />}
        {tab === 'applications' && <AdminApplications />}
      </main>
    </div>
  );
}
