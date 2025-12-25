// src/app/api/research/evidence/route.ts
import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import {
  AutoRealityScan,
  EvidenceBundle,
  ResearchIdea,
} from "@/lib/research/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const idea = body.idea as ResearchIdea | undefined;
    const existingEvidence = (body.evidence as EvidenceBundle | null) ?? null;

    if (!idea) {
      return NextResponse.json({ error: "Missing idea" }, { status: 400 });
    }

    const helperSnippet = existingEvidence
      ? `
USER-SUPPLIED RECEIPTS (TRUNCATED):
${
  existingEvidence.receipts
    .slice(0, 6)
    .map((r) => `- [${r.source}/${r.tag}] ${r.rawText.slice(0, 200)}`)
    .join("\n") || "- none"
}

USER-SUPPLIED COMPETITORS:
${
  existingEvidence.competitors
    .map((c) => `- ${c.name} (${c.url || "no url"})`)
    .join("\n") || "- none"
}
`
      : "No user-supplied receipts or competitors yet.";

    const userPrompt = `
You are the AUTO REALITY SCANNER inside Zero17's Research Lab.

Your personality:
- Brutally honest, but on the founder's side.
- Think like a mix of: elite YC partner + ex-Stripe PM + growth lead + category theorist.
- Your job is NOT to flatter the idea. Your job is to show the terrain clearly.

## IDEA (STRUCTURED)
${JSON.stringify(idea, null, 2)}

## OPTIONAL USER EVIDENCE
${helperSnippet}

Your goals at this stage:

1) Rapid external reality map:
   - What category does this MOST LIKELY sit in today?
   - What are the closest archetypes (types of tools/businesses)?
   - Who are 3–7 likely competitor examples or near-neighbours?

2) Brutal truth snapshot:
   - Is this category saturated, rising, decaying, or undefined?
   - Where do most tools in this space get stuck? (activation, retention, trust, CAC etc.)
   - What shape of founder wins here (solo hacker, small agency, VC-backed infra, etc.)?

3) Demand + gap patterns:
   - Based on how markets behave, what demand patterns are most likely?
   - What "hidden wedge" might exist (a specific ICP, workflow, channel, or motion)?
   - Where are there obvious traps or illusions (things that sound sexy but don't pay)?

4) Future threats (12–36 months):
   - What platform/AI moves could erase this idea?
   - Which adjacent giants could absorb it?
   - Which regulatory or platform policy shifts could nuke it?

5) Proof checklist:
   - What 5–10 specific things should the founder validate NEXT?
   - Make them concrete. Examples: "3 calls with X-type customer to confirm Y", "1 pre-sell experiment at Z price".

Now construct an AUTO REALITY SCAN.

## OUTPUT FORMAT (JSON ONLY)

Return JSON:

{
  "brutalSummary": string,
  "categoryShape": string,
  "demandSignals": string[],
  "gapsAndWedges": string[],
  "futureThreats": string[],
  "suggestedProof": string[],
  "autoCompetitors": [
    {
      "name": string,
      "category": string,
      "description": string,
      "angle": string,
      "pricingBand": string,
      "strength": string,
      "weakness": string
    }
  ]
}

Guidelines:

- "brutalSummary": 2–4 short paragraphs, straight talk, no fluff.
- "categoryShape": explain how this market is structured (segments, typical players).
- "demandSignals": 5–10 bullet hypotheses about real buyer/user behaviour in this space.
- "gapsAndWedges": 4–10 very specific wedge angles, not generic "better UX" comments.
- "futureThreats": 4–10 sober threats (platform, giants, macro shifts).
- "suggestedProof": 5–10 concrete validation steps.
- "autoCompetitors": 3–7 named examples or archetypes; be specific and use realistic names and shapes.

Think like a strategist building a map that a top founder prints out and sticks to their wall.

Important:
- Do NOT assume the idea is good. If it's weak, your scan should show that clearly.
- No markdown. JSON only.
`;

    const completion = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "You are Zero17's Auto Reality Scanner. Output only valid JSON in the specified schema.",
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

    const scan = JSON.parse(raw) as AutoRealityScan;

    return NextResponse.json({ scan });
  } catch (err: any) {
    console.error("[Zero17] Evidence/Reality route error:", err);
    return NextResponse.json(
      {
        error: "Failed to generate auto reality scan",
        details: String(err?.message || err),
      },
      { status: 500 }
    );
  }
}
