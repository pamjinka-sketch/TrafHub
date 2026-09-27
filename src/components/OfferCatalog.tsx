import { useEffect, useState, useMemo } from 'react';
import { Search, Globe2, DollarSign, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase, type Offer, type Application } from '@/lib/supabase';
import { useApp } from '@/context/AppContext';

const CATEGORY_COLORS: Record<string, string> = {
  Insurance: 'from-blue-500/20 to-blue-600/5 text-blue-400 border-blue-500/20',
  Gambling: 'from-red-500/20 to-red-600/5 text-red-400 border-red-500/20',
  Crypto: 'from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/20',
  Nutra: 'from-green-500/20 to-green-600/5 text-green-400 border-green-500/20',
  Sweepstakes: 'from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/20',
  Betting: 'from-orange-500/20 to-orange-600/5 text-orange-400 border-orange-500/20',
  Finance: 'from-cyan-500/20 to-cyan-600/5 text-cyan-400 border-cyan-500/20',
  Dating: 'from-pink-500/20 to-pink-600/5 text-pink-400 border-pink-500/20',
  'E-commerce': 'from-indigo-500/20 to-indigo-600/5 text-indigo-400 border-indigo-500/20',
};

export default function OfferCatalog() {
  const { t, profile } = useApp();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [applying, setApplying] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [offersRes, appsRes] = await Promise.all([
        supabase.from('offers').select('*').eq('is_active', true).order('created_at', { ascending: false }),
        profile ? supabase.from('applications').select('*').eq('user_id', profile.id) : Promise.resolve({ data: [] }),
      ]);
      setOffers((offersRes.data ?? []) as Offer[]);
      setApplications((appsRes.data ?? []) as Application[]);
      setLoading(false);
    };
    fetchData();
  }, [profile]);

  const categories = useMemo(() => {
    const cats = new Set(offers.map((o) => o.category));
    return ['all', ...Array.from(cats).sort()];
  }, [offers]);

  const filtered = useMemo(() => {
    return offers.filter((o) => {
      const matchSearch = !search || o.title.toLowerCase().includes(search.toLowerCase()) || o.description.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === 'all' || o.category === category;
      return matchSearch && matchCategory;
    });
  }, [offers, search, category]);

  const appliedOfferIds = new Set(applications.map((a) => a.offer_id));

  const handleApply = async (offerId: string) => {
    if (!profile || appliedOfferIds.has(offerId)) return;
    setApplying(offerId);
    const { data, error } = await supabase.from('applications').insert({ user_id: profile.id, offer_id: offerId }).select('*').maybeSingle();
    if (!error && data) {
      setApplications((prev) => [...prev, data as Application]);
    }
    setApplying(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">{t('catalog.title')}</h1>

      {/* Search & filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('catalog.search')} className="input-field pl-10" />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field sm:w-52 cursor-pointer">
          <option value="all">{t('catalog.allCategories')}</option>
          {categories.filter((c) => c !== 'all').map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Offers grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} className="glass-card p-6 h-64 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">{t('catalog.noResults')}</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((offer, i) => {
            const applied = appliedOfferIds.has(offer.id);
            return (
              <div key={offer.id} className="glass-card p-6 hover:border-neon-cyan/30 transition-all duration-300 group animate-fade-up flex flex-col" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-start justify-between mb-4">
                  <span className={`badge bg-gradient-to-br ${CATEGORY_COLORS[offer.category] ?? 'from-gray-500/20 to-gray-600/5 text-gray-400 border-gray-500/20'} border`}>
                    {offer.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Globe2 className="w-3.5 h-3.5" />{offer.geo}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-neon-cyan transition-colors">{offer.title}</h3>
                <p className="text-sm text-gray-400 mb-3 flex-1">{offer.description}</p>
                <div className="text-xs text-gray-500 bg-ink-800/50 rounded-lg px-3 py-2 mb-4 border border-white/5">
                  {offer.requirements}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-5 h-5 text-neon-emerald" />
                    <span className="text-xl font-bold text-neon-emerald">{Number(offer.payout_amount).toFixed(0)}</span>
                    <span className="text-xs text-gray-500">{offer.payout_type === 'CPA' ? t('topOffers.perLead') : t('topOffers.perDeposit')}</span>
                  </div>
                  <button
                    onClick={() => handleApply(offer.id)}
                    disabled={applied || applying === offer.id}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      applied
                        ? 'bg-ink-700 text-gray-500 cursor-default flex items-center gap-1.5'
                        : 'btn-primary'
                    }`}
                  >
                    {applied ? <><CheckCircle2 className="w-4 h-4" /> {t('catalog.applied')}</> :
                     applying === offer.id ? <Loader2 className="w-4 h-4 animate-spin" /> :
                     t('catalog.apply')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
