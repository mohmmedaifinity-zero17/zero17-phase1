// src/app/api/builder/projects/[id]/proofpack/route.ts

import { NextResponse } from "next/server";
import { getUserIdOrDev } from "@/lib/builder/server/auth";
import { devListProjects } from "@/lib/builder/server/store";
import JSZip from "jszip";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const { userId } = await getUserIdOrDev();
  const projectId = ctx.params.id;

  const projects = devListProjects(userId);
  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // ─────────────────────────────────────────────
  // Build Proof Pack contents
  // ─────────────────────────────────────────────

  const zip = new JSZip();

  zip.file(
    "build_contract.json",
    JSON.stringify(
      {
        id: project.id,
        title: project.title,
        description: project.description,
        build_type: project.build_type,
        status: project.status,
        created_at: project.created_at,
        updated_at: project.updated_at,
      },
      null,
      2
    )
  );

  zip.file(
    "scan_report.json",
    JSON.stringify(project.scan_report_json ?? {}, null, 2)
  );

  zip.file(
    "refactor_summary.json",
    JSON.stringify(project.test_plan_json ?? {}, null, 2)
  );

  zip.file(
    "diagnostics.json",
    JSON.stringify(project.diagnostics_json ?? {}, null, 2)
  );

  zip.file(
    "ledger.json",
    JSON.stringify(
      {
        frozen: project.frozen ?? false,
        freezeReason: project.freezeReason ?? "",
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    )
  );

  zip.file(
    "README.md",
    `# Zero17 Proof Pack

Project: ${project.title}
Build Type: ${project.build_type}
Status: ${project.status}

## What is this?
This Proof Pack certifies that the build was generated, scanned,
validated, and exported by Zero17 Builder Lab.

## Included Files
- build_contract.json
- scan_report.json
- refactor_summary.json
- diagnostics.json
- ledger.json

## Generated At
${new Date().toISOString()}
`
  );

  const buffer = await zip.generateAsync({ type: "arraybuffer" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="zero17-proofpack-${project.id}.zip"`,
    },
  });
}
