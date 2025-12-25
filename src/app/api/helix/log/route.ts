// src/app/api/helix/log/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: any = null;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const insert = {
      user_id: user?.id ?? null,
      source: body.source ?? null,
      kind: body.kind ?? null,
      title: body.title ?? "",
      summary: body.summary ?? "",
      metadata: body.metadata ?? {},
      next_move_summary: body.nextMoveSummary ?? null,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("helix_events").insert(insert);
    if (error) {
      console.error("[Helix] insert error", error);
    }
  } catch (err) {
    console.error("[Helix] log route error", err);
  }

  return NextResponse.json({ ok: true });
}
