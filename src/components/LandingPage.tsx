import Hero from '@/components/Hero';
import PayoutsWidget from '@/components/PayoutsWidget';
import TopOffers from '@/components/TopOffers';
import FAQ from '@/components/FAQ';

export default function LandingPage({ onRegister }: { onRegister: () => void }) {
  return (
    <div className="animate-fade-in">
      <Hero onRegister={onRegister} />
      <PayoutsWidget />
      <TopOffers />
      <FAQ />
    </div>
  );
}
