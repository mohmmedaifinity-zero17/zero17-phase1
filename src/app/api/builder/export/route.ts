import { NextResponse } from "next/server";
import type {
  BuilderProject,
  ExportPlan,
  ExportFile,
} from "@/lib/builder/types";
import {
  loadProjectOrRes,
  updateProjectOrRes,
} from "@/app/api/builder/_project";

type PostBody = { projectId: string };

function buildExportPlan(project: BuilderProject): ExportPlan {
  const arch = project.architecture_json as any;

  const stackPieces: string[] = ["Next.js 14 (app router)"];
  if (arch?.infra?.database) stackPieces.push(arch.infra.database);
  if (arch?.infra?.hosting) stackPieces.push(arch.infra.hosting);
  if (arch?.infra?.authProvider)
    stackPieces.push(`${arch.infra.authProvider} Auth`);

  const stackHint = stackPieces.join(" + ");
  const files: ExportFile[] = [
    {
      path: "app/layout.tsx",
      kind: "layout",
      description: "Global layout shell.",
    },
    {
      path: "app/page.tsx",
      kind: "page",
      description: "Root landing / dashboard.",
    },
    {
      path: "app/(app)/builder/page.tsx",
      kind: "page",
      description: "Builder Lab main page.",
    },
    {
      path: "lib/supabase/server.ts",
      kind: "infra",
      description: "Supabase server helper.",
    },
    {
      path: "lib/supabase/client.ts",
      kind: "infra",
      description: "Supabase client helper.",
    },
    { path: ".env.example", kind: "config", description: "Env template." },
    {
      path: "docs/builder-overview.md",
      kind: "doc",
      description: "Builder Lab overview.",
    },
    {
      path: "docs/deployment-checklist.md",
      kind: "doc",
      description: "Deployment checklist.",
    },
  ];

  const cliNotes: string[] = [
    "1. Copy `.env.example` → `.env.local` and fill keys.",
    "2. npm i",
    "3. npm run dev",
  ];

  return {
    summary: `Export plan for “${project.title}” using ${stackHint}.`,
    stackHint,
    files,
    cliNotes,
  } as any;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!body.projectId)
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });

  const loaded = await loadProjectOrRes({
    projectId: body.projectId,
    caller: "POST /api/builder/export",
  });
  if (loaded.res) return loaded.res;

  const { project, userId, supabase } = loaded;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!project.architecture_json) {
    return NextResponse.json(
      { error: "Architecture Map missing. Complete Phase 2 before export." },
      { status: 400 }
    );
  }

  const plan = buildExportPlan(project);

  const res = await updateProjectOrRes({
    projectId: project.id,
    userId,
    supabase,
    patch: { export_plan_json: plan, status: "export_ready" },
    caller: "POST /api/builder/export",
  });

  return (
    res.res ?? NextResponse.json({ project: res.project }, { status: 200 })
  );
}
