// src/app/api/growth/brand/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { product, audience } = await req.json();

  const p = (product as string)?.trim() || "an AI-powered founder OS";
  const a =
    (audience as string)?.trim() || "solo founders and small product teams";

  const result = {
    nameIdeas: ["Zero17", "LaunchGrid", "Founder Orbit", "CoreLoop"],
    taglines: [
      "Turn ideas into proof, proof into products.",
      "The operating system for serious builders.",
      "From spark to revenue, all in one rail.",
    ],
    toneWords: ["direct", "calm", "decisive", "evidence-first"],
    colorDirections: [
      "Deep charcoal + electric accent",
      "Off-white canvas + black typography",
      "Single accent color for all primary actions",
    ],
    narrative: `You are building ${p} for ${a}. The brand should feel like a calm, sharp co-founder that knows what to do next, without hype or fluff. We focus on evidence, shipped work, and momentum.`,
  };

  return NextResponse.json(result, { status: 200 });
}
