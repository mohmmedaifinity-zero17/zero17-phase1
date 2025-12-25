// src/app/api/growth/monetization/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { openai } from "@/lib/openai";
import type {
  GrowthMasterbrainInput,
  GrowthMasterbrainOutput,
  MonetizationPlan,
} from "@/lib/growth/types";

export async function POST(req: Request) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      input: GrowthMasterbrainInput;
      masterbrain: GrowthMasterbrainOutput | null;
    };

    const systemPrompt = `
You are the Monetization Foundry inside Zero17 Growth OS.

Goal:
- Design a pragmatic, high-trust monetization plan for an early-stage founder.
- No fantasy pricing; focus on fast validation and cash-flow.

Return ONLY JSON with this TypeScript shape:

type MonetizationPlan = {
  headline: string;
  summary: string;
  plays: {
    id: string;
    label: string;
    description: string;
    pricingShape: string;
    targetSegment: string;
    pros: string[];
    cons: string[];
    whenToUse: string;
  }[];
  launchSequence: {
    step: number;
    title: string;
    details: string;
  }[];
  guardrails: string[];
};

Rules:
- 2–3 monetization plays max.
- Plays must be realistic for a solo/lean founder.
- Guardrails should prevent over-complication and discount addiction.
`.trim();

    const userPrompt = `
Founder context:
- Product type: ${body.input.productType}
- ICP: ${body.input.icpDescription}
- Price point: ${body.input.pricePoint}
- Stage: ${body.input.currentStage}
- Current MRR: ${body.input.currentMRR ?? "unknown"}
- Time per week: ${body.input.timePerWeekHours}h
- Budget/month: ${body.input.budgetPerMonth}
- Skills: ${body.input.skills.join(", ") || "not specified"}
- Constraints: ${body.input.constraints}

Growth Masterbrain:
- Primary engine: ${body.masterbrain?.primaryEngine ?? "unknown"}
- Secondary engine: ${body.masterbrain?.secondaryEngine ?? "none"}
- Archetype: ${body.masterbrain?.growthArchetype.label ?? "unknown"}
- North star: ${body.masterbrain?.northStarMetric ?? "unknown"}
- Weekly target: ${body.masterbrain?.weeklyTarget ?? "unknown"}

Design monetization that helps this founder get to real revenue without building a giant pricing machine.
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

    const parsed = JSON.parse(raw) as MonetizationPlan;
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Monetization Foundry error:", err);
    return NextResponse.json(
      { error: "Failed to compute monetization plan" },
      { status: 500 }
    );
  }
}
