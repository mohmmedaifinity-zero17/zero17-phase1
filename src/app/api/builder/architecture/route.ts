// src/app/api/builder/architecture/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server"; // adjust if needed
import type {
  BuilderProject,
  BuilderBuildType,
  MultiLensSpec,
  ArchitectureMap,
  ArchitectureScreen,
  ArchitectureEntity,
  ArchitectureApi,
  ArchitectureInfra,
} from "@/lib/builder/types";

type GenerateBody = {
  mode: "generate";
  projectId: string;
};

type SaveBody = {
  mode: "save";
  projectId: string;
  architecture: ArchitectureMap;
};

type PostBody = GenerateBody | SaveBody;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const projectId = url.searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("builder_projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[GET /api/builder/architecture] error:", error);
    return NextResponse.json(
      { error: "Failed to load project" },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const project = data as BuilderProject;

  return NextResponse.json(project.architecture_json ?? null);
}

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

  // Ensure project belongs to user
  const { data: projectData, error: projectError } = await supabase
    .from("builder_projects")
    .select("*")
    .eq("id", body.projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (projectError) {
    console.error(
      "[POST /api/builder/architecture] project fetch error:",
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

  if (body.mode === "generate") {
    // Need spec to generate architecture
    if (!project.spec_json) {
      return NextResponse.json(
        {
          error:
            "Spec not found. Generate or load Multi-Lens Spec before generating architecture.",
        },
        { status: 400 }
      );
    }

    const spec = project.spec_json as MultiLensSpec;
    const arch = generateStubArchitecture(
      spec,
      project.build_type,
      project.title
    );

    const { error: updateError } = await supabase
      .from("builder_projects")
      .update({
        architecture_json: arch,
        // we don't yet mark as 'built'; this is still structured phase
        status: project.status === "draft" ? "structured" : project.status,
      })
      .eq("id", project.id);

    if (updateError) {
      console.error(
        "[POST /api/builder/architecture] update error:",
        updateError
      );
      return NextResponse.json(
        { error: "Failed to save architecture" },
        { status: 500 }
      );
    }

    await supabase.from("builder_runs").insert({
      project_id: project.id,
      phase: "architecture",
      status: "success",
      meta_json: {
        source: "from_spec",
      },
    });

    return NextResponse.json(arch, { status: 201 });
  }

  if (body.mode === "save") {
    const { architecture } = body as SaveBody;

    const { error: updateError } = await supabase
      .from("builder_projects")
      .update({
        architecture_json: architecture,
        status: project.status === "draft" ? "structured" : project.status,
      })
      .eq("id", project.id);

    if (updateError) {
      console.error(
        "[POST /api/builder/architecture] save update error:",
        updateError
      );
      return NextResponse.json(
        { error: "Failed to save architecture" },
        { status: 500 }
      );
    }

    await supabase.from("builder_runs").insert({
      project_id: project.id,
      phase: "architecture",
      status: "success",
      meta_json: {
        source: "manual_edit",
      },
    });

    return NextResponse.json(architecture, { status: 200 });
  }

  return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
}

/**
 * Stub architecture generator:
 * later you can replace with a real LLM or planner.
 */
function generateStubArchitecture(
  spec: MultiLensSpec,
  buildType: BuilderBuildType,
  projectTitle: string
): ArchitectureMap {
  const baseScreens: ArchitectureScreen[] = [
    {
      id: "home",
      name: "Home",
      purpose: "Entry dashboard with key information",
    },
  ];

  if (
    buildType === "app" ||
    buildType === "dashboard" ||
    buildType === "client_project"
  ) {
    baseScreens.push(
      {
        id: "primary",
        name: "Primary Object List",
        purpose:
          "List and filter main domain objects described by the idea (e.g., projects, tasks, content pieces).",
      },
      {
        id: "settings",
        name: "Settings",
        purpose: "User profile, preferences, and basic configuration.",
      }
    );
  }

  if (buildType === "landing") {
    baseScreens.push({
      id: "landing",
      name: "Landing",
      purpose: "High-conversion landing page with CTA.",
    });
  }

  if (buildType === "agent") {
    baseScreens.push({
      id: "agent_console",
      name: "Agent Console",
      purpose:
        "Monitor and guide the Agent Employee, view logs and manual overrides.",
    });
  }

  // Entities: derive from spec architect lens entities
  const baseEntities: ArchitectureEntity[] = [
    {
      name: "User",
      fields: [
        { name: "id", type: "uuid" },
        { name: "email", type: "text" },
        { name: "name", type: "text", nullable: true },
        { name: "createdAt", type: "timestamptz" },
      ],
    },
  ];

  const extraEntities: ArchitectureEntity[] =
    spec.architectLens.entities
      .filter((e) => e.name.toLowerCase() !== "user")
      .map<ArchitectureEntity>((e) => ({
        name: e.name || "PrimaryObject",
        fields: [
          { name: "id", type: "uuid" },
          { name: "userId", type: "uuid" },
          { name: "title", type: "text" },
          { name: "data", type: "jsonb", nullable: true },
          { name: "createdAt", type: "timestamptz" },
        ],
      })) || [];

  const entities = [...baseEntities, ...extraEntities];

  const apis: ArchitectureApi[] = [
    {
      name: "GetPrimaryObjects",
      method: "GET",
      path: "/api/primary-objects",
      summary: "List main domain records for current user.",
    },
    {
      name: "CreatePrimaryObject",
      method: "POST",
      path: "/api/primary-objects",
      summary: "Create a new main domain record.",
    },
  ];

  const infra: ArchitectureInfra = {
    database: "Postgres",
    hosting: "Vercel",
    authProvider: "NextAuth",
    billingProvider:
      buildType === "app" || buildType === "client_project" ? "Stripe" : null,
    queue: null,
  };

  return {
    screens: baseScreens,
    entities,
    apis,
    infra,
  };
}
