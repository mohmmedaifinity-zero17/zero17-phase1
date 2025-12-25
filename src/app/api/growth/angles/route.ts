// src/app/api/growth/angles/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const baseText =
    (body.baseText as string)?.trim() ||
    "Zero17 helps solo founders go from idea to launch with proof.";
  const contextType = (body.contextType as string) || "generic";

  const angles = [
    {
      label: "Time-poor Operator",
      description:
        "Focus on the founder who has more ideas than hours and wants leverage, not more tools.",
      tone: "calm, confident, operations-obsessed",
      hooks: [
        "Ship in hours, not quarters.",
        "Your ideas deserve a faster pipeline than Google Docs.",
      ],
      assets: [
        {
          type: "linkedin",
          example: `If you're a solo founder drowning in 'strategy' docs but shipping slowly, ${baseText}\n\nOne rail, one decision at a time.`,
        },
        {
          type: "tweet",
          example: `I don't need more ideas.\nI need fewer clicks between idea → proof.\n\nThat's why I built: ${baseText}`,
        },
      ],
    },
    {
      label: "Future-CEO Identity",
      description:
        "Appeal to the version of the user who wants to be the calm CEO, not the frantic executor.",
      tone: "aspirational, direct, slightly cinematic",
      hooks: [
        "Operate like you'll have a team of 20 — even when it's just you.",
        "Leave chaos to your competitors.",
      ],
      assets: [
        {
          type: "linkedin",
          example: `The next generation of CEOs won't be the loudest.\nThey'll be the ones who can turn ideas into proof quietly and relentlessly.\n\n${baseText}`,
        },
        {
          type: "tweet",
          example: `New play for future CEOs:\n\n1. Write less\n2. Ship more\n3. Let proof speak\n\n${baseText}`,
        },
      ],
    },
    {
      label: "Anti-Agency Rebel",
      description:
        "Position against bloated agencies and complex stacks; champion lean, in-control builders.",
      tone: "slightly spicy, anti-bloat, pro-owner",
      hooks: [
        "Replace 3 agencies and 12 tools with one builder OS.",
        "Stop paying retainers for decks instead of results.",
      ],
      assets: [
        {
          type: "linkedin",
          example: `If you're paying an agency to 'own your strategy' but still refreshing dashboards yourself...\n\nTry a different model:\n${baseText}`,
        },
        {
          type: "tweet",
          example: `Agencies sell you slides.\nBuilders sell you proof.\n\n${baseText}`,
        },
      ],
    },
  ];

  return NextResponse.json(
    {
      contextType,
      baseText,
      angles,
    },
    { status: 200 }
  );
}
