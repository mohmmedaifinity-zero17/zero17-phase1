// src/app/api/builder/projects/[id]/actions/route.ts

import { NextResponse } from "next/server";
import { getUserIdOrDev } from "@/lib/builder/server/auth";
import { devFindProject } from "@/lib/builder/server/store";
import { runBuildFactoryV3 } from "@/lib/builder/server/buildFactoryV3";
import { generateProofPackZip } from "@/lib/builder/server/proofPack";

export const dynamic = "force-dynamic";

export async function POST(req: Request, ctx: { params: { id: string } }) {
  const { userId } = await getUserIdOrDev();
  const projectId = ctx.params.id;
  const body = await req.json().catch(() => ({}));

  const project = devFindProject(userId, projectId);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (project.frozen && body.action !== "proofpack") {
    return NextResponse.json(
      { error: "Build is frozen. Only Proof Pack allowed." },
      { status: 423 }
    );
  }

  // BUILD FACTORY v3
  if (body.action === "tests") {
    const code = JSON.stringify(project.spec_json || {});
    const report = runBuildFactoryV3(code);

    return NextResponse.json({ ok: true, result: report }, { status: 200 });
  }

  // PROOF PACK ZIP
  if (body.action === "proofpack") {
    const zip = await generateProofPackZip(project, body.buildReport);

    return new NextResponse(zip, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename=zero17-proofpack-${project.id}.zip`,
      },
    });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
