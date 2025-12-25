// src/app/api/growth/offer/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { idea } = await req.json();

  const baseIdea =
    (idea as string)?.trim() || "An AI-powered founder operating system.";

  const result = {
    icp: {
      segment: "Solo founders and tiny teams building software products",
      pains: [
        "Too many tools and docs; no single place to run the business.",
        "Hard to go from idea to shipped product with evidence.",
        "No simple system to track what actually moves revenue.",
      ],
      desiredOutcome:
        "Compress 12–18 months of wandering into a focused 3–6 month sprint to revenue.",
    },
    offers: [
      {
        name: "Launch-Ready MVP",
        description:
          "We help you go from idea to deployed MVP with proof-of-work and launch assets ready.",
        priceHint: "$1,000–$3,000 one-time, depending on scope.",
        promise: "You will have something you can show and charge for.",
      },
      {
        name: "Founder OS Pro",
        description:
          "Ongoing access to the full Zero17 system plus monthly check-ins on builds and growth.",
        priceHint: "$99–$249/month depending on seat count.",
        promise: "You never have to guess what to do next.",
      },
      {
        name: "Agency / Client Builder",
        description:
          "Use Zero17 to deliver MVPs and agents for your own clients with white-label outputs.",
        priceHint: "Custom pricing; per-seat or per-project.",
        promise: "You look 10x more senior to your clients with less effort.",
      },
    ],
    notes: [
      `Input idea: ${baseIdea}`,
      "Start by validating one narrow ICP instead of trying to serve everyone.",
      "Your first real offer should be simple, painful problem → clear outcome → time-bound.",
    ],
  };

  return NextResponse.json(result, { status: 200 });
}
