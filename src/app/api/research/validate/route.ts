import { NextResponse } from "next/server";

type Scores = {
  signal_scores: Record<string, number>;
  explanations?: Record<string, string>;
  citations?: Array<{ title?: string; url?: string }>;
};

function dummyPayload(idea: string): Scores {
  const base = idea?.length ? Math.min(9, 6 + Math.floor(idea.length % 4)) : 7;
  return {
    signal_scores: {
      Clarity: base + 0.2,
      Novelty: base + 0.5,
      Potential: base + 0.7,
      Execution: base - 0.4,
      Momentum: base + 1.0,
    },
    explanations: {
      Clarity: "Clear problem/user framing from your description.",
      Novelty: "Pattern differs from common templates.",
      Potential: "Market size proxy and pain look promising.",
      Execution: "Feasibility moderate; depends on integrations.",
      Momentum: "Theme aligns with interest/trend signals.",
    },
    citations: [
      { title: "Example Source A", url: "https://example.com/a" },
      { title: "Example Source B", url: "https://example.com/b" },
    ],
  };
}

export async function POST(req: Request) {
  try {
    const { idea } = await req.json().catch(() => ({ idea: "" }));
    const payload = dummyPayload(idea ?? "");
    return NextResponse.json(payload, { status: 200 });
  } catch {
    return NextResponse.json({ error: "stub-failed" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idea = searchParams.get("idea") ?? "";
    const payload = dummyPayload(idea);
    return NextResponse.json(payload, { status: 200 });
  } catch {
    return NextResponse.json({ error: "stub-failed" }, { status: 500 });
  }
}
