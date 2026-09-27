import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import { supabase, type Offer } from '@/lib/supabase';
import { useApp } from '@/context/AppContext';

const CATEGORIES = ['Insurance', 'Gambling', 'Crypto', 'Nutra', 'Sweepstakes', 'Betting', 'Finance', 'Dating', 'E-commerce'];

export default function AdminOffers() {
  const { t } = useApp();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [creating, setCreating] = useState(false);

  const emptyOffer: Partial<Offer> = {
    title: '', category: 'Insurance', geo: '', payout_type: 'CPA', payout_amount: 0, description: '', requirements: '', is_active: true,
  };
  const [form, setForm] = useState<Partial<Offer>>(emptyOffer);

  useEffect(() => { fetchOffers(); }, []);

  const fetchOffers = async () => {
    const { data } = await supabase.from('offers').select('*').order('created_at', { ascending: false });
    setOffers((data ?? []) as Offer[]);
    setLoading(false);
  };

  const openCreate = () => {
    setForm(emptyOffer);
    setCreating(true);
    setEditing(null);
  };

  const openEdit = (offer: Offer) => {
    setForm(offer);
    setEditing(offer);
    setCreating(false);
  };

  const closeModal = () => {
    setEditing(null);
    setCreating(false);
    setForm(emptyOffer);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await supabase.from('offers').update({
        title: form.title, category: form.category, geo: form.geo, payout_type: form.payout_type,
        payout_amount: Number(form.payout_amount), description: form.description, requirements: form.requirements,
        is_active: form.is_active,
      }).eq('id', editing.id);
    } else {
      await supabase.from('offers').insert({
        title: form.title, category: form.category, geo: form.geo, payout_type: form.payout_type,
        payout_amount: Number(form.payout_amount), description: form.description, requirements: form.requirements,
        is_active: form.is_active ?? true,
      });
    }
    closeModal();
    fetchOffers();
  };

  const handleDelete = async (offer: Offer) => {
    if (!confirm(t('admin.confirmDelete'))) return;
    await supabase.from('offers').delete().eq('id', offer.id);
    fetchOffers();
  };

  const modalOpen = creating || editing;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">{t('admin.offers')}</h2>
        <button onClick={openCreate} className="btn-primary text-sm flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> {t('admin.addOffer')}
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 glass-card animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {offers.map((offer) => (
            <div key={offer.id} className="glass-card p-4 flex items-center justify-between hover:border-white/10 transition-all">
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-2 h-2 rounded-full shrink-0 ${offer.is_active ? 'bg-neon-emerald' : 'bg-gray-600'}`} />
                <div className="min-w-0">
                  <div className="font-semibold text-gray-200 truncate">{offer.title}</div>
                  <div className="text-xs text-gray-500">{offer.category} · {offer.geo} · ${Number(offer.payout_amount).toFixed(0)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => openEdit(offer)} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-neon-cyan transition-all">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(offer)} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-lg glass-card p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">{editing ? t('admin.editOffer') : t('admin.addOffer')}</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-300"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">{t('admin.offerTitle')}</label>
                <input type="text" value={form.title ?? ''} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">{t('admin.offerCategory')}</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field cursor-pointer">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">{t('admin.offerGeo')}</label>
                  <input type="text" value={form.geo ?? ''} onChange={(e) => setForm({ ...form, geo: e.target.value })} className="input-field" placeholder="US, EU, Global" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">{t('admin.offerPayoutType')}</label>
                  <select value={form.payout_type} onChange={(e) => setForm({ ...form, payout_type: e.target.value })} className="input-field cursor-pointer">
                    <option value="CPA">CPA</option>
                    <option value="CPL">CPL</option>
                    <option value="RevShare">RevShare</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">{t('admin.offerPayout')}</label>
                  <input type="number" step="0.01" value={form.payout_amount ?? 0} onChange={(e) => setForm({ ...form, payout_amount: Number(e.target.value) })} className="input-field" required />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">{t('admin.offerDescription')}</label>
                <textarea value={form.description ?? ''} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field min-h-[80px] resize-y" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">{t('admin.offerRequirements')}</label>
                <textarea value={form.requirements ?? ''} onChange={(e) => setForm({ ...form, requirements: e.target.value })} className="input-field min-h-[60px] resize-y" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active ?? true} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded accent-neon-cyan" />
                <span className="text-sm text-gray-300">Active</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex items-center gap-2"><Save className="w-4 h-4" /> {t('admin.save')}</button>
                <button type="button" onClick={closeModal} className="btn-ghost">{t('admin.cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
