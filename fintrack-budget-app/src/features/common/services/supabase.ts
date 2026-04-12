import { createClient, SupabaseClient, Session, AuthChangeEvent } from "@supabase/supabase-js";
import type { Database } from '../types';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY as string;

let client: SupabaseClient<Database> | undefined;
let sessionPromise: Promise<Session | null> | null;

export function hasSupabaseEnv(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function getSupabase(): SupabaseClient<Database> | null {
  if (!hasSupabaseEnv()) return null;

  if (!client) {
    client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    });
  }

  return client;
}

export async function ensureSupabaseSession(): Promise<Session | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  if (!sessionPromise) {
    sessionPromise = (async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;
      return session;
    })().finally(() => {
      sessionPromise = null;
    });
  }

  return sessionPromise;
}

export async function getCurrentSession(): Promise<Session | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) throw error;

  return session;
}

export function onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
  const supabase = getSupabase();
  if (!supabase) {
    return { data: { subscription: { unsubscribe() {} } } };
  }

  return supabase.auth.onAuthStateChange(callback);
}

export async function signInWithEmail({ email, password }: any) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signUpWithEmail({ email, password }: any) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOutUser(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) throw error;
}

export function isSupabaseConfigured() {
  return hasSupabaseEnv();
}
