import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client;
let sessionPromise;

function hasSupabaseEnv() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function getSupabase() {
  if (!hasSupabaseEnv()) return null;

  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    });
  }

  return client;
}

export async function ensureSupabaseSession() {
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

export async function getCurrentSession() {
  const supabase = getSupabase();
  if (!supabase) return null;

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) throw error;

  return session;
}

export function onAuthStateChange(callback) {
  const supabase = getSupabase();
  if (!supabase) {
    return { data: { subscription: { unsubscribe() {} } } };
  }

  return supabase.auth.onAuthStateChange(callback);
}

export async function signInWithEmail({ email, password }) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  return data;
}

export async function signUpWithEmail({ email, password }) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  return data;
}

export async function signOutUser() {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) throw error;
}

export function isSupabaseConfigured() {
  return hasSupabaseEnv();
}
