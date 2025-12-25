// src/app/api/builder/tests/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { BuilderProject } from "@/lib/builder/types";
import {
  generateTestPlan,
  runVirtualTests,
  summarizeTestPlan,
} from "@/lib/builder/test-engine";

type Body = { projectId: string };

export async function POST(req: Request) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  const { data: projectData, error: projectError } = await supabase
    .from("builder_projects")
    .select("*")
    .eq("id", body.projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (projectError) {
    console.error("[POST /api/builder/tests] fetch error:", projectError);
    return NextResponse.json(
      { error: "Failed to load project" },
      { status: 500 }
    );
  }
  if (!projectData) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const project = projectData as BuilderProject;

  const basePlan = generateTestPlan({
    spec: (project.spec_json as any) ?? null,
    architecture: (project.architecture_json as any) ?? null,
  });

  const executedPlan = runVirtualTests({
    plan: basePlan,
    architecture: (project.architecture_json as any) ?? null,
  });

  const summary = summarizeTestPlan(executedPlan);

  const { data: updated, error: updateError } = await supabase
    .from("builder_projects")
    .update({
      test_plan_json: executedPlan,
      status: "tested",
    })
    .eq("id", project.id)
    .select("*")
    .maybeSingle();

  if (updateError || !updated) {
    console.error("[POST /api/builder/tests] update error:", updateError);
    return NextResponse.json(
      { error: "Failed to save test plan" },
      { status: 500 }
    );
  }

  await supabase.from("builder_runs").insert({
    project_id: project.id,
    phase: "test",
    status: summary.fail > 0 ? "failed" : "success",
    meta_json: { summary, coverageAreas: executedPlan.coverageAreas },
  });

  return NextResponse.json(
    { project: updated as BuilderProject, testPlan: executedPlan, summary },
    { status: 200 }
  );
}
