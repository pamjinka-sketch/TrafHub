import { useState, useEffect } from 'react';
import { Bitcoin, CreditCard, Clock, CheckCircle2, XCircle, Save, Check } from 'lucide-react';
import { supabase, type Withdrawal, type Profile } from '@/lib/supabase';
import { useApp } from '@/context/AppContext';

export default function AdminWithdrawals() {
  const { t } = useApp();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [editNote, setEditNote] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [wdRes, usersRes] = await Promise.all([
      supabase.from('withdrawals').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*'),
    ]);
    setWithdrawals((wdRes.data ?? []) as Withdrawal[]);
    setUsers((usersRes.data ?? []) as Profile[]);
    setLoading(false);
  };

  const startEdit = (wd: Withdrawal) => {
    setEditingId(wd.id);
    setEditStatus(wd.status === 'pending' ? 'approved' : wd.status);
    setEditNote(wd.admin_note || '');
  };

  const saveWd = async (wdId: string) => {
    const wd = withdrawals.find((w) => w.id === wdId);
    if (!wd) return;

    const wasProcessed = wd.status !== 'pending';
    const willApprove = editStatus === 'approved';
    const willReject = editStatus === 'rejected';

    await supabase.from('withdrawals').update({
      status: editStatus,
      admin_note: editNote,
      processed_at: editStatus !== 'pending' ? new Date().toISOString() : null,
    }).eq('id', wdId);

    // Deduct balance on approval (only if wasn't already approved)
    if (willApprove && !wasProcessed) {
      const user = users.find((u) => u.id === wd.user_id);
      if (user) {
        const newBalance = Math.max(0, user.balance_cents - wd.amount_cents);
        await supabase.from('profiles').update({ balance_cents: newBalance }).eq('id', wd.user_id);
      }
    }

    setEditingId(null);
    setFeedback(willApprove ? t('admin.wdApproved') : willReject ? t('admin.wdRejected') : t('admin.wdSave'));
    fetchAll();
    setTimeout(() => setFeedback(null), 3000);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => <div key={i} className="h-24 glass-card animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold text-white mb-6">{t('admin.withdrawals')}</h2>

      {feedback && (
        <div className="mb-4 flex items-center gap-2 text-sm text-neon-emerald bg-neon-emerald/10 border border-neon-emerald/20 rounded-lg px-4 py-2.5 animate-fade-in">
          <Check className="w-4 h-4" /> {feedback}
        </div>
      )}

      {withdrawals.length === 0 ? (
        <div className="glass-card p-8 text-center text-gray-500">No withdrawal requests yet.</div>
      ) : (
        <div className="space-y-3">
          {withdrawals.map((wd) => {
            const partner = users.find((u) => u.id === wd.user_id);
            const isEditing = editingId === wd.id;
            return (
              <div key={wd.id} className="glass-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${wd.method === 'Crypto' ? 'bg-neon-emerald/10 text-neon-emerald' : 'bg-neon-blue/10 text-neon-blue'}`}>
                      {wd.method === 'Crypto' ? <Bitcoin className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="font-bold text-neon-emerald text-lg">${(wd.amount_cents / 100).toFixed(2)}</div>
                      <div className="text-xs text-gray-500">
                        {partner?.nickname || partner?.email || '—'}
                        {partner?.telegram && ` · ${partner.telegram}`}
                        {' · '}{new Date(wd.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <span className={`badge ${wd.status === 'approved' ? 'bg-neon-emerald/10 text-neon-emerald' : wd.status === 'rejected' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {wd.status === 'approved' ? <CheckCircle2 className="w-3.5 h-3.5" /> : wd.status === 'rejected' ? <XCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    {t(`withdraw.status.${wd.status}`)}
                  </span>
                </div>

                {/* Partner requisites */}
                <div className="text-xs text-gray-400 bg-ink-800/50 rounded-lg px-3 py-2 border border-white/5 mb-3 whitespace-pre-wrap break-words">
                  <span className="text-gray-500">{t('admin.wdRequisites')}:</span> {partner?.payout_requisites || '—'}
                </div>

                {isEditing ? (
                  <div className="space-y-3 pt-3 border-t border-white/5">
                    <div className="flex gap-2">
                      <button onClick={() => setEditStatus('approved')} className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${editStatus === 'approved' ? 'bg-neon-emerald/20 text-neon-emerald border border-neon-emerald/30' : 'bg-ink-700 text-gray-400 border border-transparent'}`}>
                        {t('admin.wdApprove')}
                      </button>
                      <button onClick={() => setEditStatus('rejected')} className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${editStatus === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-ink-700 text-gray-400 border border-transparent'}`}>
                        {t('admin.wdReject')}
                      </button>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1.5 block">{t('admin.wdNote')}</label>
                      <textarea value={editNote} onChange={(e) => setEditNote(e.target.value)} className="input-field text-sm min-h-[60px] resize-y" placeholder="..." />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => saveWd(wd.id)} className="btn-primary text-sm flex items-center gap-1.5">
                        <Save className="w-3.5 h-3.5" /> {t('admin.wdSave')}
                      </button>
                      <button onClick={() => setEditingId(null)} className="btn-ghost text-sm">{t('admin.cancel')}</button>
                    </div>
                  </div>
                ) : (
                  wd.status === 'pending' && (
                    <button onClick={() => startEdit(wd)} className="btn-ghost text-sm px-3 py-1.5">
                      {t('admin.wdApprove')} / {t('admin.wdReject')}
                    </button>
                  )
                )}

                {wd.admin_note && wd.status !== 'pending' && !isEditing && (
                  <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-white/5">
                    {t('admin.wdNote')}: {wd.admin_note}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
