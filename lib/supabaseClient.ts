/**
 * Supabase Client - Server-side only
 * DO NOT use this client in client components - service role key must stay server-side
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;

function getSupabaseClient() {
  if (_supabase) {
    return _supabase;
  }

  if (!process.env.SUPABASE_URL) {
    throw new Error("Missing SUPABASE_URL environment variable");
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
  }

  _supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  return _supabase;
}

/**
 * Supabase client with service role privileges
 * Use only in API routes and server components
 * Lazy-initialized on first use
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get: (target, prop) => {
    const client = getSupabaseClient();
    return (client as any)[prop];
  },
});

