// src/app/api/z17/growth/flywheel/route.ts
import { NextResponse } from "next/server";

type NodeKey =
  | "acquisition"
  | "activation"
  | "value"
  | "retention"
  | "referral";

type NodeState = {
  strength: number;
  note?: string;
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { mode, nodes } = body as {
    mode?: "diagnose" | "infinite";
    nodes?: Record<NodeKey, NodeState>;
  };

  const weakNodes: NodeKey[] = [];
  if (nodes) {
    (Object.keys(nodes) as NodeKey[]).forEach((k) => {
      if (nodes[k].strength < 35) weakNodes.push(k);
    });
  }

  const diagnosis =
    weakNodes.length === 0
      ? "Your flywheel looks balanced. The next move is to stress-test one loop with a 7-day experiment."
      : `Your weakest stages are ${weakNodes.join(
          ", "
        )}. Strengthen these before pouring more traffic into acquisition.`;

  const experiments =
    mode === "infinite"
      ? [
          "Introduce a built-in sharing moment right after the first value moment.",
          "Reward users who invite 3+ friends with an upgraded feature or credit.",
          "Design a habit loop that brings users back 3 times in the first week.",
        ]
      : [
          "Improve activation with a guided checklist for new users.",
          "Clarify the value moment with one ‘wow’ action and animation.",
        ];

  const risks =
    weakNodes.length > 0
      ? [
          "Spending on ads before fixing activation will cause high churn.",
          "A weak referral node means you are missing compounding effects.",
        ]
      : [];

  return NextResponse.json({
    ok: true,
    diagnosis,
    experiments,
    risks,
  });
}
