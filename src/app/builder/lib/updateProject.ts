// src/app/builder/lib/updateProject.ts
import type { BuilderProject } from "@/lib/builder/types";

export async function updateProject(
  projectId: string,
  patch: Record<string, any>
): Promise<BuilderProject> {
  const res = await fetch(`/api/builder/projects/${projectId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    // ✅ UI hardening: never silent-fail
    console.error("Project update failed:", res.status, json);
    throw new Error(json?.error || "Failed to update project");
  }

  const project = json?.project as BuilderProject | undefined;
  if (!project) throw new Error("PATCH did not return { project }");

  return project;
}
