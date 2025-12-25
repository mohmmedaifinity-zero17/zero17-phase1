// src/app/api/builder/export/route.ts

import { NextResponse } from "next/server";
import {
  requireUserOrDemo,
  getProjectOrThrow,
} from "@/app/api/builder/_shared";
import type {
  BuilderProject,
  ExportPlan,
  ExportFile,
} from "@/lib/builder/types";

type PostBody = {
  projectId: string;
};

function buildExportPlan(project: BuilderProject): ExportPlan {
  const spec = project.spec_json;
  const arch = project.architecture_json;

  const stackPieces: string[] = ["Next.js 14 (app router)"];
  if (arch?.infra?.database) stackPieces.push(arch.infra.database);
  if (arch?.infra?.hosting) stackPieces.push(arch.infra.hosting);
  if (arch?.infra?.authProvider)
    stackPieces.push(`${arch.infra.authProvider} Auth`);

  const stackHint = stackPieces.join(" + ");

  const files: ExportFile[] = [];

  // Base app shell
  files.push(
    {
      path: "app/layout.tsx",
      kind: "layout",
      description:
        "Global layout with Zero17 Builder chrome, fonts, and theme shell.",
    },
    {
      path: "app/page.tsx",
      kind: "page",
      description:
        "Root landing / dashboard view that routes into the Builder Lab or main app experience.",
    },
    {
      path: "app/(app)/builder/page.tsx",
      kind: "page",
      description:
        "Builder Lab main page wiring to BuilderShell and its sub-components.",
    }
  );

  // Entities → schema + models
  if (arch?.entities?.length) {
    files.push(
      {
        path: "db/schema.ts",
        kind: "schema",
        description:
          "Drizzle / Prisma-style definitions for entities from Architecture Map.",
      },
      {
        path: "lib/models/README.md",
        kind: "doc",
        description:
          "How entities map to tables and where to add custom model logic.",
      }
    );
  }

  // Auth + infra config
  files.push(
    {
      path: "lib/supabase/server.ts",
      kind: "infra",
      description:
        "Supabase server client helper for RLS-safe queries from route handlers.",
    },
    {
      path: "lib/supabase/client.ts",
      kind: "infra",
      description:
        "Supabase browser client helper for auth in client components.",
    },
    {
      path: ".env.example",
      kind: "config",
      description:
        "Environment variable template for Supabase, Vercel, and Builder Lab secrets.",
    }
  );

  // Tests skeleton
  files.push(
    {
      path: "tests/acceptance/builder.spec.ts",
      kind: "test",
      description:
        "Playwright / Vitest hybrid spec wired to the QA Lens test cases.",
    },
    {
      path: "tests/api/health.spec.ts",
      kind: "test",
      description: "Basic health check for API routes and DB connectivity.",
    }
  );

  // Docs
  files.push(
    {
      path: "docs/builder-overview.md",
      kind: "doc",
      description:
        "High-level explanation of Builder Lab, phases 2–9, and how they connect.",
    },
    {
      path: "docs/deployment-checklist.md",
      kind: "doc",
      description:
        "Deployment steps mirror the Deployment Plan JSON for human-readable review.",
    }
  );

  // API surface (only if architecture knows about APIs)
  if (arch?.apis?.length) {
    files.push({
      path: "app/api/README.md",
      kind: "doc",
      description:
        "Index of API routes generated from Architecture Map with notes on handlers.",
    });
  }

  const cliNotes: string[] = [
    "1. Clone the exported repo or pull from the GitHub template.",
    "2. Copy `.env.example` to `.env.local` and fill Supabase + Vercel keys.",
    "3. Run `pnpm install` (or `npm install` / `yarn`) at the root.",
    "4. Run `pnpm dev` to boot the local Next.js app.",
    "5. Run `pnpm test` to execute virtual test shells mapped from QA Lens.",
  ];

  const summary = `Export plan for “${project.title}” using ${stackHint}. This is the file-level blueprint Builder Lab will generate and sync to GitHub / local code.`;

  return {
    summary,
    stackHint,
    files,
    cliNotes,
  };
}

export async function POST(req: Request) {
  const { supabase, userId } = await requireUserOrDemo();

  let body: PostBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  const loaded = await getProjectOrThrow({
    supabase,
    projectId: body.projectId,
    userId,
    caller: "POST /api/builder/export",
  });
  if (loaded.res) return loaded.res;

  const project = loaded.project as BuilderProject;

  if (!project.architecture_json) {
    return NextResponse.json(
      {
        error:
          "Architecture Map missing. Generate and refine architecture before exporting a repo blueprint.",
      },
      { status: 400 }
    );
  }

  const plan = buildExportPlan(project);

  const { error: updateError } = await supabase
    .from("builder_projects")
    .update({ export_plan_json: plan })
    .eq("id", project.id);

  if (updateError) {
    console.error("[POST /api/builder/export] update error:", updateError);
    return NextResponse.json(
      { error: "Failed to save export plan" },
      { status: 500 }
    );
  }

  await supabase.from("builder_runs").insert({
    project_id: project.id,
    phase: "export_plan",
    status: "success",
    meta_json: {
      note: "Export Plan generated from Architecture Map.",
      totalFiles: plan.files?.length ?? 0,
    },
  });

  return NextResponse.json(plan, { status: 200 });
}
