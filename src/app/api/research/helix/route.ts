import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import {
  EvidenceBundle,
  ResearchIdea,
  SynthesisState,
  ScoreBundle,
  RiskProfile,
  Blueprint,
} from "@/lib/research/types";

interface HelixAdvice {
  primaryAction: string;
  primaryReason: string;
  secondaryTips: string[];
  toneTag: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const idea = body.idea as ResearchIdea | null;
    const evidence = (body.evidence as EvidenceBundle | null) ?? null;
    const synthesis = (body.synthesis as SynthesisState | null) ?? null;
    const scores = (body.scores as ScoreBundle | null) ?? null;
    const risks = (body.risks as RiskProfile | null) ?? null;
    const blueprint = (body.blueprint as Blueprint | null) ?? null;
    const currentStep = (body.currentStep as number | null) ?? 0;

    const helper = `
CURRENT STEP: ${currentStep}
IDEA: ${idea ? JSON.stringify(idea).slice(0, 800) : "none"}
EVIDENCE: receipts=${evidence?.receipts?.length ?? 0}, competitors=${
      evidence?.competitors?.length ?? 0
    }
SYNTHESIS: ${
      synthesis
        ? JSON.stringify(
            {
              fusion: synthesis.fusionFeatures?.length ?? 0,
              mutation: synthesis.mutationPatterns?.length ?? 0,
              matrix: synthesis.matrixFeatures?.length ?? 0,
            },
            null,
            2
          )
        : "none"
    }
SCORES: ${scores ? JSON.stringify(scores).slice(0, 600) : "none"}
RISKS: ${risks ? JSON.stringify(risks).slice(0, 400) : "none"}
BLUEPRINT: ${blueprint ? "exists" : "none"}
`;

    const userPrompt = `
You are HELIX, the orchestration brain of Zero17.

Goal:
- Look at where the user is in the research pipeline.
- Suggest ONE most important next move.
- Explain why in 2–3 sentences.
- Add 3–5 short tactical tips.

Modes:
- If currentStep === 0: push them to define a sharper idea in Origin Frame.
- If step 1 and no evidence: suggest running Reality Scan or adding demand receipts.
- If step 2 and no synthesis: suggest Fusion / Mutator / Break The Matrix.
- If step 3 and no scores: suggest Buildability Index.
- If step 4 and no blueprint: suggest creating Phase 0.
- If step 5: suggest sending to Builder / Growth and maybe running a What-If scenario.

Return JSON ONLY:

{
  "primaryAction": string,
  "primaryReason": string,
  "secondaryTips": string[],
  "toneTag": string
}

"toneTag" can be:
- "gentle-nudge"
- "decisive"
- "warning"
- "celebrate"
`;

    const completion = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "You are HELIX, Zero17's orchestration brain. Output ONLY JSON.",
        },
        {
          role: "user",
          content: helper + "\n\n" + userPrompt,
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

    const helix = JSON.parse(raw) as HelixAdvice;
    helix.secondaryTips = helix.secondaryTips || [];

    return NextResponse.json({ helix });
  } catch (err: any) {
    console.error("[Zero17] Helix route error:", err);
    return NextResponse.json(
      {
        error: "Failed to generate Helix advice",
        details: String(err?.message || err),
      },
      { status: 500 }
    );
  }
}
