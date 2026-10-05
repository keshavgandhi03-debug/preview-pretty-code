import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';

async function assertAdmin(context) {
  const { data, error } = await context.supabase.from('user_roles').select('role').eq('user_id', context.userId).maybeSingle();
  if (error) throw error;
  if (data?.role !== 'admin') throw new Error('Only admins can open the admin panel.');
}

export const adminUsers = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  await assertAdmin(context);
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const [{ data: list, error }, { data: roles, error: roleError }] = await Promise.all([
    supabaseAdmin.auth.admin.listUsers({ perPage: 1000 }),
    supabaseAdmin.from('user_roles').select('user_id, role'),
  ]);
  if (error) throw error;
  if (roleError) throw roleError;
  const map = new Map((roles || []).map((r) => [r.user_id, r.role]));
  return {
    me: context.userId,
    users: (list.users || []).filter((u) => !(u.banned_until && new Date(u.banned_until) > new Date())).map((u) => ({
      id: u.id, email: u.email || '', confirmed: !!u.email_confirmed_at,
      created_at: u.created_at, last_sign_in_at: u.last_sign_in_at || null,
      role: map.get(u.id) || 'counsellor',
    })).sort((a, b) => a.email.localeCompare(b.email)),
  };
});

export const adminSetRole = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ userId: z.string().uuid(), role: z.enum(['admin', 'sales_head', 'counsellor']) }).parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    if (data.userId === context.userId && data.role !== 'admin') throw new Error('You cannot remove your own admin access.');
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data: existing } = await supabaseAdmin.from('user_roles').select('id').eq('user_id', data.userId).maybeSingle();
    const res = existing
      ? await supabaseAdmin.from('user_roles').update({ role: data.role }).eq('user_id', data.userId)
      : await supabaseAdmin.from('user_roles').insert({ user_id: data.userId, role: data.role });
    if (res.error) throw res.error;
    return { ok: true };
  });

export const adminCreateUser = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({
    email: z.string().trim().toLowerCase().email().max(255),
    password: z.string().min(8).max(72),
    role: z.enum(['admin', 'sales_head', 'counsellor']),
  }).parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({ email: data.email, password: data.password, email_confirm: true });
    if (error) throw new Error(error.message.includes('already') ? 'An account with this email already exists.' : error.message);
    const res = await supabaseAdmin.from('user_roles').upsert({ user_id: created.user.id, role: data.role }, { onConflict: 'user_id' });
    if (res.error) throw res.error;
    return { ok: true };
  });

export const adminDeleteUser = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ userId: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    if (data.userId === context.userId) throw new Error('You cannot remove your own account.');
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const [{ count: leads }, { count: pipes }] = await Promise.all([
      supabaseAdmin.from('pipeline_leads').select('id', { count: 'exact', head: true }).eq('counsellor_id', data.userId),
      supabaseAdmin.from('pipelines').select('id', { count: 'exact', head: true }).eq('created_by', data.userId),
    ]);
    if ((leads || 0) + (pipes || 0) > 0) {
      // Keep their Pipeline history intact; block sign-in permanently instead.
      const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, { ban_duration: '876000h' });
      if (error) throw new Error(error.message);
      return { ok: true, deactivated: true };
    }
    await supabaseAdmin.from('user_roles').delete().eq('user_id', data.userId);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
