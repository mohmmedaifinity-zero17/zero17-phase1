// src/lib/builder/server/patchHistory.ts

import type { BuilderProject } from "../types";

export type PatchType =
  | "spec"
  | "architecture"
  | "tests"
  | "scan"
  | "refactor"
  | "docs"
  | "manual";

export type PatchEntry = {
  id: string;
  type?: PatchType;
  description?: string;
  before?: any;
  after?: any;
  createdAt: string;
  label?: string;
  note?: string;
  author?: string;
  snapshot?: Partial<BuilderProject>;
};

export function createPatch(
  type: PatchType,
  description: string,
  before: any,
  after: any
): PatchEntry {
  return {
    id: `patch_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    type,
    description,
    before,
    after,
    createdAt: new Date().toISOString(),
  };
}

export function applyRollback(patches: PatchEntry[], patchId: string): any {
  const patch = patches.find((p) => p.id === patchId);
  if (!patch) throw new Error("Patch not found");
  return patch.before;
}
