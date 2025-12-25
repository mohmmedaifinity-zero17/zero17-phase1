// src/app/api/research/mirror/route.ts
import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import {
  EvidenceBundle,
  ResearchIdea,
  AutoRealityScan,
} from "@/lib/research/types";

export interface MirrorResult {
  closestArchetypes: string[];
  comparisonNarrative: string;
  earlyMilestones: string[];
  longTermPatterns: string[];
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

    const helper = `
IDEA:
${JSON.stringify(idea, null, 2)}

AUTO REALITY SCAN:
${auto ? JSON.stringify(auto, null, 2) : "none"}

MANUAL COMPETITORS:
${
  evidence?.competitors
    ?.map((c) => `- ${c.name} (${c.url || "no url"}) · ${c.notes || ""}`)
    .join("\n") || "none"
}
`;

    const userPrompt = `
You are the SUCCESS-STORY MIRROR inside Zero17.

Goal:
- Reflect this idea against known archetypes:
  - e.g. "Beehiiv + Notion", "Framer + Figma", "Perplexity + Superhuman".

Tasks:

1) Find 2–5 closest archetypes or combos:
   - These can be "X meets Y" shapes.
2) Explain:
   - How those archetypes actually won:
     - at day 0 (MVP)
     - year 1
     - year 3.
3) Map:
   - Where this idea is similar vs different.
   - Where it's stronger vs weaker right now.
4) Provide:
   - earlyMilestones: 5–10 concrete milestones for the first 6–18 months.
   - longTermPatterns: 5–10 patterns used by winners that this founder should remember.

Context:
${helper}

Return JSON ONLY:

{
  "closestArchetypes": string[],
  "comparisonNarrative": string,
  "earlyMilestones": string[],
  "longTermPatterns": string[]
}
`;

    const completion = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: "You are Zero17's Success-Story Mirror. Output ONLY JSON.",
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

    const mirror = JSON.parse(raw) as MirrorResult;

    return NextResponse.json({ mirror });
  } catch (err: any) {
    console.error("[Zero17] Mirror route error:", err);
    return NextResponse.json(
      {
        error: "Failed to generate mirror",
        details: String(err?.message || err),
      },
      { status: 500 }
    );
  }
}
