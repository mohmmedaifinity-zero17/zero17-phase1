// src/app/api/builder/spec/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server"; // adjust if your helper path differs
import type {
  BuilderProject,
  BuilderBuildType,
  MultiLensSpec,
  FounderLens,
  ArchitectLens,
  QaLens,
  ClientLens,
  AgentLens,
} from "@/lib/builder/types";

type GenerateBody = {
  mode: "generate";
  projectId: string;
  rawIdea: string;
  buildType: BuilderBuildType;
};

type SaveBody = {
  mode: "save";
  projectId: string;
  spec: MultiLensSpec;
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
    console.error("[GET /api/builder/spec] error:", error);
    return NextResponse.json(
      { error: "Failed to load project" },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const project = data as BuilderProject;

  return NextResponse.json(project.spec_json ?? null);
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
      "[POST /api/builder/spec] project fetch error:",
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
    const { rawIdea, buildType } = body as GenerateBody;

    if (!rawIdea || !rawIdea.trim()) {
      return NextResponse.json(
        { error: "rawIdea is required for generate mode" },
        { status: 400 }
      );
    }

    const spec = generateStubSpec(rawIdea, buildType, project.title);

    const { error: updateError } = await supabase
      .from("builder_projects")
      .update({
        spec_json: spec,
        status: "structured",
      })
      .eq("id", project.id);

    if (updateError) {
      console.error("[POST /api/builder/spec] update error:", updateError);
      return NextResponse.json(
        { error: "Failed to save spec" },
        { status: 500 }
      );
    }

    // log run stub
    await supabase.from("builder_runs").insert({
      project_id: project.id,
      phase: "spec",
      status: "success",
      meta_json: {
        source: "raw_idea",
      },
    });

    return NextResponse.json(spec, { status: 201 });
  }

  if (body.mode === "save") {
    const { spec } = body as SaveBody;

    const { error: updateError } = await supabase
      .from("builder_projects")
      .update({
        spec_json: spec,
        status: project.status === "draft" ? "structured" : project.status,
      })
      .eq("id", project.id);

    if (updateError) {
      console.error("[POST /api/builder/spec] save update error:", updateError);
      return NextResponse.json(
        { error: "Failed to save spec" },
        { status: 500 }
      );
    }

    await supabase.from("builder_runs").insert({
      project_id: project.id,
      phase: "spec",
      status: "success",
      meta_json: {
        source: "manual_edit",
      },
    });

    return NextResponse.json(spec, { status: 200 });
  }

  return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
}

/**
 * Stub spec generator for now.
 * Later you can replace this with a real AI call.
 */
function generateStubSpec(
  rawIdea: string,
  buildType: BuilderBuildType,
  projectTitle: string
): MultiLensSpec {
  const trimmedIdea = rawIdea.trim();

  const founderLens: FounderLens = {
    problem: `User wants to build: ${trimmedIdea}`,
    users: ["Primary target user (to refine)", "Secondary stakeholders"],
    coreFlows: [
      "User can sign up/sign in",
      "User can perform the main action described in the idea",
      "User can see a simple dashboard or summary",
    ],
    nonGoals: [
      "Complex enterprise features in v1",
      "Advanced analytics beyond core metrics",
    ],
    successCriteria: [
      "First 10–20 users successfully complete main flow",
      "User can ship MVP in days not weeks",
    ],
  };

  const architectLens: ArchitectLens = {
    entities: [
      {
        name: "User",
        description: "Core identity, auth, and preferences",
      },
      {
        name: "PrimaryObject",
        description:
          "Main record representing what the app manages (customize later)",
      },
    ],
    relationships: [
      "User has many PrimaryObjects",
      "PrimaryObject belongs to User",
    ],
    mainServices: [
      {
        name: "AuthService",
        description: "Sign up, login, password reset",
      },
      {
        name: "CoreDomainService",
        description: "Implements main domain logic of the idea",
      },
    ],
    externalIntegrations: [],
    apis: [
      {
        name: "GetPrimaryObjects",
        path: "/api/primary-objects",
        notes: "List main domain items for current user",
      },
      {
        name: "CreatePrimaryObject",
        path: "/api/primary-objects/new",
        notes: "Create new item for main domain",
      },
    ],
  };

  const qaLens: QaLens = {
    acceptanceTests: [
      {
        id: "auth_basic",
        description:
          "User can create an account, log in, and see the main app screen",
      },
      {
        id: "core_flow",
        description: "User can complete the main action promised by the idea",
      },
    ],
    edgeCases: [
      "Missing fields during main action creation",
      "Network timeouts when saving data",
    ],
    failureModes: ["User cannot log in", "Main action fails silently"],
  };

  const clientLens: ClientLens = {
    whatYouGet: [
      "Initial MVP matching the raw idea at high level",
      "Clean code structure and basic tests for core flows",
      "Deployable app with basic auth and dashboard",
    ],
    whatYouDoNotGet: [
      "Complex multi-tenancy or advanced analytics",
      "Full enterprise security review",
    ],
    roiNarrative:
      "You get a working MVP for " +
      projectTitle +
      " that you can put in front of real users fast.",
    upgradePaths: [
      "Add deeper analytics and reporting once usage stabilizes",
      "Improve UI/UX with polishes based on user feedback",
    ],
  };

  const agentLens: AgentLens | undefined =
    buildType === "agent" || buildType === "dashboard"
      ? {
          agents: [
            {
              name: "Assistant Agent",
              capabilities: [
                "Guide the user through the main flows",
                "Summarize recent activity in the system",
              ],
              escalationRules: [
                "Escalate when user asks about unsupported advanced features",
              ],
              riskLimits: [
                "Must not modify or delete data without explicit confirmation",
              ],
            },
          ],
        }
      : undefined;

  return {
    founderLens,
    architectLens,
    qaLens,
    clientLens,
    agentLens,
  };
}
