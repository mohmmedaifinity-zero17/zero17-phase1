// src/app/api/helix/log-launch/route.ts
import { NextResponse } from "next/server";
import { logHelixEventServer } from "@/lib/helix/logServer";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const {
      type,
      projectName,
      launchDate,
      primaryChannel,
      summary,
    }: {
      type?: "plan" | "assets";
      projectName?: string;
      launchDate?: string;
      primaryChannel?: string;
      summary?: string;
    } = body;

    const kind = type === "assets" ? "launch_assets" : ("launch_plan" as const);

    const title =
      type === "assets"
        ? `Launch: proof-of-work pack${projectName ? ` for ${projectName}` : ""}`
        : `Launch: plan${projectName ? ` for ${projectName}` : ""}`;

    const nextMoveSummary =
      type === "assets"
        ? "Pick one date, one audience list and one core asset from this pack, and commit to sharing it publicly."
        : "Lock this launch date, define what ‘done’ means, and share the date with at least 3 real humans.";

    await logHelixEventServer({
      source: "launch",
      kind,
      title,
      summary:
        summary ||
        `Launch ${type || "plan"} for ${projectName || "unnamed project"}${
          launchDate ? ` · Date: ${launchDate}` : ""
        }${primaryChannel ? ` · Channel: ${primaryChannel}` : ""}.`,
      nextMoveSummary,
      metadata: {
        projectName: projectName || null,
        launchDate: launchDate || null,
        primaryChannel: primaryChannel || null,
        type: type || "plan",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("log-launch helix route error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to log launch event to Helix." },
      { status: 500 }
    );
  }
}
