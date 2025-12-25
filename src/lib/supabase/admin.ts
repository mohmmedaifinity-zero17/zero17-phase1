// src/lib/supabase/admin.ts
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Service-role client used only from API routes.
 * NEVER expose SUPABASE_SERVICE_ROLE_KEY to the browser.
 */
export const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

/**
 * Returns the dev user id we use for Builder Lab while auth is not wired.
 *
 * Create one dummy user in Supabase Auth, copy its `id` (UUID),
 * and set it in .env.local:
 *
 *   ZERO17_DEV_USER_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
 */
export function getDevUserId() {
  const id = process.env.ZERO17_DEV_USER_ID;
  return id || null;
}
