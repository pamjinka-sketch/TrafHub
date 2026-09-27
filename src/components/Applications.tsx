import { useEffect, useState } from 'react';
import { Link2, MessageSquare, Copy, Check, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { supabase, type Application } from '@/lib/supabase';
import { useApp } from '@/context/AppContext';

export default function Applications() {
  const { t, profile } = useApp();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const fetchApps = async () => {
      if (!profile) return;
      const { data } = await supabase.from('applications').select('*, offer:offers(*)').eq('user_id', profile.id).order('created_at', { ascending: false });
      setApplications((data ?? []) as Application[]);
      setLoading(false);
    };
    fetchApps();
  }, [profile]);

  const copyLink = (id: string, link: string) => {
    navigator.clipboard.writeText(link);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 glass-card animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">{t('apps.title')}</h1>

      {applications.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-gray-500">{t('apps.empty')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app, i) => (
            <div key={app.id} className="glass-card p-5 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{app.offer?.title ?? '—'}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{app.offer?.category} · {app.offer?.geo}</span>
                    <span className="text-xs text-gray-600">·</span>
                    <span className="text-xs text-gray-500">{new Date(app.created_at).toLocaleDateString()}</span>
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

              {app.status === 'approved' && (
                <div className="space-y-3 mt-4 pt-4 border-t border-white/5">
                  {app.tracking_link && (
                    <div>
                      <label className="text-xs text-gray-500 mb-1.5 flex items-center gap-1.5">
                        <Link2 className="w-3.5 h-3.5" /> {t('apps.trackingLink')}
                      </label>
                      <div className="flex gap-2">
                        <div className="flex-1 px-3 py-2.5 rounded-xl bg-ink-800 border border-white/10 text-sm text-neon-cyan font-mono truncate">
                          {app.tracking_link}
                        </div>
                        <button onClick={() => copyLink(app.id, app.tracking_link)} className="px-3 rounded-xl bg-ink-700 hover:bg-ink-600 transition-colors text-gray-300">
                          {copied === app.id ? <Check className="w-4 h-4 text-neon-emerald" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}
                  {app.admin_message && (
                    <div>
                      <label className="text-xs text-gray-500 mb-1.5 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" /> {t('apps.adminMessage')}
                      </label>
                      <div className="px-3 py-2.5 rounded-xl bg-ink-800 border border-white/10 text-sm text-gray-300 whitespace-pre-wrap">
                        {app.admin_message}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
