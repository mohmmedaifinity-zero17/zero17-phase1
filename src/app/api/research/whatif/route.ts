// src/app/api/research/whatif/route.ts
import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import {
  EvidenceBundle,
  ResearchIdea,
  SynthesisState,
  ScoreBundle,
  Blueprint,
} from "@/lib/research/types";

export type WhatIfScenarioKey =
  | "solo_3_months"
  | "enterprise"
  | "free_product"
  | "agent_first";

interface WhatIfResult {
  scenarioKey: WhatIfScenarioKey;
  scores: ScoreBundle;
  blueprint: Blueprint;
  note: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const idea = body.idea as ResearchIdea | null;
    const evidence = (body.evidence as EvidenceBundle | null) ?? null;
    const synthesis = (body.synthesis as SynthesisState | null) ?? null;
    const scenarioKey = body.scenarioKey as WhatIfScenarioKey | undefined;

    if (!idea || !scenarioKey) {
      return NextResponse.json(
        { error: "Missing idea or scenarioKey" },
        { status: 400 }
      );
    }

    const scenarioBrief = describeScenario(scenarioKey);

    const helper = `
IDEA:
${JSON.stringify(idea, null, 2)}

EVIDENCE (counts):
- Receipts: ${evidence?.receipts?.length ?? 0}
- Competitors: ${evidence?.competitors?.length ?? 0}

SYNTHESIS:
${JSON.stringify(synthesis || {}, null, 2)}

SCENARIO:
${JSON.stringify(scenarioBrief, null, 2)}
`;

    const userPrompt = `
You are the WHAT-IF SIMULATOR inside Zero17.

We are exploring a specific scenario:

${JSON.stringify(scenarioBrief, null, 2)}

You must:
1) Recompute buildability scores + signal pulse **under this scenario**.
2) Produce a scenario-specific blueprint (Phase 0/1/2).
3) Explain in a short note how this scenario changes the bet vs default.

Use the same scoring axes as Buildability Index:
- problemCertainty
- demandEvidenceStrength
- categoryMomentum
- urgency
- icpClarity
- dataAdvantagePotential
- buildComplexity (higher complexity = lower score)
- moatStrength
- growthPathClarity
- revenueShapePotential

And the same blueprint structure:
- summary
- phase0Scope
- phase1Scope
- phase2Scope
- featureStack { core, distinctive, matrixOptional }
- systemPlan
- gtmSeedPlan
- decisionNote

Context:
${helper}

Return JSON ONLY:

{
  "scenarioKey": "${scenarioKey}",
  "scores": {
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
  },
  "blueprint": {
    "summary": string,
    "phase0Scope": string,
    "phase1Scope": string,
    "phase2Scope": string,
    "featureStack": {
      "core": string[],
      "distinctive": string[],
      "matrixOptional": string[]
    },
    "systemPlan": string,
    "gtmSeedPlan": string,
    "decisionNote": string
  },
  "note": string
}

Rules:
- Adjust buildComplexity heavily based on the scenario (e.g., solo for 3 months = very harsh on complexity).
- Blueprint Phase 0 MUST respect the scenario constraints.
- "note" should be 2–3 paragraphs explaining how this scenario changes the angle.
- All numbers must be integers, clamped to correct ranges.
`;

    const completion = await openai.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "system",
          content: "You are Zero17's What-If simulator. Output ONLY JSON.",
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

    const parsed = JSON.parse(raw) as WhatIfResult;

    // clamp
    parsed.scores.buildabilityIndex = clamp(
      parsed.scores.buildabilityIndex ?? 0,
      0,
      100
    );
    parsed.scores.signalPulse = clamp(parsed.scores.signalPulse ?? 0, 0, 100);
    Object.keys(parsed.scores.subScores || {}).forEach((k) => {
      const v = (parsed.scores.subScores as any)[k];
      (parsed.scores.subScores as any)[k] = clamp(v ?? 0, 0, 10);
    });

    parsed.scores.proofStack = {
      receiptsCount: evidence?.receipts?.length ?? 0,
      competitorsCount: evidence?.competitors?.length ?? 0,
      blueprintsCount: parsed.scores.proofStack?.blueprintsCount ?? 0,
    };

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("[Zero17] WhatIf route error:", err);
    return NextResponse.json(
      {
        error: "Failed to run what-if simulation",
        details: String(err?.message || err),
      },
      { status: 500 }
    );
  }
}

function describeScenario(key: WhatIfScenarioKey) {
  switch (key) {
    case "solo_3_months":
      return {
        key,
        label: "Solo founder · 3-month runway",
        constraints:
          "One person, limited time, no team. Must ship a tiny but sharp Phase 0 in <=3 months.",
        notes:
          "You must be ruthless about scope and automation; prefer workflows that reduce ongoing support.",
      };
    case "enterprise":
      return {
        key,
        label: "Enterprise ICP",
        constraints:
          "Target 50–5000 employee companies, with security/compliance and multi-stakeholder buying.",
        notes:
          "Funnels are longer, proof requirements higher, and integrations + reporting matter more.",
      };
    case "free_product":
      return {
        key,
        label: "Free product wedge",
        constraints:
          "Core product is free or very cheap; monetisation via add-ons, usage, or teams later.",
        notes:
          "Distribution and retention become central; you trade short-term revenue for adoption.",
      };
    case "agent_first":
      return {
        key,
        label: "Agent-first architecture",
        constraints:
          "Agents/automation are primary; UI is mainly supervision and configuration.",
        notes:
          "Architecture must favour orchestrating agents safely, with clear observability and fallbacks.",
      };
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(n)));
}
