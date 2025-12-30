import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const DEMO_MODE = process.env.ZERO17_DEMO_MODE === "1";
const DEMO_USER_ID =
  process.env.ZERO17_DEMO_USER_ID ?? "00000000-0000-0000-0000-000000000017";

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export function getSupabaseAdminServer() {
  const url = mustEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = mustEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * ✅ Canonical context:
 * - DEMO_MODE => always service role + DEMO_USER_ID (no auth needed)
 * - Otherwise => require real auth (for later)
 *
 * IMPORTANT: No "dev" userId (your DB column is UUID).
 */
export async function getCtx() {
  if (DEMO_MODE) {
    return {
      supabase: getSupabaseAdminServer(),
      userId: DEMO_USER_ID,
      isDemo: true,
    };
  }

  // If you later re-enable auth, implement cookie-based SSR auth here.
  // For now (since you want to build without auth), keep DEMO_MODE=1.
  return {
    supabase: getSupabaseAdminServer(),
    userId: null as string | null,
    isDemo: false,
  };
}

export async function requireCtx() {
  const ctx = await getCtx();
  if (!ctx.userId) {
    return {
      ...ctx,
      error: { error: "Unauthorized. Enable DEMO_MODE or sign in." },
      res: NextResponse.json(
        { error: "Unauthorized. Enable DEMO_MODE or sign in." },
        { status: 401 }
      ),
    };
  }
  return { ...ctx, error: null as any, res: null as any };
}
