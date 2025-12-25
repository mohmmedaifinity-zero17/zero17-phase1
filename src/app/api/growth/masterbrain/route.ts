// src/app/api/growth/masterbrain/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { openai } from "@/lib/openai";
import type {
  GrowthMasterbrainInput,
  GrowthMasterbrainOutput,
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

    const body = (await req.json()) as GrowthMasterbrainInput;

    const systemPrompt = `
You are Growth Masterbrain — a 0.01% level growth strategist.
You think like a hybrid of CMO, growth PM, sales leader, and operator.

Your job:
- Read the founder's context
- Choose exactly ONE primary growth engine and ONE secondary
- Define a realistic weekly north star metric
- Expose threats & moats
- Be brutally honest but constructive.

You MUST respond as a strict JSON object with this TypeScript shape:

type GrowthMasterbrainOutput = {
  primaryEngine: "outbound" | "content" | "referral" | "community" | "paid" | "product_led";
  secondaryEngine: "outbound" | "content" | "referral" | "community" | "paid" | "product_led" | null;
  growthArchetype: {
    id: string;
    label: string;
    description: string;
    engines: ("outbound" | "content" | "referral" | "community" | "paid" | "product_led")[];
  };
  northStarMetric: string;
  weeklyTarget: string;
  threatRadar: string[];
  moatMap: string[];
  notes: string;
};
`.trim();

    const userPrompt = `
Founder context:
- Product type: ${body.productType}
- ICP: ${body.icpDescription}
- Price point: ${body.pricePoint}
- Current stage: ${body.currentStage}
- Current MRR: ${body.currentMRR ?? "unknown"}
- Time per week (hours): ${body.timePerWeekHours}
- Budget per month: ${body.budgetPerMonth}
- Skills: ${body.skills.join(", ") || "not specified"}
- Constraints: ${body.constraints}

Rules:
- Pick ONE primary engine that is realistic.
- Secondary can be null if you believe focus on one engine is best.
- North star metric must be measurable (e.g. "Sales calls booked per week").
- Weekly target must match time + budget constraints.
- Threat radar: list 3–7 specific risks (e.g., "trying to grow on too many platforms", "pricing mismatch").
- Moat map: list where compounding can happen (e.g., "tight ICP community", "unique content POV").
- Notes: brutally honest 3–6 sentence guidance.
`.trim();

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
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

    const parsed = JSON.parse(raw) as GrowthMasterbrainOutput;

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Growth Masterbrain error:", error);
    return NextResponse.json(
      { error: "Failed to compute growth masterbrain output" },
      { status: 500 }
    );
  }
}
