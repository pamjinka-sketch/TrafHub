import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, CheckCheck, Check, CheckCircle2, XCircle, ArrowDownToLine, ArrowUpFromLine, Clock } from 'lucide-react';
import { supabase, type Notification } from '@/lib/supabase';
import { useApp } from '@/context/AppContext';

const ICONS: Record<string, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  application_approved: { icon: CheckCircle2, color: 'text-neon-emerald', bg: 'bg-neon-emerald/10' },
  application_rejected: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
  withdrawal_approved: { icon: ArrowUpFromLine, color: 'text-neon-emerald', bg: 'bg-neon-emerald/10' },
  withdrawal_rejected: { icon: ArrowDownToLine, color: 'text-red-400', bg: 'bg-red-500/10' },
};

function timeAgo(dateStr: string, t: (k: string, n?: number) => string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return t('notif.justNow');
  if (min < 60) return t('notif.minAgo').replace('{n}', String(min));
  const hours = Math.floor(min / 60);
  if (hours < 24) return t('notif.hourAgo').replace('{n}', String(hours));
  const days = Math.floor(hours / 24);
  return t('notif.dayAgo').replace('{n}', String(days));
}

export default function NotificationBell() {
  const { t, profile } = useApp();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!profile) return;
    const [listRes, countRes] = await Promise.all([
      supabase.from('notifications').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(20),
      supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', profile.id).eq('is_read', false),
    ]);
    setNotifications((listRes.data ?? []) as Notification[]);
    setUnreadCount(countRes.count ?? 0);
  }, [profile]);

  useEffect(() => {
    if (!profile) return;
    fetchNotifications();
    pollRef.current = setInterval(fetchNotifications, 30000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [profile, fetchNotifications]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    if (!profile || unreadCount === 0) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', profile.id).eq('is_read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(!open); if (!open && unreadCount > 0) fetchNotifications(); }}
        className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/5 transition-colors"
      >
        <Bell className={`w-5 h-5 transition-colors ${unreadCount > 0 ? 'text-neon-cyan' : 'text-gray-400'}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-neon-cyan rounded-full px-1 animate-scale-in">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 glass rounded-xl shadow-2xl z-50 animate-scale-in overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-neon-cyan" />
              {t('notif.title')}
            </h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-neon-cyan hover:text-neon-cyan/80 flex items-center gap-1 transition-colors">
                <CheckCheck className="w-3.5 h-3.5" />
                {t('notif.markAllRead')}
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">{t('notif.empty')}</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((n) => {
                  const cfg = ICONS[n.type] ?? { icon: Bell, color: 'text-gray-400', bg: 'bg-white/5' };
                  return (
                    <div
                      key={n.id}
                      className={`flex gap-3 px-4 py-3 transition-colors ${n.is_read ? 'bg-transparent' : 'bg-neon-cyan/5'}`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg}`}>
                        <cfg.icon className={`w-4.5 h-4.5 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-semibold ${n.is_read ? 'text-gray-400' : 'text-gray-100'}`}>{n.title}</p>
                          {!n.is_read && <span className="w-2 h-2 rounded-full bg-neon-cyan shrink-0 mt-1.5 animate-pulse" />}
                        </div>
                        <p className={`text-xs mt-0.5 ${n.is_read ? 'text-gray-600' : 'text-gray-400'}`}>{n.message}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[11px] text-gray-600">{timeAgo(n.created_at, t)}</span>
                          {!n.is_read && (
                            <button
                              onClick={() => markRead(n.id)}
                              className="text-[11px] text-neon-cyan hover:text-neon-cyan/80 flex items-center gap-1 transition-colors"
                            >
                              <Check className="w-3 h-3" />
                              {t('notif.markRead')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
