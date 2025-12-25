// src/lib/supabase/browser.ts
import { createBrowserClient } from "@supabase/ssr";

/**
 * Canonical browser Supabase client for Client Components.
 * Never returns undefined.
 * Throws a clear error if env vars are missing.
 */
export function createSupabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add them to .env.local and restart dev server."
    );
  }

  return createBrowserClient(url, anon);
}
