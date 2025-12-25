// src/lib/builder/server/auth.ts
import { cookies } from "next/headers";

// If you already have a server supabase helper, you can swap it in later.
// This file is written to NEVER crash the builder.
export async function getUserIdOrDev(): Promise<{
  mode: "auth" | "dev";
  userId: string;
}> {
  // DEV OVERRIDE: if you set this, builder always works without auth
  // Example: Z17_BUILDER_DEV=1 in .env.local
  const devOverride = process.env.Z17_BUILDER_DEV === "1";
  if (devOverride) {
    return { mode: "dev", userId: "dev_user" };
  }

  // Try to read Supabase session if your app has it wired.
  // If anything fails, fall back to dev mode (so UI never bricks).
  try {
    // If you have createServerSupabase() already, use it here.
    // Example:
    // const supabase = createServerSupabase();
    // const { data: { user } } = await supabase.auth.getUser();

    // Generic cookie check fallback (non-blocking)
    const cookieJar = cookies();
    const hasAnyAuthCookie =
      cookieJar.get("sb-access-token") ||
      cookieJar.get("sb-refresh-token") ||
      cookieJar
        .getAll()
        .some((c) => c.name.startsWith("sb-") || c.name.includes("supabase"));

    if (!hasAnyAuthCookie) {
      return { mode: "dev", userId: "dev_user" };
    }

    // If cookies exist but auth still fails in your supabase layer,
    // we STILL fall back to dev, because your priority is unblocked building.
    return { mode: "dev", userId: "dev_user" };
  } catch {
    return { mode: "dev", userId: "dev_user" };
  }
}
