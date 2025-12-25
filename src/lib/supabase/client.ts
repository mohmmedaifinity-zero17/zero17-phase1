// src/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Alias for consistency with server-side createClient
export function createClient() {
  return createSupabaseBrowserClient();
}

// Singleton instance for convenience (used by useSupabaseUser)
export const supabaseBrowser = createSupabaseBrowserClient();
