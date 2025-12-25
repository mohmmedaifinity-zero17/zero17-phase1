// src/app/api/research/scores/route.ts
import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import {
  EvidenceBundle,
  ResearchIdea,
  ScoreBundle,
  SynthesisState,
  AutoRealityScan,
} from "@/lib/research/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const idea = body.idea as ResearchIdea | undefined;
    const evidence = (body.evidence as EvidenceBundle | null) ?? null;
    const synthesis = (body.synthesis as SynthesisState | null) ?? null;

    if (!idea) {
      return NextResponse.json({ error: "Missing idea" }, { status: 400 });
    }

    const auto = evidence?.autoScan as AutoRealityScan | null;

    const helper = `
IDEA:
${JSON.stringify(idea, null, 2)}

AUTO REALITY SCAN:
${auto ? JSON.stringify(auto, null, 2) : "none"}

MANUAL RECEIPTS (truncated):
${
  evidence?.receipts
    ?.slice(0, 6)
    .map((r) => `- [${r.source}/${r.tag}] ${r.rawText.slice(0, 200)}`)
    .join("\n") || "none"
}

MANUAL COMPETITORS:
${
  evidence?.competitors
    ?.map((c) => `- ${c.name} (${c.url || "no url"}) · ${c.notes || ""}`)
    .join("\n") || "none"
}

SYNTHESIS:
${JSON.stringify(synthesis || {}, null, 2)}
`;

    const userPrompt = `
You are the SMART SCORE STACK inside Zero17 (Buildability Index).

Goal:
- Produce 10 sub-scores (0–10)
- A Buildability Index (0–100)
- A Signal Pulse (0–100)
- A Proof Stack summary (counts of receipts/competitors/blueprints).

You are extremely strict but fair.

Sub-scores:

1) problemCertainty
2) demandEvidenceStrength
3) categoryMomentum
4) urgency
5) icpClarity
6) dataAdvantagePotential
7) buildComplexity   (higher complexity = LOWER score)
8) moatStrength
9) growthPathClarity
10) revenueShapePotential

Guidance:
- Use auto reality scan heavily if present.
- Penalise fantasy ideas with no evidence and huge build scope.
- Reward tight wedges, strong receipts, and realistic scope for a solo/small team.
- If there are zero receipts and no strong external signals, demandEvidenceStrength should be 0–3.

Signal Pulse:
- Combined sense of "does the world want this?" from receipts + category momentum.

Buildability Index:
- Weighted mix. Rough guidance:
  - Evidence + problem + ICP clarity + momentum: 50%
  - Complexity penalty: -20%
  - Moat + growth + revenue shape: 30%

Context:
${helper}

Return JSON ONLY:

{
  "buildabilityIndex": number,
  "signalPulse": number,
  "subScores": {
    "problemCertainty": number,
    "demandEvidenceStrength": number,
    "categoryMomentum": number,
    "urgency": number,
    "icpClarity": number,
    "dataAdvantagePotential": number,
    "buildComplexity": number,
    "moatStrength": number,
    "growthPathClarity": number,
    "revenueShapePotential": number
  },
  "proofStack": {
    "receiptsCount": number,
    "competitorsCount": number,
    "blueprintsCount": number
  }
}

All numbers:
- sub-scores: integers 0–10
- buildabilityIndex: 0–100
- signalPulse: 0–100
`;

    const completion = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "You are Zero17's Buildability Index engine. Output ONLY JSON.",
        },
        { role: "user", content: userPrompt },
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

    const parsed = JSON.parse(raw) as ScoreBundle;

    // Basic safety normalisation
    parsed.buildabilityIndex = Math.max(
      0,
      Math.min(100, Math.round(parsed.buildabilityIndex ?? 0))
    );
    parsed.signalPulse = Math.max(
      0,
      Math.min(100, Math.round(parsed.signalPulse ?? 0))
    );

    Object.keys(parsed.subScores || {}).forEach((k) => {
      const v = (parsed.subScores as any)[k];
      (parsed.subScores as any)[k] = Math.max(
        0,
        Math.min(10, Math.round(v ?? 0))
      );
    });

    parsed.proofStack = {
      receiptsCount: evidence?.receipts?.length ?? 0,
      competitorsCount: evidence?.competitors?.length ?? 0,
      blueprintsCount: parsed.proofStack?.blueprintsCount ?? 0,
    };

    return NextResponse.json({ scores: parsed });
  } catch (err: any) {
    console.error("[Zero17] Scores route error:", err);
    return NextResponse.json(
      {
        error: "Failed to compute scores",
        details: String(err?.message || err),
      },
      { status: 500 }
    );
  }
}
