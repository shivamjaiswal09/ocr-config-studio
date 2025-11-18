/**
 * Supabase Client - Server-side only
 * DO NOT use this client in client components - service role key must stay server-side
 * 
 * For PoC: Supabase is optional - returns null if env vars are missing
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;
let _supabaseAvailable = false;

function getSupabaseClient(): SupabaseClient | null {
  // Check if Supabase is available
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  if (_supabase) {
    return _supabase;
  }

  try {
    // Validate URL format
    const supabaseUrl = process.env.SUPABASE_URL?.trim();
    if (!supabaseUrl || !supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
      console.warn("Invalid Supabase URL format. Expected: https://[project-ref].supabase.co");
      return null;
    }

    _supabase = createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    _supabaseAvailable = true;
    return _supabase;
  } catch (error) {
    console.warn("Failed to initialize Supabase client:", error);
    return null;
  }
}

/**
 * Check if Supabase is available
 */
export function isSupabaseAvailable(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Supabase client with service role privileges
 * Use only in API routes and server components
 * Lazy-initialized on first use
 * Returns null if Supabase is not configured (for PoC compatibility)
 */
// Mock query builder for when Supabase is not configured
const createMockQueryBuilder = () => {
  const mockResult = Promise.resolve({ data: [], error: { message: 'Supabase not configured' } });
  
  const mockBuilder = {
    eq: () => mockBuilder,
    is: () => mockBuilder,
    order: () => mockBuilder,
    insert: () => ({ select: () => ({ single: () => mockResult }) }),
    update: () => ({ eq: () => mockResult }),
    single: () => mockResult,
    then: (onResolve: any, onReject?: any) => mockResult.then(onResolve, onReject),
    catch: (onReject: any) => mockResult.catch(onReject),
  };
  
  return mockBuilder;
};

export const supabase = new Proxy({} as SupabaseClient, {
  get: (target, prop) => {
    const client = getSupabaseClient();
    if (!client) {
      // Return a mock object that supports full query chain
      if (prop === 'from') {
        return () => ({
          select: () => createMockQueryBuilder(),
          insert: (data: any) => ({
            select: () => ({
              single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
            }),
          }),
        });
      }
      throw new Error("Supabase is not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.");
    }
    return (client as any)[prop];
  },
});

