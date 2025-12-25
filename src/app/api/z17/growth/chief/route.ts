// src/app/api/z17/growth/chief/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type ChiefRequest = {
  goal?: string;
  icp?: string;
  offer?: string;
  budget?: number;
  metric?: string;
  hasAngles?: boolean;
  hasPlan?: boolean;
};

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as ChiefRequest;

  const goal = body.goal || "Leads";
  const icp = body.icp || "your ideal customers";
  const offer = body.offer || "your offer";
  const budget = body.budget ?? 0;
  const metric = body.metric || "Cost per lead";
  const hasAngles = !!body.hasAngles;
  const hasPlan = !!body.hasPlan;

  let nextMove = "";
  let why = "";
  const steps: string[] = [];
  const agentTasks: {
    role: string;
    task: string;
    priority: "now" | "later";
  }[] = [];

  if (!hasAngles) {
    nextMove = "Lock 3 winning angles before spending more.";
    why =
      "Without strong creative angles, paid performance will just amplify weak messaging. Clarifying this is the highest-leverage move.";
    steps.push(
      "Use Performance Lab → Ad angle workspace to write your best hook.",
      "Click “Make this 10× better (Angle Mutator)” and pick one clarity and one bold angle.",
      "Update your landing hero to match the chosen angle."
    );
    agentTasks.push(
      {
        role: "Growth Copy Agent",
        task: "Rewrite landing hero and primary ad copy using the selected clarity angle.",
        priority: "now",
      },
      {
        role: "Brand Agent",
        task: "Update screenshots / visuals to prove the promise behind the new angle.",
        priority: "later",
      }
    );
  } else if (!hasPlan) {
    nextMove = "Run a single 7-day experiment, not 10 random tests.";
    why =
      "You already have angles. Now you need a small, focused experiment to understand performance against one core metric.";
    steps.push(
      "Use Performance Lab → Generate 7-day performance plan with a realistic test budget.",
      `Lock a daily budget (e.g., ${Math.max(
        Math.round((budget || 500) / 7),
        100
      )}₹/day) and do not change it mid-sprint.`,
      `Set one metric as the sprint target: “${metric}”.`
    );
    agentTasks.push(
      {
        role: "Performance Agent",
        task: `Create and schedule the 7-day sprint in your ad accounts focusing on the single metric: ${metric}.`,
        priority: "now",
      },
      {
        role: "Analytics Agent",
        task: "Prepare a simple daily dashboard showing spend, impressions, clicks, leads and the main metric.",
        priority: "now",
      }
    );
  } else {
    nextMove = "Double down on the best-performing angle & channel combo.";
    why =
      "You already have angles and a sprint plan. The next compounding win is to lock in what is working and cut everything else.";
    steps.push(
      "From your sprint, identify the top-performing angle + channel pair.",
      "Turn this into your primary evergreen campaign.",
      "Design the next 7-day experiment to fix a single funnel bottleneck (e.g., landing CVR, call show-up rate)."
    );
    agentTasks.push(
      {
        role: "Performance Agent",
        task: "Pause underperforming ad sets and scale budget 20–30% on the winning combo while monitoring the main metric.",
        priority: "now",
      },
      {
        role: "Funnel Ops Agent",
        task: "Propose one change to the landing or follow-up sequence to improve the weakest step in the funnel.",
        priority: "later",
      }
    );
  }

  const narrative = `Goal: ${goal}. ICP: ${icp}. Offer: ${offer}. Test budget: ₹${
    budget || 0
  }. Main metric: ${metric}.`;

  return NextResponse.json(
    {
      ok: true,
      contextSummary: narrative,
      nextMove,
      why,
      steps,
      agentTasks,
    },
    { status: 200 }
  );
}
