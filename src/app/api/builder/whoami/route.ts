import { NextResponse } from "next/server";
import { getCtx } from "@/app/api/builder/_shared";

export const dynamic = "force-dynamic";

export async function GET() {
  const { supabase, userId } = await getCtx();

  // Try a lightweight call so we know the client is valid
  const ping = await supabase.from("builder_projects").select("id").limit(1);

  return NextResponse.json(
    {
      userId,
      demoMode: process.env.ZERO17_DEMO_MODE === "1",
      hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      pingError: ping.error ? { message: ping.error.message } : null,
    },
    { status: 200 }
  );
}
