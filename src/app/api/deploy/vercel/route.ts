import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { projectName = "zero17-app" } = await req.json().catch(() => ({}));
    const ts = new Date().toISOString();
    return NextResponse.json({
      status: "ok",
      message: `Deployment triggered for ${projectName} (stub)`,
      previewUrl: `https://${projectName}.vercel.app`,
      logs: [
        `[${ts}] ✓ Build started`,
        `[${ts}] ✓ Dependencies installed`,
        `[${ts}] ✓ Compiled with 0 errors`,
        `[${ts}] ✓ Uploaded artifacts`,
        `[${ts}] ✓ Deployed to preview URL`,
      ],
      meta: { branch: "main", commit: "stub-abcdef", region: "iad1" },
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", error: err?.message ?? "unknown" },
      { status: 500 }
    );
  }
}
