import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const DEFAULT_EMAIL = '';
export const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password.';

const listeners = new Set();
let current = { ready: false, user: null };
let started = false;

function toUser(account) {
  if (!account) return null;
  const email = account.email || '';
  const name = account.user_metadata?.name || email.split('@')[0] || 'Staff member';
  return { id: account.id, email, name, initials: name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase(), role: 'Counsellor' };
}

function publish(account) {
  current = { ready: true, user: toUser(account) };
  listeners.forEach((listener) => listener(current));
}

function start() {
  if (started || typeof window === 'undefined') return;
  started = true;
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') publish(null);
    if (event === 'SIGNED_IN' || event === 'USER_UPDATED') publish(session?.user || null);
  });
  supabase.auth.getUser().then(({ data, error }) => publish(error ? null : data.user)).catch(() => publish(null));
}

export async function authenticate({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
  publish(data.user);
  return { user: toUser(data.user) };
}

export async function register({ email, password, name }) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(), password,
    options: { data: { name: name.trim() }, emailRedirectTo: window.location.origin },
  });
  if (error) throw error;
  if (data.session) publish(data.user);
  return { needsConfirmation: !data.session };
}

// Existing callers retain this interface, but the identity is now verified by Cloud.
export function setSession() {}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  publish(null);
}

export function useSession() {
  const [state, setState] = useState(current);
  useEffect(() => {
    listeners.add(setState);
    start();
    setState(current);
    return () => listeners.delete(setState);
  }, []);
  return state;
}