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
      if (session) return session;

      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;

      return data.session;
    })().finally(() => {
      sessionPromise = null;
    });
  }

  return sessionPromise;
}

export function isSupabaseConfigured() {
  return hasSupabaseEnv();
}
