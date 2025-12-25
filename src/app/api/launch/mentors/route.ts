// src/app/api/launch/mentors/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    {
      mentors: [
        {
          role: "CTO",
          summary: "Tech stack looks sane but observability is thin.",
          bullets: [
            "Add basic logging & error tracking before launch.",
            "Set up a simple uptime check on the main endpoint.",
            "Plan a safe rollback path for the first 7 days.",
          ],
        },
        {
          role: "CMO",
          summary: "Positioning is strong but distribution is under-specified.",
          bullets: [
            "Pick 1–2 core channels for the first month rather than 5.",
            "Add 2 concrete proof points to your landing hero.",
            "Design a simple 'Day 1 → Day 7' launch rhythm.",
          ],
        },
        {
          role: "Product",
          summary: "MVP scope is tight; onboarding needs clarity.",
          bullets: [
            "Remove 1 optional feature that confuses first-time users.",
            "Add a simple 3-step welcome checklist.",
            "Define what 'success' means for a user’s first session.",
          ],
        },
        {
          role: "Legal",
          summary: "No obvious red flags, but data policy is very light.",
          bullets: [
            "Write a plain-language privacy section on your landing page.",
            "Document what data you collect and for how long.",
            "If using 3rd-party APIs, double-check their ToS for resale limits.",
          ],
        },
      ],
    },
    { status: 200 }
  );
}
