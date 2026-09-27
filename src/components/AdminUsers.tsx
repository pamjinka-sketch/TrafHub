import { useState, useEffect } from 'react';
import { Shield, User, Save, Check } from 'lucide-react';
import { supabase, type Profile } from '@/lib/supabase';
import { useApp } from '@/context/AppContext';

export default function AdminUsers() {
  const { t } = useApp();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBalance, setEditBalance] = useState('');
  const [editRole, setEditRole] = useState<'admin' | 'member'>('member');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: true });
    setUsers((data ?? []) as Profile[]);
    setLoading(false);
  };

  const startEdit = (user: Profile) => {
    setEditingId(user.id);
    setEditBalance((user.balance_cents / 100).toFixed(2));
    setEditRole(user.role);
  };

  const saveUser = async (userId: string) => {
    const newBalanceCents = Math.round(parseFloat(editBalance) * 100);
    if (isNaN(newBalanceCents)) return;

    const user = users.find((u) => u.id === userId);
    if (!user) return;

    if (user.balance_cents !== newBalanceCents) {
      await supabase.from('profiles').update({ balance_cents: newBalanceCents }).eq('id', userId);
      setFeedback(t('admin.balanceUpdated'));
    }
    if (user.role !== editRole) {
      await supabase.from('profiles').update({ role: editRole }).eq('id', userId);
      setFeedback(t('admin.roleUpdated'));
    }
    setEditingId(null);
    fetchUsers();
    setTimeout(() => setFeedback(null), 3000);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-20 glass-card animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold text-white mb-6">{t('admin.users')}</h2>

      {feedback && (
        <div className="mb-4 flex items-center gap-2 text-sm text-neon-emerald bg-neon-emerald/10 border border-neon-emerald/20 rounded-lg px-4 py-2.5 animate-fade-in">
          <Check className="w-4 h-4" /> {feedback}
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden lg:block glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5 text-left text-xs text-gray-500 uppercase">
              <th className="px-4 py-3">{t('admin.userNick')} / Email</th>
              <th className="px-4 py-3">{t('admin.userTelegram')}</th>
              <th className="px-4 py-3">{t('admin.userRequisites')}</th>
              <th className="px-4 py-3">{t('admin.userBalance')}</th>
              <th className="px-4 py-3">{t('admin.userRole')}</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {user.role === 'admin' && <Shield className="w-4 h-4 text-neon-emerald shrink-0" />}
                    <div>
                      <div className="font-semibold text-gray-200 text-sm">{user.nickname || '—'}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">{user.telegram || '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-400 max-w-[160px] truncate">{user.payout_requisites || '—'}</td>
                <td className="px-4 py-3">
                  {editingId === user.id ? (
                    <input type="number" step="0.01" value={editBalance} onChange={(e) => setEditBalance(e.target.value)} className="input-field py-1.5 text-sm w-24" />
                  ) : (
                    <span className="text-neon-emerald font-semibold text-sm">${(user.balance_cents / 100).toFixed(2)}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === user.id ? (
                    <select value={editRole} onChange={(e) => setEditRole(e.target.value as 'admin' | 'member')} className="input-field py-1.5 text-sm w-28 cursor-pointer">
                      <option value="member">member</option>
                      <option value="admin">admin</option>
                    </select>
                  ) : (
                    <span className={`badge ${user.role === 'admin' ? 'bg-neon-emerald/10 text-neon-emerald' : 'bg-ink-700 text-gray-400'}`}>{user.role}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {editingId === user.id ? (
                    <button onClick={() => saveUser(user.id)} className="btn-primary text-sm px-3 py-1.5 inline-flex items-center gap-1.5">
                      <Save className="w-3.5 h-3.5" /> {t('admin.updateUser')}
                    </button>
                  ) : (
                    <button onClick={() => startEdit(user)} className="btn-ghost text-sm px-3 py-1.5 inline-flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> {t('admin.updateUser')}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-3">
        {users.map((user) => (
          <div key={user.id} className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              {user.role === 'admin' && <Shield className="w-4 h-4 text-neon-emerald" />}
              <div className="font-semibold text-gray-200">{user.nickname || '—'}</div>
              <span className={`badge ml-auto ${user.role === 'admin' ? 'bg-neon-emerald/10 text-neon-emerald' : 'bg-ink-700 text-gray-400'}`}>{user.role}</span>
            </div>
            <div className="text-xs text-gray-500 mb-1">{user.email}</div>
            <div className="text-xs text-gray-500 mb-1">Telegram: {user.telegram || '—'}</div>
            <div className="text-xs text-gray-500 mb-3">Balance: <span className="text-neon-emerald font-semibold">${(user.balance_cents / 100).toFixed(2)}</span></div>
            {editingId === user.id ? (
              <div className="space-y-2">
                <input type="number" step="0.01" value={editBalance} onChange={(e) => setEditBalance(e.target.value)} className="input-field py-1.5 text-sm" placeholder={t('admin.setBalance')} />
                <select value={editRole} onChange={(e) => setEditRole(e.target.value as 'admin' | 'member')} className="input-field py-1.5 text-sm cursor-pointer">
                  <option value="member">member</option>
                  <option value="admin">admin</option>
                </select>
                <button onClick={() => saveUser(user.id)} className="btn-primary text-sm w-full">{t('admin.updateUser')}</button>
              </div>
            ) : (
              <button onClick={() => startEdit(user)} className="btn-ghost text-sm w-full">{t('admin.updateUser')}</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
