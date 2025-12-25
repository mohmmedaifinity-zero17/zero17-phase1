// src/app/api/z17/growth/plan/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}) as any);
  const goal = (body.goal as string) || "Leads";
  const icp = (body.icp as string) || "your ideal customers";
  const offer = (body.offer as string) || "your core offer";
  const budget = Number(body.budget) || 500;
  const metric = (body.metric as string) || "Cost per lead";

  const perDay = Math.max(Math.round(budget / 7), 100);

  const baseChannels = ["LinkedIn", "X", "Email", "Retargeting"];

  const plan = [
    {
      day: 1,
      title: "Clarify offer + ICP in public",
      summary: `Post a simple thread clarifying who ${offer} is for (${icp}), what painful problem it solves and why it's different. Invite 3–5 quick replies or DMs.`,
      channels: ["LinkedIn", "X"],
      metric: "Profile visits / replies",
    },
    {
      day: 2,
      title: "Landing page + tracking ready",
      summary:
        "Ship a stripped landing page with one promise, one CTA and basic analytics/UTM tracking. Do not over-design; focus on message and form.",
      channels: ["Landing page"],
      metric: "Bounce rate & form completion rate",
    },
    {
      day: 3,
      title: `Warm traffic test (₹${perDay.toLocaleString("en-IN")} budget)`,
      summary: `Run a small retargeting or lookalike test sending warmer audiences to the new page. Use one clarity angle and one bold angle only.`,
      channels: ["Meta Ads", "Google"],
      metric,
    },
    {
      day: 4,
      title: "Qualitative calls with early clicks",
      summary:
        "Invite people who clicked or engaged to a short call. Ask what made them click, what almost stopped them, and what they would need to say yes.",
      channels: ["Email", "DM"],
      metric: "Number of calls booked",
    },
    {
      day: 5,
      title: "Angle + page refinement",
      summary:
        "Refine headline, hero copy and call-to-action based on day-4 calls. Update at least one above-the-fold screenshot or proof element.",
      channels: ["Landing page"],
      metric: "Improvement in conversion rate",
    },
    {
      day: 6,
      title: `Colder prospect test (₹${perDay.toLocaleString("en-IN")} budget)`,
      summary: `Run 2–3 ad sets focused on ${goal.toLowerCase()} with the new angles. Keep structures simple. Kill obvious losers quickly.`,
      channels: ["Meta Ads", "Google"],
      metric,
    },
    {
      day: 7,
      title: "Sprint review + next experiment",
      summary:
        "Review which angles, audiences and channels worked best. Lock one winning combo and define the next 7-day experiment focused on a single bottleneck.",
      channels: baseChannels,
      metric: "One chosen next experiment with clear target",
    },
  ];

  return NextResponse.json(
    {
      ok: true,
      plan,
    },
    { status: 200 }
  );
}
