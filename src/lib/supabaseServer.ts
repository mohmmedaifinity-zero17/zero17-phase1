// src/lib/supabaseServer.ts
import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client for Zero17.
 *
 * DEV BEHAVIOUR:
 * - Uses SUPABASE_SERVICE_ROLE_KEY if present
 * - Falls back to NEXT_PUBLIC_SUPABASE_ANON_KEY if service role is missing
 *
 * This avoids 'supabaseKey is required' errors while developing.
 * For production, you should set SUPABASE_SERVICE_ROLE_KEY properly.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Decide which key to use (service role preferred, anon fallback)
const supabaseKey = serviceRoleKey || anonKey;

if (!supabaseUrl) {
  throw new Error(
    "Supabase URL is missing. Did you set NEXT_PUBLIC_SUPABASE_URL in .env.local?"
  );
}

if (!supabaseKey) {
  throw new Error(
    "Supabase key is missing. Did you set NEXT_PUBLIC_SUPABASE_ANON_KEY (and optionally SUPABASE_SERVICE_ROLE_KEY) in .env.local?"
  );
}

// IMPORTANT: this is server-only; do not import into client components.
export const supabaseServer = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
});
