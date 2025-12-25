// src/app/api/research/synthesis/route.ts
import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import {
  EvidenceBundle,
  ResearchIdea,
  SynthesisState,
  MatrixFeature,
  AutoRealityScan,
} from "@/lib/research/types";

type Mode = "fusion" | "mutator" | "matrix";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const mode = body.mode as Mode | undefined;
    const idea = body.idea as ResearchIdea | undefined;
    const evidence = (body.evidence as EvidenceBundle | null) ?? null;
    const synthesis = (body.synthesis as SynthesisState | null) ?? null;

    if (!idea || !mode) {
      return NextResponse.json(
        { error: "Missing idea or mode" },
        { status: 400 }
      );
    }

    if (mode === "fusion") return handleFusion(idea, evidence);
    if (mode === "mutator") return handleMutator(idea, evidence);
    if (mode === "matrix") return handleMatrix(idea, evidence, synthesis);

    return NextResponse.json({ error: "Unknown mode" }, { status: 400 });
  } catch (err: any) {
    console.error("[Zero17] Synthesis route error:", err);
    return NextResponse.json(
      { error: "Failed in synthesis", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}

async function handleFusion(
  idea: ResearchIdea,
  evidence: EvidenceBundle | null
) {
  const auto = evidence?.autoScan as AutoRealityScan | null;

  const helper = `
IDEA:
${JSON.stringify(idea, null, 2)}

AUTO COMPETITORS (if any):
${auto ? JSON.stringify(auto.autoCompetitors, null, 2) : "none"}

MANUAL COMPETITORS:
${
  evidence?.competitors
    ?.map((c) => `- ${c.name} (${c.url || "no url"}) · ${c.notes || ""}`)
    .join("\n") || "none"
}
`;

  const userPrompt = `
You are the FEATURE FUSION ENGINE inside Zero17's Synthesis Zone.

Goal:
- Pull the *best features* from tools CLOSEST to this idea.
- Organise them into:
  - Parity features (must-have basics)
  - Delight features (nice touches)
  - Strategic features (moat-building or monetisation-shaping)

Context:
${helper}

Your job:

1) Identify 3–7 realistic "reference products" (can be archetypes, not exact brands).
2) Extract their strongest patterns:
   - onboarding
   - core workflow
   - automations/agents
   - collaboration/multiplayer
   - analytics/feedback
   - monetisation, upsells, expansion.

3) For each feature, explain how it would adapt to THIS idea.

Return JSON ONLY:

{
  "parity": string[],
  "delight": string[],
  "strategic": string[]
}

Each item should be:
- 1–2 sentences:
  - WHAT the feature is
  - HOW it would specifically look in this idea (not generic).
`;

  const completion = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content: "You are Zero17's Feature Fusion Engine. Output ONLY JSON.",
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

  const parsed = JSON.parse(raw) as {
    parity: string[];
    delight: string[];
    strategic: string[];
  };

  const fusionFeatures = [
    ...(parsed.parity || []),
    ...(parsed.delight || []),
    ...(parsed.strategic || []),
  ];

  return NextResponse.json({ fusionFeatures });
}

async function handleMutator(
  idea: ResearchIdea,
  evidence: EvidenceBundle | null
) {
  const auto = evidence?.autoScan as AutoRealityScan | null;

  const helper = `
IDEA:
${JSON.stringify(idea, null, 2)}

AUTO CATEGORY SHAPE (if any):
${auto ? auto.categoryShape : "none"}
`;

  const userPrompt = `
You are the CROSS-CATEGORY MUTATOR inside Zero17's Synthesis Zone.

Goal:
- Steal patterns from UNRELATED categories (Notion, Figma, Duolingo, Airbnb, Discord, Stripe, Uber, etc.)
- Suggest **how to transplant those patterns** into THIS idea.

Constraints:
- This is not a sci-fi engine; keep patterns plausible for next 1–3 years.
- Do not repeat basic patterns like "referrals" unless you add something unique.

Context:
${helper}

Your job:

1) Pick 3–6 cross-category reference products.
2) For each, pick their most powerful:
   - interaction pattern
   - growth loop
   - monetisation pattern
   - psychology trick (e.g. streaks, momentum, social proof).

3) Map each pattern into a concrete suggestion for this idea.

Return JSON ONLY:

{
  "mutationPatterns": string[]
}

Each string:
- 2–3 sentences.
- Start with "Borrow from [X]: ..." then explain how it would look here.
`;

  const completion = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content: "You are Zero17's Cross-Category Mutator. Output ONLY JSON.",
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

  const parsed = JSON.parse(raw) as { mutationPatterns: string[] };

  return NextResponse.json({
    mutationPatterns: parsed.mutationPatterns || [],
  });
}

async function handleMatrix(
  idea: ResearchIdea,
  evidence: EvidenceBundle | null,
  synthesis: SynthesisState | null
) {
  const auto = evidence?.autoScan as AutoRealityScan | null;

  const helper = `
IDEA:
${JSON.stringify(idea, null, 2)}

AUTO REALITY SCAN (if any):
${auto ? JSON.stringify(auto, null, 2) : "none"}

CURRENT FUSION FEATURES:
${JSON.stringify(synthesis?.fusionFeatures || [], null, 2)}

CURRENT MUTATION PATTERNS:
${JSON.stringify(synthesis?.mutationPatterns || [], null, 2)}
`;

  const userPrompt = `
You are BREAK THE MATRIX, the invention engine inside Zero17.

You operate in "future-tilted" mode but still respect reality.

Goal:
- Generate **7–15 future-shaped features** that:
  - CHALLENGE today's defaults
  - Use agents, automation, new UX and new business models
  - Some are near-term plausible, some are "moonshots".

You MUST output structured features with:

- label (short name)
- description
- timeframe: "phase0", "phase1", "phase2", or "moonshot"
- type: one of
  - "experience"
  - "agent"
  - "business_model"
  - "network_effect"
  - "data_moat"
  - "automation"
  - "other"
- difficulty: "low", "medium", "high"
- dependencies: array of short strings (e.g. "reliable API access to X", "enough labelled onboarding data")
- whyInteresting: one paragraph explaining why this could be a category-shaping move.

Context:
${helper}

Rules:
- At least 2 should be realistic "phase0" stretch features.
- At least 3 should be "phase1" bets.
- At least 2 must be "moonshot" with clear labels.
- Some should combine cross-category patterns (like Duolingo streaks + Notion databases + Discord communities).

Return JSON ONLY:

{
  "matrixFeatures": [
    {
      "label": string,
      "description": string,
      "timeframe": "phase0" | "phase1" | "phase2" | "moonshot",
      "type": "experience" | "agent" | "business_model" | "network_effect" | "data_moat" | "automation" | "other",
      "difficulty": "low" | "medium" | "high",
      "dependencies": string[],
      "whyInteresting": string
    }
  ]
}
`;

  const completion = await openai.responses.create({
    model: "gpt-4.1",
    input: [
      {
        role: "system",
        content: "You are Zero17's Break The Matrix engine. Output ONLY JSON.",
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

  const parsed = JSON.parse(raw) as { matrixFeatures: MatrixFeature[] };

  return NextResponse.json({
    matrixFeatures: parsed.matrixFeatures || [],
  });
}
