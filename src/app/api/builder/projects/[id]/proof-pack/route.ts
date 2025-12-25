// src/app/api/builder/projects/[id]/proof-pack/route.ts

import { NextResponse } from "next/server";
import { getUserIdOrDev } from "@/lib/builder/server/auth";
import { devListProjects } from "@/lib/builder/server/store";
import { buildProofPack } from "@/lib/builder/server/proofPack";

export async function GET(req: Request, ctx: { params: { id: string } }) {
  const { userId } = await getUserIdOrDev();
  const projectId = ctx.params.id;

  const projects = devListProjects(userId);
  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const zip = await buildProofPack(project);

  return new NextResponse(new Uint8Array(zip), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename=zero17-proof-pack-${projectId}.zip`,
    },
  });
}
