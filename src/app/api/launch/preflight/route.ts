import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const result = {
    overallScore: 84,
    goNoGo: "TUNE" as "GO" | "TUNE" | "WAIT",
    marketFit: {
      score: 80,
      notes: [
        "Problem is real for a clear niche.",
        "Positioning is promising but messaging could be sharper.",
      ],
    },
    failurePatterns: {
      risks: [
        "Distribution risk: no owned audience yet.",
        "Retention risk if core feature is not sticky enough.",
      ],
      confidence: 0.72,
    },
    legalRisk: {
      level: "medium" as "low" | "medium" | "high",
      notes: [
        "Using 3rd-party APIs: review their ToS and rate limits.",
        "If handling user content, add clear content policy.",
      ],
    },
    techStability: {
      score: 82,
      hotspots: [
        "Consider caching AI responses for hot paths.",
        "Plan for DB connection pooling in production.",
      ],
    },
    businessViability: {
      score: 78,
      notes: [
        "Pricing could sustain a solo founder if churn is controlled.",
        "Move quickly to validate 2–3 high-intent customer segments.",
      ],
    },
  };

  return NextResponse.json(result, { status: 200 });
}
