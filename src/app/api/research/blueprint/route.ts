// src/app/api/research/blueprint/route.ts
import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import {
  Blueprint,
  EvidenceBundle,
  ResearchIdea,
  RiskProfile,
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
    const scores = (body.scores as ScoreBundle | null) ?? null;
    const risks = (body.risks as RiskProfile | null) ?? null;

    if (!idea) {
      return NextResponse.json({ error: "Missing idea" }, { status: 400 });
    }

    const auto = evidence?.autoScan as AutoRealityScan | null;

    const helper = `
IDEA:
${JSON.stringify(idea, null, 2)}

AUTO REALITY SCAN:
${auto ? JSON.stringify(auto, null, 2) : "none"}

EVIDENCE (counts):
- Receipts: ${evidence?.receipts?.length ?? 0}
- Competitors: ${evidence?.competitors?.length ?? 0}

SYNTHESIS:
${JSON.stringify(synthesis || {}, null, 2)}

SCORES:
${JSON.stringify(scores || {}, null, 2)}

RISKS:
${JSON.stringify(risks || {}, null, 2)}
`;

    const userPrompt = `
You are the STRATEGIC BLUEPRINT FOUNDRY inside Zero17.

Goal:
- Turn everything so far into a 3-phase plan:
  - Phase 0: build now (solo/small team, 60–90 days)
  - Phase 1: next 60–90 days AFTER Phase 0
  - Phase 2: 6–12 month bets and Matrix features.

Sections you must output:

1) summary (Story Block)
   - Tight 2–4 paragraph narrative:
     - problem
     - why now
     - who it's for (ICP)
     - core promise
     - the strategic angle (wedge).

2) phase0Scope
   - Extremely focused.
   - What EXACTLY gets built in Phase 0:
     - surfaces (pages, flows)
     - 3–7 key features
     - what is intentionally excluded.

3) phase1Scope
   - Extension of Phase 0:
     - stronger features
     - more automation, agents, collaboration
     - but still realistic for a small team.

4) phase2Scope
   - 6–12m horizon, Matrix features:
     - the most ambitious features
     - only if product shows real traction.

5) featureStack:
   - core: things that MUST live in Phase 0
   - distinctive: features that differentiate you (often Phase 0–1)
   - matrixOptional: the best Matrix features for Phase 1–2.

6) systemPlan:
   - Outline of:
     - key screens / flows
     - main data objects
     - integrations/APIs
     - where agents fit (if any).

7) gtmSeedPlan:
   - ICP focus
   - 1–2 channels
   - shape of first 20–50 users:
     - what offers
     - what pricing ranges
     - what proof milestones to aim for.

8) decisionNote:
   - Validation Chief-style verdict:
     - "Build now", "Build a tiny Phase 0 then reassess", or "Park/kill and here's why".
   - Reference Buildability Index, Signal Pulse, and major risks.

Context:
${helper}

Use:
- Fusion features as raw material for core & distinctive.
- Mutator patterns & Matrix features to spice Phase 1–2 / matrixOptional.
- If Matrix is empty, keep matrixOptional short or empty.

Return JSON ONLY:

{
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
}
`;

    const completion = await openai.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "system",
          content: "You are Zero17's Blueprint Foundry. Output ONLY JSON.",
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

    const parsed = JSON.parse(raw) as Blueprint;

    // Basic shape sanity
    parsed.featureStack = parsed.featureStack || {
      core: [],
      distinctive: [],
      matrixOptional: [],
    };

    return NextResponse.json({ blueprint: parsed });
  } catch (err: any) {
    console.error("[Zero17] Blueprint route error:", err);
    return NextResponse.json(
      {
        error: "Failed to generate blueprint",
        details: String(err?.message || err),
      },
      { status: 500 }
    );
  }
}
