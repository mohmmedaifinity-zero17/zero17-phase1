// src/app/api/growth/objections/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { openai } from "@/lib/openai";
import type {
  GrowthMasterbrainInput,
  GrowthMasterbrainOutput,
  ObjectionPlaybook,
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
You are the Objection Engine inside Zero17 Growth OS.

Goal:
- Anticipate the 8–12 most common objections this founder will hear in DMs, calls, and emails.
- Provide sharp, honest rebuttals and proof ideas.

Return ONLY JSON with this shape:

type ObjectionPlaybook = {
  headline: string;
  summary: string;
  objections: {
    id: string;
    objection: string;
    severity: "low" | "medium" | "high";
    rebuttal: string;
    proofIdeas: string[];
  }[];
  fieldScripts: string[];
};

Rules:
- Rebuttals must sound like a calm, confident founder, not a pushy bro marketer.
- ProofIdeas should suggest testimonials, mini case studies, screenshots, before/after, etc.
- Field scripts should be 1–2 sentence lines the founder can literally paste or say.
`.trim();

    const userPrompt = `
Founder context:
- Product type: ${body.input.productType}
- ICP: ${body.input.icpDescription}
- Price point: ${body.input.pricePoint}
- Stage: ${body.input.currentStage}
- Constraints: ${body.input.constraints}

Growth Masterbrain:
- Primary engine: ${body.masterbrain?.primaryEngine ?? "unknown"}
- Archetype: ${body.masterbrain?.growthArchetype.label ?? "unknown"}

Design objections and answers that match THIS product and ICP, not generic sales talk.
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

    const parsed = JSON.parse(raw) as ObjectionPlaybook;
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Objection Engine error:", err);
    return NextResponse.json(
      { error: "Failed to compute objection playbook" },
      { status: 500 }
    );
  }
}
