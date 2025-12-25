// src/app/api/growth/autopilot/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { openai } from "@/lib/openai";
import type {
  GrowthMasterbrainInput,
  GrowthMasterbrainOutput,
  GrowthDNAPlan,
  GrowthSprintPlan,
  GrowthSnapshot,
  PulseEvent,
  MonetizationPlan,
  LoopDesignPlan,
  ObjectionPlaybook,
  DominionAutopilotResult,
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

    const { input } = (await req.json()) as {
      input: GrowthMasterbrainInput;
    };

    // 1) Masterbrain
    const masterbrainSystem = `
You are Growth Masterbrain for Zero17.
Return ONLY JSON:

type GrowthMasterbrainOutput = {
  primaryEngine: "outbound" | "organic-content" | "referrals" | "paid" | "product-led" | "community";
  secondaryEngine: "outbound" | "organic-content" | "referrals" | "paid" | "product-led" | "community" | null;
  growthArchetype: {
    id: string;
    label: string;
    description: string;
    famousExamples: string[];
  };
  northStarMetric: string;
  weeklyTarget: string;
  commentary: string;
};
`.trim();

    const masterbrainUser = `
Founder context:
- Product type: ${input.productType}
- ICP: ${input.icpDescription}
- Price point: ${input.pricePoint}
- Stage: ${input.currentStage}
- Current MRR: ${input.currentMRR ?? "unknown"}
- Time/week: ${input.timePerWeekHours}h
- Budget/month: ${input.budgetPerMonth}
- Skills: ${input.skills.join(", ") || "not specified"}
- Constraints: ${input.constraints}
`.trim();

    const mbRes = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: masterbrainSystem },
        { role: "user", content: masterbrainUser },
      ],
    });
    const mbRaw =
      mbRes.output[0] &&
      "content" in mbRes.output[0] &&
      Array.isArray(mbRes.output[0].content) &&
      mbRes.output[0].content[0] &&
      "type" in mbRes.output[0].content[0] &&
      mbRes.output[0].content[0].type === "output_text" &&
      "text" in mbRes.output[0].content[0]
        ? mbRes.output[0].content[0].text
        : null;
    if (!mbRaw) {
      throw new Error("Masterbrain response invalid");
    }
    const masterbrain = JSON.parse(mbRaw) as GrowthMasterbrainOutput;

    // 2) DNA
    const dnaSystem = `
You are Growth DNA Engine for Zero17.
Return ONLY JSON of:

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
`.trim();

    const dnaUser = `
Use founder context and this Growth Masterbrain to pick 2–3 archetypes and create a 7-day micro-play:

${JSON.stringify({ input, masterbrain })}
`.trim();

    const dnaRes = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: dnaSystem },
        { role: "user", content: dnaUser },
      ],
    });
    const dnaRaw =
      dnaRes.output[0] &&
      "content" in dnaRes.output[0] &&
      Array.isArray(dnaRes.output[0].content) &&
      dnaRes.output[0].content[0] &&
      "type" in dnaRes.output[0].content[0] &&
      dnaRes.output[0].content[0].type === "output_text" &&
      "text" in dnaRes.output[0].content[0]
        ? dnaRes.output[0].content[0].text
        : null;
    if (!dnaRaw) {
      throw new Error("DNA response invalid");
    }
    const dna = JSON.parse(dnaRaw) as GrowthDNAPlan;

    // 3) Sprint
    const sprintSystem = `
You are Zero17 Sprint Engine.
Return ONLY JSON:

type GrowthSprintPlan = {
  sprintName: string;
  sprintDurationDays: number;
  theme: string;
  tasks: {
    id: string;
    label: string;
    category: string;
    estimatedImpact: "low" | "medium" | "high";
    effort: "low" | "medium" | "high";
    dayOfWeek: string;
    notes?: string;
  }[];
  nonGoals: string[];
  guardrails: string[];
};
`.trim();

    const sprintUser = `
Based on founder context, Growth Masterbrain and Growth DNA sevenDayPlan, design a focused sprint:

${JSON.stringify({ input, masterbrain, dna })}
`.trim();

    const sprintRes = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: sprintSystem },
        { role: "user", content: sprintUser },
      ],
    });
    const sprintRaw =
      sprintRes.output[0] &&
      "content" in sprintRes.output[0] &&
      Array.isArray(sprintRes.output[0].content) &&
      sprintRes.output[0].content[0] &&
      "type" in sprintRes.output[0].content[0] &&
      sprintRes.output[0].content[0].type === "output_text" &&
      "text" in sprintRes.output[0].content[0]
        ? sprintRes.output[0].content[0].text
        : null;
    if (!sprintRaw) {
      throw new Error("Sprint response invalid");
    }
    const sprint = JSON.parse(sprintRaw) as GrowthSprintPlan;

    // 4) Snapshot + default Pulse events
    const snapshotSystem = `
You are Growth Snapshot + Pulse initializer for Zero17.

Return ONLY JSON:

type SnapshotAndPulse = {
  snapshot: {
    buildStageLabel: string;
    growthTemperature: "cold" | "warming" | "hot";
    riskFlags: string[];
    strengths: string[];
    focusNarrative: string;
  };
  pulseDefaults: {
    id: string;
    type: "metric_change" | "user_story" | "experiment" | "good_news" | "bad_news";
    title: string;
    detail: string;
    impact: "positive" | "negative" | "neutral";
    createdAt: string;
  }[];
};
`.trim();

    const snapshotUser = `
Given all context (founder input, masterbrain, dna, sprint), initialize a realistic snapshot and a few starter pulse events:

${JSON.stringify({ input, masterbrain, dna, sprint })}
`.trim();

    const snapRes = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: snapshotSystem },
        { role: "user", content: snapshotUser },
      ],
    });
    const snapRaw =
      snapRes.output[0] &&
      "content" in snapRes.output[0] &&
      Array.isArray(snapRes.output[0].content) &&
      snapRes.output[0].content[0] &&
      "type" in snapRes.output[0].content[0] &&
      snapRes.output[0].content[0].type === "output_text" &&
      "text" in snapRes.output[0].content[0]
        ? snapRes.output[0].content[0].text
        : null;
    if (!snapRaw) {
      throw new Error("Snapshot response invalid");
    }
    const snapParsed = JSON.parse(snapRaw) as {
      snapshot: GrowthSnapshot;
      pulseDefaults: PulseEvent[];
    };
    const snapshot = snapParsed.snapshot;
    const pulseDefaults = snapParsed.pulseDefaults;

    // 5) Monetization
    const monetizationSystem = `
You are Monetization Foundry for Zero17.
Return ONLY JSON of MonetizationPlan.
`.trim();

    const monetizationUser = `
Use founder input and masterbrain to design monetization:

${JSON.stringify({ input, masterbrain })}
`.trim();

    const monRes = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: monetizationSystem },
        { role: "user", content: monetizationUser },
      ],
    });
    const monRaw =
      monRes.output[0] &&
      "content" in monRes.output[0] &&
      Array.isArray(monRes.output[0].content) &&
      monRes.output[0].content[0] &&
      "type" in monRes.output[0].content[0] &&
      monRes.output[0].content[0].type === "output_text" &&
      "text" in monRes.output[0].content[0]
        ? monRes.output[0].content[0].text
        : null;
    if (!monRaw) {
      throw new Error("Monetization response invalid");
    }
    const monetization = JSON.parse(monRaw) as MonetizationPlan;

    // 6) Loops
    const loopsSystem = `
You are Loop Builder for Zero17.
Return ONLY JSON of LoopDesignPlan.
`.trim();

    const loopsUser = `
Use founder input and masterbrain to design 1–2 loops:

${JSON.stringify({ input, masterbrain })}
`.trim();

    const loopsRes = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: loopsSystem },
        { role: "user", content: loopsUser },
      ],
    });
    const loopsRaw =
      loopsRes.output[0] &&
      "content" in loopsRes.output[0] &&
      Array.isArray(loopsRes.output[0].content) &&
      loopsRes.output[0].content[0] &&
      "type" in loopsRes.output[0].content[0] &&
      loopsRes.output[0].content[0].type === "output_text" &&
      "text" in loopsRes.output[0].content[0]
        ? loopsRes.output[0].content[0].text
        : null;
    if (!loopsRaw) {
      throw new Error("Loops response invalid");
    }
    const loops = JSON.parse(loopsRaw) as LoopDesignPlan;

    // 7) Objections
    const objectionsSystem = `
You are Objection Engine for Zero17.
Return ONLY JSON of ObjectionPlaybook.
`.trim();

    const objectionsUser = `
Use founder input and masterbrain to design objection playbook:

${JSON.stringify({ input, masterbrain })}
`.trim();

    const objRes = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: objectionsSystem },
        { role: "user", content: objectionsUser },
      ],
    });
    const objRaw =
      objRes.output[0] &&
      "content" in objRes.output[0] &&
      Array.isArray(objRes.output[0].content) &&
      objRes.output[0].content[0] &&
      "type" in objRes.output[0].content[0] &&
      objRes.output[0].content[0].type === "output_text" &&
      "text" in objRes.output[0].content[0]
        ? objRes.output[0].content[0].text
        : null;
    if (!objRaw) {
      throw new Error("Objections response invalid");
    }
    const objections = JSON.parse(objRaw) as ObjectionPlaybook;

    const payload: DominionAutopilotResult = {
      masterbrain,
      dna,
      sprint,
      snapshot,
      pulseDefaults,
      monetization,
      loops,
      objections,
    };

    return NextResponse.json(payload);
  } catch (err) {
    console.error("Dominion Autopilot error:", err);
    return NextResponse.json(
      { error: "Failed to run Dominion Autopilot" },
      { status: 500 }
    );
  }
}
