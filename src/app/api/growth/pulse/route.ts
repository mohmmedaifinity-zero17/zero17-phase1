// src/app/api/growth/pulse/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import type { PulseEvent, GrowthSnapshot } from "@/lib/growth/types";

export async function GET() {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const since = new Date();
    since.setDate(since.getDate() - 7);

    const { data: logs, error } = await supabase
      .from("zero17_growth_pulse_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("occurred_at", since.toISOString())
      .order("occurred_at", { ascending: false });

    if (error) {
      console.error("Get pulse logs error:", error);
      return NextResponse.json(
        { error: "Failed to load pulse" },
        { status: 500 }
      );
    }

    const proofEventsLast7d = logs.length;

    // Very simple tractionPulse calculation for v1:
    const outboundEvents = logs.filter(
      (l) => l.event_type === "outbound_sent"
    ).length;
    const replyEvents = logs.filter(
      (l) => l.event_type === "reply_received"
    ).length;
    const dealWon = logs.filter((l) => l.event_type === "deal_won").length;

    let tractionPulse = 0;
    if (outboundEvents > 0) {
      const replyRate = replyEvents / outboundEvents;
      tractionPulse = Math.min(
        100,
        Math.round(replyRate * 60 + dealWon * 10 + proofEventsLast7d)
      );
    }

    const snapshot: GrowthSnapshot = {
      runwayMonths: null, // will wire to finance later
      tractionPulse,
      proofEventsLast7d,
      activeSprint: proofEventsLast7d > 0,
      emergencyMode: tractionPulse < 20 && proofEventsLast7d === 0,
    };

    const mappedLogs: PulseEvent[] = logs.map((l) => ({
      id: l.id,
      userId: l.user_id,
      occurredAt: l.occurred_at,
      eventType: l.event_type,
      channel: l.channel,
      description: l.description,
      amount: l.amount,
      outcome: (l.outcome ?? null) as any,
      objection: l.objection ?? null,
    }));

    return NextResponse.json({ snapshot, logs: mappedLogs });
  } catch (error) {
    console.error("GET pulse error:", error);
    return NextResponse.json(
      { error: "Failed to load pulse" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = (await req.json()) as PulseEvent;

    const insertPayload = {
      user_id: user.id,
      occurred_at: event.occurredAt ?? new Date().toISOString(),
      event_type: event.eventType,
      channel: event.channel,
      description: event.description,
      amount: event.amount ?? null,
      outcome: event.outcome ?? null,
      objection: event.objection ?? null,
    };

    const { error } = await supabase
      .from("zero17_growth_pulse_logs")
      .insert(insertPayload);

    if (error) {
      console.error("Insert pulse error:", error);
      return NextResponse.json(
        { error: "Failed to log pulse event" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST pulse error:", error);
    return NextResponse.json(
      { error: "Failed to log pulse event" },
      { status: 500 }
    );
  }
}
