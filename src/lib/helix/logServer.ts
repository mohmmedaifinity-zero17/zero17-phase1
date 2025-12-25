// src/lib/helix/logServer.ts
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import type {
  HelixEventKind,
  HelixEventSource,
  HelixEventMetadata,
} from "./types";

type LogHelixEventInput = {
  kind: HelixEventKind;
  source: HelixEventSource;
  title: string;
  summary: string;
  nextMoveSummary?: string;
  metadata?: HelixEventMetadata;
};

export async function logHelixEventServer(input: LogHelixEventInput) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    // In dev, just swallow – Helix logging should never crash user flow
    console.warn("logHelixEventServer: no user, skipping log", userError);
    return;
  }

  const { kind, source, title, summary, nextMoveSummary, metadata } = input;

  const { error } = await supabase.from("helix_events").insert({
    user_id: user.id,
    kind,
    source,
    title,
    summary,
    next_move_summary: nextMoveSummary ?? null,
    metadata: metadata ?? null,
  });

  if (error) {
    console.error("logHelixEventServer: failed to insert", error);
  }
}
