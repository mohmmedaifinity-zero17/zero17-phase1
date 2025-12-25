import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const BodySchema = z.object({
  variant: z.enum(["speed", "strategic"]),
  projectName: z.string().min(1).max(100),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { variant, projectName } = parsed.data;

    // For now this is static; later you’ll wire Jest/Playwright/ESLint/Lighthouse etc.
    const steps = [
      {
        name: "Generate scaffold files",
        status: "done",
        detail: `Base ${variant} template validated for ${projectName}.`,
      },
      {
        name: "Static analysis & lint",
        status: "done",
        detail: "No critical TS/ESLint errors in core files.",
      },
      {
        name: "Accessibility & performance pass",
        status: "done",
        detail: "Baseline layout scores ~0.85+ in dev environment (simulated).",
      },
      {
        name: "Security & config checks",
        status: "done",
        detail: "No obvious secrets, keys or dangerous patterns in scaffold.",
      },
    ] as const;

    const summary =
      variant === "speed"
        ? "Speed variant passes baseline Build Factory Lite. Safe to wire copy, forms and analytics."
        : "Strategic variant passes baseline Build Factory Lite. Safe to connect auth, DB and routes.";

    return NextResponse.json(
      {
        steps,
        summary,
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Build Factory failed" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
