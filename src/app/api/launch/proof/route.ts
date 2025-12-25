import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const now = new Date().toISOString();

  const pack = {
    meta: {
      projectName: "zero17-sample-project",
      variant: "strategic",
      generatedAt: now,
      version: "pow-pack-v2",
    },
    buildStory: {
      summary: "A founder OS that compresses idea → build → launch → growth.",
      what: "A web app that orchestrates research, building, testing, launch and growth.",
      why: "Solo founders need leverage and structure without hiring a full team.",
      how: "Next.js, Supabase, AI agents and curated playbooks wired into one OS.",
      future:
        "Layer in multi-tenant SaaS, team modes and integrations with more tools.",
    },
    architecture: {
      components: [
        "Next.js app router",
        "Supabase DB",
        "Builder factory",
        "Launch engine",
        "Growth OS",
      ],
      dataFlow: ["Client → API routes → Supabase → external APIs"],
      risks: [
        "Heavy dependency on AI APIs: monitor cost and latency.",
        "Need proper auth/permissions for multi-user scenario.",
      ],
    },
    visuals: {
      heroPrompt:
        "Minimalist dark/light hero section for a founder operating system dashboard, clean, futuristic, high contrast.",
      collagePrompt:
        "Four-panel collage of research lab, builder, launch, and growth dashboards in a modern UI.",
      diagramPrompt:
        "Architecture diagram showing client, Next.js app router, Supabase and external AI APIs with arrows.",
    },
    founderCard: {
      id: "founder-0001",
      launches: 1,
      xpLevel: "Zero17: Apprentice Builder",
    },
  };

  return NextResponse.json(pack, { status: 200 });
}
