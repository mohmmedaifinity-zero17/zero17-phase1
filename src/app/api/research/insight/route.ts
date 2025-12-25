// src/app/api/research/insight/route.ts
import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import {
  EvidenceBundle,
  ResearchIdea,
  AutoRealityScan,
} from "@/lib/research/types";

export interface InsightResult {
  marketDirection: string;
  noveltyScore: number;
  moatIndex: number;
  effortPayoffMap: string;
  keyTruths: string[];
  verdict: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const idea = body.idea as ResearchIdea | undefined;
    const evidence = (body.evidence as EvidenceBundle | null) ?? null;

    if (!idea) {
      return NextResponse.json({ error: "Missing idea" }, { status: 400 });
    }

    const auto = evidence?.autoScan as AutoRealityScan | null;

    const helperSnippet = `
IDEA:
${JSON.stringify(idea, null, 2)}

AUTO REALITY SCAN (if available):
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
`;

    const userPrompt = `
You are the QUANTUM INSIGHT ENGINE inside Zero17's Research Lab.

Think like:
- YC partner
- ex-Stripe PM
- early OpenAI builder
- someone who has seen 10,000 SaaS and AI tools.

You DO NOT summarise the idea.
You produce a sharp strategic read.

Use this structured context:

${helperSnippet}

Your goals:

1) MARKET DIRECTION
   - Is this space heating up, plateauing, declining, or undefined?
   - How is AI likely to reshape it in 12–36 months?

2) NOVELTY & MOAT
   - How different is the idea vs typical tools in this category?
   - What realistic moat sources exist? (data, network effects, workflow lock-in, distribution, brand, infra, etc.)

3) EFFORT VS PAYOFF
   - For a solo/small team with the given constraints, is this a sane bet?
   - What is the realistic payoff shape? (side-income product, niche cash machine, venture case, etc.)

4) KEY TRUTHS
   - What are 5–10 uncomfortable truths the founder must hold in their head if they do this?
   - Be kind, but brutally honest.

5) VERDICT
   - 1–2 paragraphs: is this worth the next 12 months of a serious founder, and under what conditions?

Return JSON ONLY in this shape:

{
  "marketDirection": string,
  "noveltyScore": number,     // 0-100
  "moatIndex": number,        // 0-100
  "effortPayoffMap": string,  // short explanation
  "keyTruths": string[],
  "verdict": string
}

Rules:
- Numbers must be integers.
- "keyTruths" must be 5–10 sharp bullets.
- "verdict" must be strong and opinionated, not neutral.
- Do NOT include any explanation outside JSON.
`;

    const completion = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: "You are Zero17's Quantum Insight Engine. Output ONLY JSON.",
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

    const insight = JSON.parse(raw) as InsightResult;

    // Safety casts
    insight.noveltyScore = Math.max(
      0,
      Math.min(100, Math.round(insight.noveltyScore || 0))
    );
    insight.moatIndex = Math.max(
      0,
      Math.min(100, Math.round(insight.moatIndex || 0))
    );

    return NextResponse.json({ insight });
  } catch (err: any) {
    console.error("[Zero17] Insight route error:", err);
    return NextResponse.json(
      {
        error: "Failed to generate insight",
        details: String(err?.message || err),
      },
      { status: 500 }
    );
  }
}
