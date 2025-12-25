// src/app/api/helix/next-move/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type HelixMove = {
  label: string;
  href: string;
  reason: string;
};

type HelixResponse = {
  mode: string;
  headline: string;
  summary: string;
  moves: HelixMove[];
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const mode = (body.mode as string) || "validating";

  let response: HelixResponse;

  if (mode === "growing") {
    response = {
      mode,
      headline: "Today: lock your offer + run one experiment.",
      summary:
        "Growth OS is strongest when you have one clear offer and one experiment at a time. Let's set those up now.",
      moves: [
        {
          label: "Define ICP & offers",
          href: "/growth/offer",
          reason:
            "Without a sharp ICP and offer, all campaigns and content are noise.",
        },
        {
          label: "Pick a playbook",
          href: "/growth/plays",
          reason:
            "Choose one pattern (e.g. Typedream-style launch, solo services, newsletter) for the next 14–30 days.",
        },
        {
          label: "Design a performance plan",
          href: "/growth/performance",
          reason:
            "Translate the offer into campaigns, experiments and metrics you can track.",
        },
        {
          label: "Turn progress into public proof",
          href: "/growth/social",
          reason:
            "Ship one public post per day so people can see you're moving.",
        },
      ],
    };
  } else if (mode === "launching") {
    response = {
      mode,
      headline: "Next: Preflight → Proof Pack → HyperLaunch.",
      summary:
        "You're close to a credible launch. Let's validate, wrap the build in proof, then run HyperLaunch.",
      moves: [
        {
          label: "Run Founder Radar",
          href: "/launch",
          reason:
            "Check tech, market, business and risk in one preflight pass.",
        },
        {
          label: "Generate Proof Pack",
          href: "/launch/proof-pack",
          reason:
            "Create an artifact that tells the story of what you actually shipped.",
        },
        {
          label: "Simulate HyperLaunch",
          href: "/launch/hyperlaunch",
          reason:
            "Preview the full automated launch rail before you run it live.",
        },
      ],
    };
  } else if (mode === "building") {
    response = {
      mode,
      headline: "Clarify one feature, then run Build Factory.",
      summary:
        "Focus on one build lane: pick a variant, run QA, and create a Proof-of-Work step.",
      moves: [
        {
          label: "Arena & Build Factory",
          href: "/builder/arena",
          reason: "Pick Speed vs Strategic and run QA on the scaffold.",
        },
        {
          label: "Save as a project",
          href: "/builder/projects",
          reason:
            "Capture your progress so Launch and Growth can attach to this build.",
        },
      ],
    };
  } else {
    // validating / default
    response = {
      mode: "validating",
      headline: "Start with a sharp blueprint.",
      summary:
        "Before building, make sure the idea has a clear user, problem and path to proof.",
      moves: [
        {
          label: "Open Research Lab",
          href: "/lab",
          reason:
            "Describe the idea, gather evidence and generate a blueprint PDF.",
        },
        {
          label: "Score & stress-test",
          href: "/lab/score",
          reason:
            "Check risk, opportunity, TTFV and churn risk before writing code.",
        },
      ],
    };
  }

  return NextResponse.json(response, { status: 200 });
}
