import { Sparkles, ArrowRight, Package, MessageCircle, TrendingUp, Users, Wallet } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const MATERIALS_URL = 'https://trafhub.com/materials';
const TELEGRAM_URL = 'https://t.me/trafhub_support';

export default function Hero({ onRegister }: { onRegister: () => void }) {
  const { t } = useApp();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-emerald/10 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(5,6,8,0.8)_100%)]" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-neon-cyan" />
          <span className="text-sm text-gray-300">TrafHub CPA Network</span>
          <span className="w-1.5 h-1.5 rounded-full bg-neon-emerald animate-pulse" />
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
          <span className="text-white">{t('hero.title').split(' ').slice(0, 3).join(' ')}</span>{' '}
          <span className="neon-text">{t('hero.title').split(' ').slice(3).join(' ')}</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: '200ms' }}>
          {t('hero.subtitle')}
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-up" style={{ animationDelay: '300ms' }}>
          <button onClick={onRegister} className="btn-primary flex items-center gap-2 text-base px-7 py-3.5">
            {t('hero.cta')}
            <ArrowRight className="w-5 h-5" />
          </button>
          <a href={MATERIALS_URL} target="_blank" rel="noopener noreferrer" className="btn-ghost flex items-center gap-2 text-base px-7 py-3.5">
            <Package className="w-5 h-5" />
            {t('nav.materials')}
          </a>
          <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="btn-ghost flex items-center gap-2 text-base px-7 py-3.5">
            <MessageCircle className="w-5 h-5" />
            {t('nav.support')}
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '400ms' }}>
          <div className="glass-card p-4 sm:p-6">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-neon-cyan" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white">12+</div>
            <div className="text-xs sm:text-sm text-gray-500">{t('hero.stats.offers')}</div>
          </div>
          <div className="glass-card p-4 sm:p-6">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-5 h-5 text-neon-emerald" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white">2.4K</div>
            <div className="text-xs sm:text-sm text-gray-500">{t('hero.stats.partners')}</div>
          </div>
          <div className="glass-card p-4 sm:p-6">
            <div className="flex items-center justify-center mb-2">
              <Wallet className="w-5 h-5 text-neon-blue" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white">$8M+</div>
            <div className="text-xs sm:text-sm text-gray-500">{t('hero.stats.payouts')}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
