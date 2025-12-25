// src/app/api/growth/plays/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { segment } = await req.json();

  const plays =
    segment === "newsletter"
      ? [
          {
            id: "beehiiv-style",
            name: "Newsletter Engine",
            inspiredBy: "Beehiiv / Morning Brew",
            timeline: "30 days",
            steps: [
              "Define 1 sharp topic edge instead of generic 'AI + business'.",
              "Publish 3 high-value issues before asking for signups.",
              "Launch a simple referral reward (shoutout / resource).",
            ],
            metrics: ["New subscribers", "Open rate", "Referral count"],
          },
        ]
      : segment === "solo"
        ? [
            {
              id: "solo-services",
              name: "Solo Builder Pipeline",
              inspiredBy: "High-end solo consultants",
              timeline: "21 days",
              steps: [
                "Define 1 core service (e.g. 'MVP in 10 days' or 'Agent employee setup').",
                "Publish a public case-study (even if simulated / internal).",
                "DM 50 hand-picked prospects with a concrete outcome offer.",
              ],
              metrics: [
                "Conversations started",
                "Proposals sent",
                "Deals closed",
              ],
            },
          ]
        : segment === "community"
          ? [
              {
                id: "community-cohort",
                name: "Cohort Community Launch",
                inspiredBy: "On Deck / specialized cohorts",
                timeline: "30 days",
                steps: [
                  "Pick one intense outcome (e.g. 'ship an MVP' or 'get first 5 users').",
                  "Recruit 10–20 'founding members' personally.",
                  "Run weekly live sessions and daily small accountability prompts.",
                ],
                metrics: ["Active members", "Completion rate", "NPS"],
              },
            ]
          : [
              {
                id: "typedream-style",
                name: "Product Hunt + Creator Launch",
                inspiredBy: "Typedream / Framer",
                timeline: "14 days",
                steps: [
                  "Collect a small group of early creators who will use the product pre-launch.",
                  "Prepare a strong PH page with social proof and crisp visuals.",
                  "Coordinate launch-day support across time zones and channels.",
                ],
                metrics: [
                  "Signups day 1",
                  "Activation rate",
                  "Retention after 14 days",
                ],
              },
            ];

  return NextResponse.json({ playbooks: plays }, { status: 200 });
}
