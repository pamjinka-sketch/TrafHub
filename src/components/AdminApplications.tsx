import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, Save, Check, Link2, MessageSquare, MousePointerClick, FileText, DollarSign } from 'lucide-react';
import { supabase, type Application, type Offer, type Profile } from '@/lib/supabase';
import { useApp } from '@/context/AppContext';

type AppWithRelations = Application & { offer: Offer | null };

export default function AdminApplications() {
  const { t, profile } = useApp();
  const [applications, setApplications] = useState<AppWithRelations[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLink, setEditLink] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [editStatus, setEditStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [editClicks, setEditClicks] = useState('0');
  const [editLeads, setEditLeads] = useState('0');
  const [editConversions, setEditConversions] = useState('0');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [appsRes, usersRes] = await Promise.all([
      supabase.from('applications').select('*, offer:offers(*)').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*'),
    ]);
    setApplications((appsRes.data ?? []) as AppWithRelations[]);
    setUsers((usersRes.data ?? []) as Profile[]);
    setLoading(false);
  };

  const startEdit = (app: AppWithRelations) => {
    setEditingId(app.id);
    setEditLink(app.tracking_link || '');
    setEditMessage(app.admin_message || '');
    setEditStatus(app.status === 'pending' ? 'approved' : app.status);
    setEditClicks(String(app.stat_clicks ?? 0));
    setEditLeads(String(app.stat_leads ?? 0));
    setEditConversions(String(app.stat_conversions ?? 0));
  };

  const saveApp = async (appId: string) => {
    const app = applications.find((a) => a.id === appId);
    if (!app) return;

    const wasApproved = app.status === 'approved';
    const isNowApproved = editStatus === 'approved';

    await supabase.from('applications').update({
      tracking_link: editLink,
      admin_message: editMessage,
      status: editStatus,
      stat_clicks: parseInt(editClicks) || 0,
      stat_leads: parseInt(editLeads) || 0,
      stat_conversions: parseInt(editConversions) || 0,
      updated_at: new Date().toISOString(),
    }).eq('id', appId);

    // Credit balance when transitioning to approved
    if (isNowApproved && !wasApproved && app.offer) {
      const payoutCents = Math.round(Number(app.offer.payout_amount) * 100);
      const user = users.find((u) => u.id === app.user_id);
      if (user) {
        const newBalance = user.balance_cents + payoutCents;
        await supabase.from('profiles').update({ balance_cents: newBalance }).eq('id', app.user_id);
      }
    }

    setEditingId(null);
    setFeedback(t('admin.appUpdated'));
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
      <h2 className="text-xl font-bold text-white mb-6">{t('admin.applications')}</h2>

      {feedback && (
        <div className="mb-4 flex items-center gap-2 text-sm text-neon-emerald bg-neon-emerald/10 border border-neon-emerald/20 rounded-lg px-4 py-2.5 animate-fade-in">
          <Check className="w-4 h-4" /> {feedback}
        </div>
      )}

      {applications.length === 0 ? (
        <div className="glass-card p-8 text-center text-gray-500">No applications yet.</div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const partner = users.find((u) => u.id === app.user_id);
            const isEditing = editingId === app.id;
            return (
              <div key={app.id} className="glass-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="font-semibold text-gray-200">{app.offer?.title ?? '—'}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {t('admin.appPartner')}: {partner?.nickname || partner?.email || '—'}
                      {partner?.telegram && ` · ${partner.telegram}`}
                      {' · '}{new Date(app.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`badge ${
                    app.status === 'approved' ? 'bg-neon-emerald/10 text-neon-emerald' :
                    app.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                    'bg-amber-500/10 text-amber-400'
                  }`}>
                    {app.status === 'approved' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                     app.status === 'rejected' ? <XCircle className="w-3.5 h-3.5" /> :
                     <Clock className="w-3.5 h-3.5" />}
                    {t(`apps.status.${app.status}`)}
                  </span>
                </div>

                {isEditing ? (
                  <div className="space-y-3 pt-3 border-t border-white/5">
                    <div className="flex gap-2">
                      <button onClick={() => setEditStatus('approved')} className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${editStatus === 'approved' ? 'bg-neon-emerald/20 text-neon-emerald border border-neon-emerald/30' : 'bg-ink-700 text-gray-400 border border-transparent'}`}>
                        {t('admin.appApprove')}
                      </button>
                      <button onClick={() => setEditStatus('rejected')} className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${editStatus === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-ink-700 text-gray-400 border border-transparent'}`}>
                        {t('admin.appReject')}
                      </button>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1.5 flex items-center gap-1.5">
                        <Link2 className="w-3.5 h-3.5" /> {t('admin.appTrackingLink')}
                      </label>
                      <input type="text" value={editLink} onChange={(e) => setEditLink(e.target.value)} className="input-field text-sm font-mono" placeholder="https://track.trafhub.com/click/..." />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1.5 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" /> {t('admin.appMessage')}
                      </label>
                      <textarea value={editMessage} onChange={(e) => setEditMessage(e.target.value)} className="input-field text-sm min-h-[70px] resize-y" placeholder="@manager_telegram" />
                    </div>
                    <div className="pt-1">
                      <label className="text-xs text-gray-400 mb-2 flex items-center gap-1.5 font-semibold">
                        <MousePointerClick className="w-3.5 h-3.5 text-neon-cyan" /> {t('admin.appStats')}
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-xs text-gray-500 mb-1 flex items-center gap-1"><MousePointerClick className="w-3 h-3" /> {t('admin.statClicks')}</label>
                          <input type="number" min="0" value={editClicks} onChange={(e) => setEditClicks(e.target.value)} className="input-field py-2 text-sm" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 flex items-center gap-1"><FileText className="w-3 h-3" /> {t('admin.statLeads')}</label>
                          <input type="number" min="0" value={editLeads} onChange={(e) => setEditLeads(e.target.value)} className="input-field py-2 text-sm" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3" /> {t('admin.statConversions')}</label>
                          <input type="number" min="0" value={editConversions} onChange={(e) => setEditConversions(e.target.value)} className="input-field py-2 text-sm" />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => saveApp(app.id)} className="btn-primary text-sm flex items-center gap-1.5">
                        <Save className="w-3.5 h-3.5" /> {t('admin.appSave')}
                      </button>
                      <button onClick={() => setEditingId(null)} className="btn-ghost text-sm">{t('admin.cancel')}</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button onClick={() => startEdit(app)} className="btn-ghost text-sm px-3 py-1.5">
                      {t('admin.appApprove')} / {t('admin.appReject')}
                    </button>
                    {(app.stat_clicks > 0 || app.stat_leads > 0 || app.stat_conversions > 0) && (
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5 text-xs">
                        <span className="text-gray-500 flex items-center gap-1"><MousePointerClick className="w-3.5 h-3.5" /> {t('admin.statClicks')}: <span className="text-gray-200 font-semibold ml-1">{app.stat_clicks}</span></span>
                        <span className="text-gray-500 flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {t('admin.statLeads')}: <span className="text-gray-200 font-semibold ml-1">{app.stat_leads}</span></span>
                        <span className="text-gray-500 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> {t('admin.statConversions')}: <span className="text-neon-emerald font-semibold ml-1">{app.stat_conversions}</span></span>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
