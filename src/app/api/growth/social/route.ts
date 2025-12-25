// src/app/api/growth/social/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { update } = await req.json();

  const base =
    (update as string)?.trim() ||
    "Shipped a new iteration of my MVP inside Zero17 today.";

  const payload = {
    linkedin: `Today inside Zero17: ${base}\n\nWhat this means:\n• One more concrete step from idea → revenue\n• Less time stuck planning, more time shipping\n\nIf you're a solo founder trying to move faster, this is your reminder: small, verified moves > big, vague plans.`,
    twitter: `${base} — shipped inside Zero17.\n\nShip > think.\nProof > promises.`,
    thread: [
      base,
      "1/ Most founders overestimate what they can do in a week and underestimate what they can do in 3 focused months.",
      "2/ My rule with Zero17: every day → at least one move that produces proof (not just more notes).",
      "3/ If you want this kind of 'builder OS' instead of scattered tools, DM me 'ZERO17' and I'll show you how I'm using it.",
    ],
  };

  return NextResponse.json(payload, { status: 200 });
}
