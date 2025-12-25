// src/app/api/growth/performance/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const product =
    (body.product as string)?.trim() ||
    "an AI-powered founder operating system";
  const icp =
    (body.icp as string)?.trim() || "solo founders shipping SaaS / AI tools";
  const budget = Number(body.budget ?? 500);
  const primaryChannel = (body.primaryChannel as string) || "meta";
  const horizon = (body.horizon as string) || "30";

  const primaryChannelName =
    primaryChannel === "google"
      ? "Google / Search"
      : primaryChannel === "linkedin"
        ? "LinkedIn"
        : primaryChannel === "youtube"
          ? "YouTube"
          : "Meta (FB/IG)";

  const plan = {
    summary: `Performance plan for ${product} targeting ${icp}. Focus on one primary channel (${primaryChannelName}) with clear experiments over ${horizon} days.`,
    budgetHint: `$${budget} test budget → treat this as 'tuition' for learning, not guaranteed ROI.`,
    horizon: `${horizon} days`,
    channels: [
      {
        name: primaryChannelName,
        role: "Primary acquisition channel for cold and warm traffic.",
        budgetSplit: `${Math.round(budget * 0.6)}$ (~60%)`,
      },
      {
        name: "Retargeting (same platform)",
        role: "Follow-up on people who visited key pages but did not convert.",
        budgetSplit: `${Math.round(budget * 0.25)}$ (~25%)`,
      },
      {
        name: "Organic / social",
        role: "Daily posts to support paid tests and build trust.",
        budgetSplit: `${Math.round(budget * 0.15)}$ (~15% equivalent effort)`,
      },
    ],
    campaigns: [
      {
        name: "Core Pain Campaign",
        objective: "Drive qualified traffic to a simple landing page.",
        audience: `Cold ${icp} with strong problem-first messaging.`,
        creatives: [
          "Short UGC-style video: founder talking about the main pain in 30s.",
          "Carousel: before/after screenshots of life without vs with your product.",
          "Text-only ad with a sharp promise and clear CTA.",
        ],
      },
      {
        name: "Warm Retargeting Campaign",
        objective: "Convert visitors who hit the site but did not sign up.",
        audience:
          "People who visited pricing or 'Get started' pages in last 14 days.",
        creatives: [
          "Testimonial-focused ad if you have proof (or 'simulated' story for now).",
          "Side-by-side comparison vs 'doing it manually'.",
        ],
      },
    ],
    experiments: [
      {
        name: "Hook comparison: Time vs Money vs Status",
        hypothesis:
          "One core angle (time saved, money made/saved, or status/future identity) will dramatically outperform the others for this ICP.",
        setup:
          "Create 3 creative variants, each focusing on one core hook. Keep everything else identical (image, CTA, targeting).",
        metric: "Click-through rate and cost per qualified visit.",
        timeline:
          "7–10 days or until each variant has at least 500 impressions.",
        decisionRule:
          "Turn off the loser angles and double spend on the winner for the next 2 weeks.",
      },
      {
        name: "Offer comparison: Trial vs Done-For-You",
        hypothesis:
          "A small done-for-you component may convert better than pure self-serve.",
        setup:
          "Test a '14-day guided setup' CTA vs a standard self-serve signup CTA.",
        metric: "Conversion rate from landing page visit to signup/demo.",
        timeline: "14 days or ~200–300 landing page visits per variant.",
        decisionRule:
          "If DFY converts 2x better with reasonable effort, lean into 'guided' offer for early customers.",
      },
    ],
    metricsToWatch: [
      "CTR for each core hook (time/money/status).",
      "CPC and cost per qualified visit.",
      "Landing page conversion rate.",
      "Number of conversations or demos started per week.",
    ],
  };

  return NextResponse.json(plan, { status: 200 });
}
