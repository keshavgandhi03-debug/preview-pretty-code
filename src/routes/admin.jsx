import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { AppShell } from '@/components/app-shell';
import { useSession } from '@/lib/auth';
import { adminUsers, adminSetRole, adminCreateUser, adminDeleteUser } from '@/lib/admin.functions';

export const Route = createFileRoute('/admin')({
  head: () => ({ meta: [
    { title: 'Admin Panel — Walrus Counsellor Panel' },
    { name: 'description', content: 'Manage staff accounts and their roles in Walrus.' },
    { property: 'og:title', content: 'Admin Panel — Walrus Counsellor Panel' },
    { property: 'og:description', content: 'Manage staff accounts and roles.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: AdminPage,
});

const ROLES = [['admin', 'Admin'], ['sales_head', 'Sales Head'], ['counsellor', 'Counsellor']];
const fmt = (v) => (v ? new Date(v).toLocaleDateString() : '—');

function AdminPage() {
  const { ready, user } = useSession();
  const navigate = useNavigate();
  const load = useServerFn(adminUsers);
  const setRole = useServerFn(adminSetRole);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [q, setQ] = useState('');
  const create = useServerFn(adminCreateUser);
  const del = useServerFn(adminDeleteUser);
  const remove = async (u) => {
    if (!window.confirm(`Remove ${u.email}? They will no longer be able to sign in.`)) return;
    setBusy(u.id); setError(''); setNotice('');
    try { await del({ data: { userId: u.id } }); setNotice(`${u.email} removed.`); await refresh(); } catch (e) { setError(e.message); } finally { setBusy(''); }
  };
  const [form, setForm] = useState({ email: '', password: '', role: 'counsellor' });
  const [notice, setNotice] = useState('');
  const addUser = async (e) => {
    e.preventDefault(); setError(''); setNotice('');
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError('Enter a valid email.');
    if (form.password.length < 8) return setError('Password must be at least 8 characters.');
    setBusy('new');
    try { await create({ data: form }); setNotice(`${form.email.trim().toLowerCase()} added — they must sign in with exactly this email. Share the password with them securely.`); setForm({ email: '', password: '', role: 'counsellor' }); await refresh(); }
    catch (err) { setError(err.message); } finally { setBusy(''); }
  };

  const refresh = async () => { try { setData(await load()); setError(''); } catch (e) { setError(e.message); } };
  useEffect(() => { if (ready && !user) navigate({ to: '/login', replace: true }); }, [ready, user, navigate]);
  useEffect(() => { if (ready && user) refresh(); }, [ready, user?.id]);

  const change = async (id, role) => {
    setBusy(id);
    try { await setRole({ data: { userId: id, role } }); await refresh(); } catch (e) { setError(e.message); } finally { setBusy(''); }
  };
  const users = (data?.users || []).filter((u) => u.email.toLowerCase().includes(q.toLowerCase()));

  return <AppShell title="Admin Panel" breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Admin Panel' }]}>
    <div className="space-y-5 p-4 sm:p-6">
      <div><p className="text-[10px] font-semibold uppercase text-muted-foreground">Administration</p><h2 className="mt-1 text-xl font-semibold">User & Role Management</h2><p className="text-sm text-muted-foreground">Admins have full access. Sales Heads manage pipelines. Counsellors work on assigned leads.</p></div>
      {error && <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</div>}
      {!data && !error && <p className="text-sm text-muted-foreground">Loading accounts…</p>}
      {notice && <div role="status" className="rounded-md border border-border bg-muted p-3 text-sm">{notice}</div>}
      {data && <>
        <form onSubmit={addUser} className="flex flex-wrap items-end gap-3 rounded-md border border-border bg-card p-4">
          <div className="w-full text-sm font-semibold">Add new user</div>
          <label className="flex min-w-[220px] flex-1 flex-col gap-1 text-xs text-muted-foreground">Email<input type="email" required maxLength={255} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" /></label>
          <label className="flex min-w-[180px] flex-1 flex-col gap-1 text-xs text-muted-foreground">Temporary password<input type="text" required minLength={8} maxLength={72} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" /></label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">Role<select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="rounded-md border border-input bg-background px-2 py-2 text-sm text-foreground">{ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
          <button type="submit" disabled={busy === 'new'} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">{busy === 'new' ? 'Adding…' : 'Add user'}</button>
        </form>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by email" className="w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        <div className="overflow-x-auto rounded-md border border-border bg-card"><table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-muted/50 text-xs text-muted-foreground"><tr>{['Email', 'Status', 'Joined', 'Last sign-in', 'Role', ''].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead>
          <tbody>{users.map((u) => <tr key={u.id} className="border-t border-border hover:bg-muted/30">
            <td className="px-4 py-3 font-medium">{u.email}{u.id === data.me && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}</td>
            <td className="px-4 py-3"><span className="rounded-md bg-muted px-2 py-1 text-xs">{u.confirmed ? 'Verified' : 'Pending'}</span></td>
            <td className="px-4 py-3 text-muted-foreground">{fmt(u.created_at)}</td>
            <td className="px-4 py-3 text-muted-foreground">{fmt(u.last_sign_in_at)}</td>
            <td className="px-4 py-3"><select aria-label={`Role for ${u.email}`} value={u.role} disabled={busy === u.id || u.id === data.me} onChange={(e) => change(u.id, e.target.value)} className="rounded-md border border-input bg-background px-2 py-1 text-sm">{ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></td>
            <td className="px-4 py-3 text-right">{u.id !== data.me && <button type="button" onClick={() => remove(u)} disabled={busy === u.id} className="rounded-md border border-destructive/40 px-3 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50">Remove</button>}</td>
          </tr>)}
          {!users.length && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No accounts found.</td></tr>}</tbody>
        </table></div>
      </>}
    </div>
  </AppShell>;
}
