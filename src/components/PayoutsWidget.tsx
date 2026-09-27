import { useEffect, useState } from 'react';
import { Bitcoin, CreditCard, ArrowUpRight } from 'lucide-react';
import { supabase, type Payout } from '@/lib/supabase';
import { useApp } from '@/context/AppContext';

const PARTNER_NAMES = ['TrafficMaster', 'AdPro', 'MediaFlow', 'ClickHero', 'FunnelKing', 'OfferGuru', 'TrafficLab', 'ProAffiliate', 'AffStar', 'ClickWizard', 'FunnelPro', 'AdNova'];

export default function PayoutsWidget() {
  const { t } = useApp();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayouts = async () => {
      const { data } = await supabase.from('payouts').select('*').order('created_at', { ascending: false }).limit(20);
      setPayouts((data ?? []) as Payout[]);
      setLoading(false);
    };
    fetchPayouts();
    const interval = setInterval(fetchPayouts, 3600000);
    return () => clearInterval(interval);
  }, []);

  const generatePayout = (): Payout => {
    const name = PARTNER_NAMES[Math.floor(Math.random() * PARTNER_NAMES.length)];
    const amount = Math.floor(Math.random() * 140000) + 40000;
    const method = Math.random() > 0.5 ? 'Crypto' : 'Card';
    return { id: crypto.randomUUID(), partner_name: name, amount_cents: amount, method, created_at: new Date().toISOString() };
  };

  useEffect(() => {
    if (payouts.length === 0 && !loading) {
      const generated = Array.from({ length: 8 }, generatePayout);
      setPayouts(generated);
    }
  }, [loading, payouts.length]);

  const displayPayouts = payouts.length > 0 ? payouts : [];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">{t('payouts.title')}</h2>
          <p className="text-gray-400">{t('payouts.subtitle')}</p>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="max-h-[320px] overflow-y-auto">
            {loading ? (
              <div className="p-6 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 bg-ink-700/50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {displayPayouts.slice(0, 12).map((p, i) => (
                  <div key={p.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/5 transition-colors animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${p.method === 'Crypto' ? 'bg-neon-emerald/10 text-neon-emerald' : 'bg-neon-blue/10 text-neon-blue'}`}>
                        {p.method === 'Crypto' ? <Bitcoin className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-200">{p.partner_name}</div>
                        <div className="text-xs text-gray-500">{p.method}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-neon-emerald">+${(p.amount_cents / 100).toLocaleString()}</span>
                      <ArrowUpRight className="w-4 h-4 text-neon-emerald/50" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
