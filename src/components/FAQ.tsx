import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function FAQ() {
  const { t } = useApp();
  const [open, setOpen] = useState<number | null>(0);
  const questions = [1, 2, 3, 4, 5].map((i) => ({ q: t(`faq.q${i}`), a: t(`faq.a${i}`) }));

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">{t('faq.title')}</h2>
          <p className="text-gray-400">{t('faq.subtitle')}</p>
        </div>

        <div className="space-y-3">
          {questions.map((item, i) => (
            <div key={i} className="glass-card overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/5 transition-colors">
                <span className="font-semibold text-gray-200 pr-4">{item.q}</span>
                <ChevronDown className={`w-5 h-5 text-neon-cyan shrink-0 transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`} />
              </button>
              <div className={`grid transition-all duration-300 ${open === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                  <p className="px-5 pb-4 text-sm text-gray-400 leading-relaxed">{item.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
