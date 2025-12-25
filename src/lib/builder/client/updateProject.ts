// src/lib/builder/client/updateProject.ts

export type CanonicalArtifactKey =
  | "spec_json"
  | "architecture_json"
  | "api_json"
  | "ui_json"
  | "ops_json"
  | "docs_json"
  | "diagnostics_json"
  | "export_plan_json"
  | "test_plan_json"; // ✅ added

type UpdateProjectArgs = {
  projectId: string;

  // Optional: status/freeze controls
  status?: string;
  frozen?: boolean;
  freezeReason?: string;

  // Artifacts (recommended way)
  artifacts?: Partial<Record<CanonicalArtifactKey, any>>;

  // Optional advanced domains
  branding?: any;
  agents?: any;

  // For patch history + debugging
  meta?: {
    module?: string;
    note?: string;
    actor?: string; // "user" | "system"
  };
};

export async function updateProject(args: UpdateProjectArgs) {
  const { projectId, ...body } = args;

  const res = await fetch(`/api/builder/projects/${projectId}/patch`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error("updateProject failed:", res.status, json);
    throw new Error(json?.error || "Failed to update project");
  }

  return json; // { project, patch?, touchedArtifacts? }
}
