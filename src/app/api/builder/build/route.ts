// src/app/api/builder/build/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { BuilderProject } from "@/lib/builder/types";

type MultiLensSpec = any;
type ArchitectureMap = any;
import {
  generateProjectScaffold,
  writeGeneratedProject,
} from "@/lib/builder/codegen";

export const runtime = "nodejs";

type PostBody = {
  projectId: string;
};

export async function POST(req: Request) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1) Auth
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2) Parse body
  let body: PostBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  const { projectId } = body;

  // 3) Load project with spec + architecture
  const { data: projectData, error: projectError } = await supabase
    .from("builder_projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (projectError) {
    console.error(
      "[POST /api/builder/build] project fetch error:",
      projectError
    );
    return NextResponse.json(
      { error: "Failed to load project" },
      { status: 500 }
    );
  }

  if (!projectData) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const project = projectData as BuilderProject;

  if (!project.spec_json) {
    return NextResponse.json(
      {
        error:
          "Multi-Lens Spec missing. Generate and save the spec before running the Build Engine.",
      },
      { status: 400 }
    );
  }

  if (!project.architecture_json) {
    return NextResponse.json(
      {
        error:
          "Architecture Map missing. Generate and refine architecture before running the Build Engine.",
      },
      { status: 400 }
    );
  }

  // 4) Run scaffold generator
  let files;
  try {
    files = generateProjectScaffold(
      project,
      project.spec_json as MultiLensSpec,
      project.architecture_json as ArchitectureMap
    );
  } catch (err) {
    console.error("[POST /api/builder/build] codegen error:", err);
    return NextResponse.json(
      { error: "Code generation failed" },
      { status: 500 }
    );
  }

  // 5) Write to /generated/{projectId}
  let writeResult;
  try {
    writeResult = await writeGeneratedProject(project.id, files);
  } catch (err) {
    console.error(
      "[POST /api/builder/build] writeGeneratedProject error:",
      err
    );
    return NextResponse.json(
      { error: "Failed to write generated project to disk" },
      { status: 500 }
    );
  }

  // 6) Update project status → built
  const { error: updateError } = await supabase
    .from("builder_projects")
    .update({
      status: "built",
      // keep spec_json & architecture_json as-is
    })
    .eq("id", project.id);

  if (updateError) {
    console.error("[POST /api/builder/build] update error:", updateError);
  }

  // 7) Log builder run
  await supabase.from("builder_runs").insert({
    project_id: project.id,
    phase: "codegen_v1",
    status: "success",
    meta_json: {
      generatedRoot: writeResult.rootDir,
      fileCount: writeResult.fileCount,
    },
  });

  // 8) Respond with summary
  return NextResponse.json(
    {
      ok: true,
      projectId: project.id,
      status: "built",
      generatedRoot: writeResult.rootDir,
      fileCount: writeResult.fileCount,
      files: files.map((f) => f.path),
    },
    { status: 200 }
  );
}
