import { Activity } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function Footer() {
  const { t } = useApp();
  return (
    <footer className="border-t border-white/5 py-8 px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-neon-cyan" />
          <span className="font-bold">Traf<span className="neon-text">Hub</span></span>
          <span className="text-sm text-gray-500 ml-2">© 2026 — {t('footer.rights')}</span>
        </div>
        <div className="text-sm text-gray-500">CPA Affiliate Network</div>
      </div>
    </footer>
  );
}
