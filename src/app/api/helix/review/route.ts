// src/app/api/helix/review/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import type { HelixEvent, HelixReview } from "@/lib/helix/types";

export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Last ~40 Helix events for this user
    const { data: events, error: eventsError } = await supabase
      .from("helix_events")
      .select(
        "id, user_id, source, kind, title, summary, next_move_summary, metadata, created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(40);

    if (eventsError) {
      console.error("Helix review: events error", eventsError);
    }

    // Last research memory row
    const { data: researchRows } = await supabase
      .from("zero17_research_memory")
      .select("id, label, decision, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3);

    // Last growth runs
    const { data: growthRows } = await supabase
      .from("zero17_growth_runs")
      .select("id, label, decision, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3);

    const payload = {
      events: (events || []) as HelixEvent[],
      research: researchRows || [],
      growth: growthRows || [],
    };

    const chat = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are Helix X, a ruthless but loyal cofounder reviewing this founder's recent moves across Research, Builder, Launch and Growth. You must output tight JSON only.",
        },
        {
          role: "user",
          content: [
            "Here is the recent history of Helix events, research runs and growth sprints. Identify 2–4 brutal truths about how they operate, and 2–4 concrete moves for the next 7 days.\n\n",
            JSON.stringify(payload),
          ].join(""),
        },
      ],
    });

    const content = chat.choices[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAI returned empty content");
    }

    let parsed: HelixReview;
    try {
      parsed = JSON.parse(content) as HelixReview;
    } catch (err) {
      console.error("Helix review JSON parse error", err, content);
      // fallback minimal structure
      parsed = {
        generatedAt: new Date().toISOString(),
        truths: [
          {
            title: "Helix Review failed to parse",
            detail:
              "Treat this as a signal to keep your next experiment simple and log outcomes cleanly.",
          },
        ],
        moves: [],
        riskFlags: ["llm_parse_error"],
      };
    }

    // Ensure timestamps
    if (!parsed.generatedAt) {
      parsed.generatedAt = new Date().toISOString();
    }

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("Helix review route error:", err);
    return NextResponse.json(
      {
        error:
          "Helix Review failed. Treat this as a sign to run one tiny, honest experiment this week instead of overthinking.",
      },
      { status: 500 }
    );
  }
}
