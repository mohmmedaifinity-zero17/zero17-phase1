// src/app/api/builder/cockpit/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { BuilderProject } from "@/lib/builder/types";
import { computeCockpitMetrics } from "@/lib/builder/cockpit-metrics";

type PostBody = {
  projectId: string;
};

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

  let body: PostBody;
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
    console.error(
      "[POST /api/builder/cockpit] project fetch error:",
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
  const metrics = computeCockpitMetrics(project);

  return NextResponse.json(metrics, { status: 200 });
}
