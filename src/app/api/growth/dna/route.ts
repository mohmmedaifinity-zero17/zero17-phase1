// src/app/api/growth/dna/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { openai } from "@/lib/openai";
import type {
  GrowthMasterbrainInput,
  GrowthMasterbrainOutput,
  GrowthDNAPlan,
} from "@/lib/growth/types";

export async function POST(req: Request) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      input: GrowthMasterbrainInput;
      masterbrain?: GrowthMasterbrainOutput | null;
    };

    const systemPrompt = `
You are the Growth DNA Engine for Zero17.

You don't give generic "growth tips".
You build a *growth DNA synthesis*:
- Take the founder context (product, ICP, price, constraints).
- Use the chosen engines from Growth Masterbrain (if provided).
- Map them to real-world archetypes (like Figma, Notion, Beehiiv, Framer, Superhuman, ConvertKit, Airbnb, Stripe, Duolingo, etc.).
- Output a *merged*, *practical* 7-day plan that borrows patterns, not just names.

You must respond as strict JSON with this shape:

type GrowthDNAPlan = {
  primaryArchetypeSummary: string;
  mergedPlaybookSummary: string;
  archetypes: {
    id: string;
    label: string;
    companyExamples: string[];
    description: string;
    whyMatch: string;
    keyMoves: string[];
  }[];
  sevenDayPlan: {
    day: number;
    title: string;
    focus: string;
    actions: string[];
  }[];
  notes: string;
};

Rules:
- Only output JSON, no prose outside JSON.
- Use 2–3 archetypes max to avoid confusion.
- 7-day plan must be realistic for a solo/lean founder.
- Focus on *one primary engine* and *one support pattern*.
- Use brutal honesty: if constraints are severe, keep plan small but sharp.
`.trim();

    const userPrompt = `
Founder context:
- Product type: ${body.input.productType}
- ICP: ${body.input.icpDescription}
- Price point: ${body.input.pricePoint}
- Stage: ${body.input.currentStage}
- Current MRR: ${body.input.currentMRR ?? "unknown"}
- Time per week: ${body.input.timePerWeekHours}h
- Budget per month: ${body.input.budgetPerMonth}
- Skills: ${body.input.skills.join(", ") || "not specified"}
- Constraints: ${body.input.constraints}

Growth Masterbrain (if available):
- Primary engine: ${body.masterbrain?.primaryEngine ?? "unknown"}
- Secondary engine: ${body.masterbrain?.secondaryEngine ?? "none"}
- Archetype label: ${body.masterbrain?.growthArchetype.label ?? "unknown"}
- North star: ${body.masterbrain?.northStarMetric ?? "unknown"}
- Weekly target: ${body.masterbrain?.weeklyTarget ?? "unknown"}

Your job:
- Choose 2–3 real-world growth archetypes whose patterns fit this founder.
- Explain why each matches.
- Extract their key tactical moves.
- Fuse them into one 7-day micro-playbook:
  - Each day: one theme + 2–4 concrete actions.
`.trim();

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const raw =
      response.output[0] &&
      "content" in response.output[0] &&
      Array.isArray(response.output[0].content) &&
      response.output[0].content[0] &&
      "type" in response.output[0].content[0] &&
      response.output[0].content[0].type === "output_text" &&
      "text" in response.output[0].content[0]
        ? response.output[0].content[0].text
        : null;

    if (!raw) {
      return NextResponse.json(
        { error: "Unexpected OpenAI response format" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(raw) as GrowthDNAPlan;
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Growth DNA Engine error:", error);
    return NextResponse.json(
      { error: "Failed to compute Growth DNA plan" },
      { status: 500 }
    );
  }
}
