import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

// ✅ DEBUG: Check if env vars are loading
console.log(
  "[DEMO MODE]",
  process.env.ZERO17_DEMO_MODE,
  !!process.env.SUPABASE_SERVICE_ROLE_KEY
);

const DEMO_MODE = process.env.ZERO17_DEMO_MODE === "1";
const DEMO_USER_ID =
  process.env.ZERO17_DEMO_USER_ID ?? "00000000-0000-0000-0000-000000000017";

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

/** User-scoped Supabase (anon key + cookies) */
export function getSupabaseUserServer() {
  const cookieStore = cookies();
  return createServerClient(
    mustEnv("NEXT_PUBLIC_SUPABASE_URL"),
    mustEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    }
  );
}

/** Admin Supabase (service role) — server-only, bypasses RLS */
export function getSupabaseAdminServer() {
  const url = mustEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  // In dev mode, fallback to anon key if service role is missing
  const key = serviceKey || mustEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Canonical:
 * - If signed in → use user client + real user id
 * - If not signed in AND demo mode → use admin client + demo user id
 * - Else → unauth
 */
export async function getUserIdOrDemo() {
  const userSupabase = getSupabaseUserServer();
  const { data } = await userSupabase.auth.getUser();
  const realUserId = data?.user?.id ?? null;

  if (realUserId) {
    return {
      supabase: userSupabase,
      userId: realUserId,
      isAuthed: true,
      isDemo: false,
    };
  }

  if (DEMO_MODE) {
    const admin = getSupabaseAdminServer();
    return {
      supabase: admin,
      userId: DEMO_USER_ID,
      isAuthed: false,
      isDemo: true,
    };
  }

  return {
    supabase: userSupabase,
    userId: null as string | null,
    isAuthed: false,
    isDemo: false,
  };
}

/**
 * Canonical: Always returns a valid userId (never null)
 * - If signed in → use user client + real user id
 * - If not signed in → use admin client + "dev" userId (bypass mode)
 * This ensures all phase routes always have a userId to work with
 */
export async function requireUserOrDemo() {
  const userSupabase = getSupabaseUserServer();
  const { data } = await userSupabase.auth.getUser();
  const realUserId = data?.user?.id ?? null;

  if (realUserId) {
    return {
      supabase: userSupabase,
      userId: realUserId,
      isAuthed: true,
      isDemo: false,
    };
  }

  // ✅ BYPASS MODE: Use admin client with "dev" userId
  // This ensures routes always work, even without auth
  const admin = getSupabaseAdminServer();
  return {
    supabase: admin,
    userId: "dev",
    isAuthed: false,
    isDemo: true,
  };
}

/** Canonical project loader (fixes “project not found” inconsistencies) */
export async function getProjectOrThrow(opts: {
  supabase: any;
  projectId: string;
  userId: string;
  caller: string;
}) {
  const { supabase, projectId, userId, caller } = opts;

  const { data: project, error } = await supabase
    .from("builder_projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error(`[${caller}] fetch error:`, error);
    return {
      project: null,
      res: NextResponse.json(
        { error: "Failed to load project" },
        { status: 500 }
      ),
    };
  }

  if (!project) {
    return {
      project: null,
      res: NextResponse.json({ error: "Project not found" }, { status: 404 }),
    };
  }

  return { project, res: null };
}
