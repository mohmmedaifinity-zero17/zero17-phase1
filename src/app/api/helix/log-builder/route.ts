// src/app/api/helix/log-builder/route.ts
import { NextResponse } from "next/server";
import { logHelixEventServer } from "@/lib/helix/logServer";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const {
      type,
      projectName,
      phase,
      headline,
      summary,
    }: {
      type?: "spec" | "blueprint";
      projectName?: string;
      phase?: string;
      headline?: string;
      summary?: string;
    } = body;

    const kind =
      type === "blueprint" ? "builder_blueprint" : ("builder_spec" as const);

    const title =
      headline ||
      (type === "blueprint"
        ? `Builder: Phase 0 blueprint${projectName ? ` for ${projectName}` : ""}`
        : `Builder: Spec${projectName ? ` for ${projectName}` : ""}`);

    const nextMoveSummary =
      type === "blueprint"
        ? "Ship this Phase 0 blueprint into a real build, then get one real user using it before expanding scope."
        : "Finalize this spec, cut anything that doesn’t serve Phase 0, then move to blueprint and implementation.";

    await logHelixEventServer({
      source: "builder",
      kind,
      title,
      summary:
        summary ||
        `Builder ${type || "spec"} for ${projectName || "unnamed project"}${
          phase ? ` · Phase: ${phase}` : ""
        }.`,
      nextMoveSummary,
      metadata: {
        projectName: projectName || null,
        phase: phase || null,
        type: type || "spec",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("log-builder helix route error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to log builder event to Helix." },
      { status: 500 }
    );
  }
}
