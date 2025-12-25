import { NextRequest, NextResponse } from "next/server";

type Body = { variant: "speed" | "strategic" };

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;
    if (!body?.variant)
      return NextResponse.json({ error: "variant required" }, { status: 400 });

    // simple static checks (stub for Build Factory Lite)
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (body.variant === "speed") {
      suggestions.push("Add email capture form to landing");
      suggestions.push("Wire basic analytics (page view)");
    } else {
      suggestions.push("Enable auth provider (stub present)");
      suggestions.push("Connect Supabase DB client");
    }

    // fake scores deterministic by variant
    const readiness = body.variant === "speed" ? 82 : 76;
    const perf = body.variant === "speed" ? 90 : 80;
    const a11y = 88;
    const security = 75;

    return NextResponse.json(
      {
        readiness,
        checks: { perf, a11y, security },
        warnings,
        suggestions,
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "qa failed" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
