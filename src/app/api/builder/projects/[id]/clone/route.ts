// src/app/api/builder/projects/[id]/clone/route.ts
import { NextResponse } from "next/server";
import { getUserIdOrDev } from "@/lib/builder/server/auth";
import {
  devFindProject,
  devCreateProject,
  devUpdateProject,
} from "@/lib/builder/server/store";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, ctx: { params: { id: string } }) {
  const { userId } = await getUserIdOrDev();
  const id = ctx.params.id;

  try {
    const source = devFindProject(userId, id);
    if (!source) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const project = devCreateProject({
      userId,
      title: `${source.title} (Copy)`,
      description: source.description,
      kind: source.kind,
    });

    // Copy artifacts
    const cloned = devUpdateProject(userId, project.id, {
      spec_json: source.spec_json,
      architecture_json: source.architecture_json,
      api_json: source.api_json,
      ui_json: source.ui_json,
      ops_json: source.ops_json,
      docs_json: source.docs_json,
      diagnostics_json: source.diagnostics_json,
      export_plan_json: source.export_plan_json,
      test_plan_json: source.test_plan_json,
      deployment_plan_json: source.deployment_plan_json,
      scan_report_json: source.scan_report_json,
      docs_pack_json: source.docs_pack_json,
    });

    return NextResponse.json({ project: cloned }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Failed to fork project" },
      { status: 500 }
    );
  }
}
