import { useEffect, useState } from 'react';
import { Wallet, FileText, CheckCircle2, TrendingUp, Package, MessageCircle, ArrowRight } from 'lucide-react';
import { supabase, type Offer, type Application } from '@/lib/supabase';
import { useApp } from '@/context/AppContext';

const MATERIALS_URL = 'https://trafhub.com/materials';
const TELEGRAM_URL = 'https://t.me/trafhub_support';

export default function Dashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { t, profile } = useApp();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!profile) return;
      const [offersRes, appsRes] = await Promise.all([
        supabase.from('offers').select('*').eq('is_active', true).limit(4),
        supabase.from('applications').select('*, offer:offers(*)').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(5),
      ]);
      setOffers((offersRes.data ?? []) as Offer[]);
      setApplications((appsRes.data ?? []) as Application[]);
      setLoading(false);
    };
    fetchData();
  }, [profile]);

  if (!profile) return null;

  const approvedCount = applications.filter((a) => a.status === 'approved').length;
  const balanceUSD = (profile.balance_cents / 100).toFixed(2);

  const stats = [
    { label: t('dash.balance'), value: `$${balanceUSD}`, icon: Wallet, color: 'text-neon-emerald', bg: 'bg-neon-emerald/10' },
    { label: t('dash.stats.applications'), value: applications.length, icon: FileText, color: 'text-neon-cyan', bg: 'bg-neon-cyan/10' },
    { label: t('dash.stats.approved'), value: approvedCount, icon: CheckCircle2, color: 'text-neon-blue', bg: 'bg-neon-blue/10' },
    { label: t('dash.stats.offers'), value: offers.length, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
          {t('dash.welcome')}, <span className="neon-text">{profile.nickname || profile.email}</span>
        </h1>
        <p className="text-gray-400 text-sm">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-3 mb-8">
        <a href={MATERIALS_URL} target="_blank" rel="noopener noreferrer" className="btn-ghost flex items-center gap-2 text-sm">
          <Package className="w-4 h-4 text-neon-cyan" />
          {t('nav.materials')}
        </a>
        <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="btn-ghost flex items-center gap-2 text-sm">
          <MessageCircle className="w-4 h-4 text-neon-emerald" />
          {t('nav.support')}
        </a>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-5 hover:border-white/10 transition-all animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active offers */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">{t('dash.activeOffers')}</h2>
            <button onClick={() => onNavigate('catalog')} className="text-sm text-neon-cyan hover:underline flex items-center gap-1">
              {t('topOffers.apply')} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-ink-700/50 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {offers.map((offer) => (
                <div key={offer.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div>
                    <div className="font-semibold text-gray-200 text-sm">{offer.title}</div>
                    <div className="text-xs text-gray-500">{offer.category} · {offer.geo}</div>
                  </div>
                  <span className="text-neon-emerald font-bold text-sm">${Number(offer.payout_amount).toFixed(0)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent applications */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">{t('dash.myApplications')}</h2>
            <button onClick={() => onNavigate('applications')} className="text-sm text-neon-cyan hover:underline flex items-center gap-1">
              {t('apps.title')} <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-ink-700/50 rounded-xl animate-pulse" />)}
            </div>
          ) : applications.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">{t('apps.empty')}</p>
          ) : (
            <div className="space-y-2">
              {applications.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div>
                    <div className="font-semibold text-gray-200 text-sm">{app.offer?.title ?? '—'}</div>
                    <div className="text-xs text-gray-500">{new Date(app.created_at).toLocaleDateString()}</div>
                  </div>
                  <span className={`badge ${
                    app.status === 'approved' ? 'bg-neon-emerald/10 text-neon-emerald' :
                    app.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                    'bg-amber-500/10 text-amber-400'
                  }`}>
                    {t(`apps.status.${app.status}`)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
