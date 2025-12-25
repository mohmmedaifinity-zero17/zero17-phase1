// src/app/api/launch/gtm/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { audience, offer } = await req.json();

  const plan = {
    headline: "Ship like a pro, even if you’re solo.",
    positioning:
      audience && offer
        ? `For ${audience}, this launch focuses on positioning ${offer} as the fastest path from idea to results, with Zero17 doing the heavy lifting.`
        : "Position your product as the clearest, fastest path to your audience’s desired outcome, not just another tool.",
    channels: [
      "Twitter/X launch thread + 3 follow-up posts",
      "LinkedIn founder story post + carousel",
      "Indie Hackers launch post with build log",
      "Email to existing list with 'before/after' story",
    ],
    next7Days: [
      "Day 1: Launch post on 2 core channels + pin them.",
      "Day 2–3: Collect reactions, screenshot wins, reply to every comment.",
      "Day 4: Share a behind-the-scenes build story.",
      "Day 5–6: Ship a small improvement & talk about it publicly.",
      "Day 7: Publish a 'Week 1 numbers' recap post.",
    ],
  };

  return NextResponse.json({ plan }, { status: 200 });
}
