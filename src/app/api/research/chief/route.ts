// src/app/api/research/chief/route.ts
import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import {
  EvidenceBundle,
  ResearchIdea,
  ScoreBundle,
  RiskProfile,
  Blueprint,
  AutoRealityScan,
} from "@/lib/research/types";

export interface ChiefAdvice {
  mode: "explore" | "green" | "caution" | "red" | "theory";
  headline: string;
  summary: string;
  nextActions: string[];
  warnings: string[];
  badge: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const idea = body.idea as ResearchIdea | undefined;
    const evidence = (body.evidence as EvidenceBundle | null) ?? null;
    const scores = (body.scores as ScoreBundle | null) ?? null;
    const risks = (body.risks as RiskProfile | null) ?? null;
    const blueprint = (body.blueprint as Blueprint | null) ?? null;

    if (!idea) {
      return NextResponse.json({ error: "Missing idea" }, { status: 400 });
    }

    const auto = evidence?.autoScan as AutoRealityScan | null;

    const receiptsCount = evidence?.receipts?.length ?? 0;
    const competitorsCount = evidence?.competitors?.length ?? 0;

    const helper = `
IDEA:
${JSON.stringify(idea, null, 2)}

AUTO REALITY SCAN:
${auto ? JSON.stringify(auto, null, 2) : "none"}

SCORES:
${JSON.stringify(scores || {}, null, 2)}

RISKS:
${JSON.stringify(risks || {}, null, 2)}

BLUEPRINT SUMMARY (if exists):
${blueprint ? blueprint.summary.slice(0, 1200) : "none"}

EVIDENCE COUNTS:
- Demand receipts: ${receiptsCount}
- Competitors: ${competitorsCount}
`;

    const userPrompt = `
You are the VALIDATION CHIEF inside Zero17.

Personality:
- Calm, sharp, very experienced.
- Talks like a YC partner / ex-Stripe PM / founder who has seen thousands of products.
- On the founder's side, but brutally honest.

Your job:
- Look at the state of this idea, evidence, scores, risks and blueprint.
- Decide which mode we're in:
  - "explore": very early / messy / not enough data yet
  - "green": strong signs to build a tight Phase 0
  - "caution": promising, but with real landmines
  - "red": do NOT commit 12 months; something is fundamentally off
  - "theory": no real-world evidence yet; treat as a thinking exercise

Then:
- Give a short headline.
- 2–4 paragraph summary in plain language.
- 4–8 concrete next actions.
- 2–6 clear warnings (if any).

Important principles:

- If receiptsCount + competitorsCount == 0:
  - You SHOULD lean toward "explore" or "theory" unless scores + auto scan are very strong.
- If buildabilityIndex or signalPulse is very low:
  - You should not pretend it's fine.
- If risks.overall is "high":
  - You must surface that clearly and propose Safe-Mode ideas.

Context:
${helper}

Return JSON ONLY in this exact shape:

{
  "mode": "explore" | "green" | "caution" | "red" | "theory",
  "headline": string,
  "summary": string,
  "nextActions": string[],
  "warnings": string[],
  "badge": string
}

Rules:
- "headline": 1 short punchy sentence.
- "summary": 2–4 paragraphs, but as a single string (you can use "\\n\\n" for breaks).
- "nextActions": 4–8 items, extremely practical.
- "warnings": 2–6 items; if there are genuinely no major warnings, you can return a couple of "things to watch instead".
- "badge": a short label like "Build a tight Phase 0", "You are still in theory mode", "Evidence first, build later", etc.

Be kind but do NOT sugarcoat. The founder is serious about their time.
`;

    const completion = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: "You are Zero17's Validation Chief. Output ONLY JSON.",
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const raw =
      completion.output[0] &&
      "content" in completion.output[0] &&
      Array.isArray(completion.output[0].content) &&
      completion.output[0].content[0] &&
      "type" in completion.output[0].content[0] &&
      completion.output[0].content[0].type === "output_text" &&
      "text" in completion.output[0].content[0]
        ? completion.output[0].content[0].text
        : "{}";

    const chief = JSON.parse(raw) as ChiefAdvice;

    // basic safety
    if (
      !["explore", "green", "caution", "red", "theory"].includes(chief.mode)
    ) {
      chief.mode = "explore";
    }
    chief.nextActions = chief.nextActions || [];
    chief.warnings = chief.warnings || [];
    chief.badge = chief.badge || "Keep thinking, but protect your time.";

    return NextResponse.json({ chief });
  } catch (err: any) {
    console.error("[Zero17] Chief route error:", err);
    return NextResponse.json(
      {
        error: "Failed to generate Validation Chief advice",
        details: String(err?.message || err),
      },
      { status: 500 }
    );
  }
}
