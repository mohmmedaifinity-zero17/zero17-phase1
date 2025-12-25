// src/app/api/growth/loops/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { openai } from "@/lib/openai";
import type {
  GrowthMasterbrainInput,
  GrowthMasterbrainOutput,
  LoopDesignPlan,
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
You are the Loop Builder inside Zero17.

Goal:
- Design 1–2 simple growth loops that a solo/lean founder can actually implement.
- A loop is not a buzzword; it's a repeatable "input -> activation -> value -> output/referral" system.

Return ONLY JSON with this shape:

type LoopDesignPlan = {
  headline: string;
  loops: {
    id: string;
    name: string;
    narrative: string;
    nodes: {
      id: string;
      label: string;
      role: "input" | "activation" | "value" | "output" | "referral";
      description: string;
    }[];
    riskNotes: string[];
  }[];
  implementationSteps: {
    step: number;
    title: string;
    details: string;
  }[];
};

Rules:
- Prefer 1 great loop over 3 weak ones.
- Use the founder's primary engine (e.g. outbound, PLG, content) as the backbone.
- Call out risks and failure points honestly.
`.trim();

    const userPrompt = `
Founder context:
- Product type: ${body.input.productType}
- ICP: ${body.input.icpDescription}
- Stage: ${body.input.currentStage}
- Time per week: ${body.input.timePerWeekHours}h
- Budget/month: ${body.input.budgetPerMonth}
- Constraints: ${body.input.constraints}

Growth Masterbrain:
- Primary engine: ${body.masterbrain?.primaryEngine ?? "unknown"}
- Secondary engine: ${body.masterbrain?.secondaryEngine ?? "none"}
- Archetype: ${body.masterbrain?.growthArchetype.label ?? "unknown"}

Design loops that help this founder turn effort into compounding results, not just one-off campaigns.
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

    const parsed = JSON.parse(raw) as LoopDesignPlan;
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Loop Builder error:", err);
    return NextResponse.json(
      { error: "Failed to compute loop design" },
      { status: 500 }
    );
  }
}
