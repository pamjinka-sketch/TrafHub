import { useEffect, useState } from 'react';
import { TrendingUp, Globe2, DollarSign, ChevronDown } from 'lucide-react';
import { supabase, type Offer } from '@/lib/supabase';
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

export default function TopOffers({ onApply }: { onApply?: () => void }) {
  const { t } = useApp();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      const { data } = await supabase.from('offers').select('*').eq('is_active', true).order('payout_amount', { ascending: false }).limit(6);
      setOffers((data ?? []) as Offer[]);
      setLoading(false);
    };
    fetchOffers();
  }, []);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">{t('topOffers.title')}</h2>
          <p className="text-gray-400">{t('topOffers.subtitle')}</p>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card p-6 h-56 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {offers.map((offer, i) => (
              <div key={offer.id} className="glass-card p-6 hover:border-neon-cyan/30 hover:shadow-[0_0_30px_rgba(6,224,208,0.08)] transition-all duration-300 group animate-fade-up cursor-default" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex items-start justify-between mb-4">
                  <span className={`badge bg-gradient-to-br ${CATEGORY_COLORS[offer.category] ?? 'from-gray-500/20 to-gray-600/5 text-gray-400 border-gray-500/20'} border`}>
                    {offer.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Globe2 className="w-3.5 h-3.5" />
                    {offer.geo}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-neon-cyan transition-colors">{offer.title}</h3>
                <p className="text-sm text-gray-400 line-clamp-2 mb-4">{offer.description}</p>

                <div className="flex items-end justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-5 h-5 text-neon-emerald" />
                      <span className="text-2xl font-bold text-neon-emerald">{Number(offer.payout_amount).toFixed(0)}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {offer.payout_type === 'CPA' ? t('topOffers.perLead') : t('topOffers.perDeposit')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <TrendingUp className="w-3.5 h-3.5 text-neon-emerald/60" />
                    {offer.payout_type}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <button onClick={onApply} className="btn-ghost inline-flex items-center gap-1.5">
            {t('topOffers.apply')}
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
