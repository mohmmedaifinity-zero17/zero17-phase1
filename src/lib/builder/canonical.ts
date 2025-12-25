// src/lib/builder/canonical.ts
import type { BuilderProject } from "@/lib/builder/types";

export type CanonicalArtifact = {
  id: string;
  label: string;
  description: string;
  isReady: (project: BuilderProject | null) => boolean;
  hint?: (project: BuilderProject | null) => string;
};

export const CANONICAL: CanonicalArtifact[] = [
  {
    id: "spec",
    label: "Spec",
    description: "The product spec: goals, audience, scope, constraints.",
    isReady: (p) => !!(p as any)?.spec_json,
    hint: () => "Run Phase 1: Spec to generate spec_json.",
  },
  {
    id: "architecture",
    label: "Architecture",
    description: "System design: modules, data, flows, APIs.",
    isReady: (p) => !!(p as any)?.architecture_json,
    hint: () => "Run Phase 2: Architecture to generate architecture_json.",
  },
  {
    id: "tests",
    label: "Test Plan",
    description: "Build Factory test plan and expected checks.",
    isReady: (p) => !!(p as any)?.test_plan_json,
    hint: () => "Run Build Factory to generate test_plan_json.",
  },
  {
    id: "security",
    label: "Security Scan",
    description: "Static scan findings and remediation notes.",
    isReady: (p) => !!(p as any)?.scan_report_json,
    hint: () => "Run Security Scan to generate scan_report_json.",
  },
  {
    id: "deploy",
    label: "Deploy Plan",
    description: "Deployment checklist and environment plan.",
    isReady: (p) => !!(p as any)?.deployment_plan_json,
    hint: () => "Run Deploy Plan to generate deployment_plan_json.",
  },
  {
    id: "docs",
    label: "Docs Pack",
    description: "README + runbooks + usage + architecture notes.",
    isReady: (p) => !!(p as any)?.docs_pack_json,
    hint: () => "Run Phase 9: Docs to generate docs_pack_json.",
  },
  {
    id: "diagnostics",
    label: "Diagnostics",
    description: "Truth Ledger diagnostics and issues list.",
    isReady: (p) => !!(p as any)?.diagnostics_json,
    hint: () => "Run Phase 10: Diagnostics to generate diagnostics_json.",
  },
];

export function canonicalCounts(project: BuilderProject | null) {
  const total = CANONICAL.length;
  const ready = CANONICAL.reduce(
    (acc, a) => acc + (a.isReady(project) ? 1 : 0),
    0
  );
  const missing = total - ready;
  const pct = total === 0 ? 0 : Math.round((ready / total) * 100);
  return { total, ready, missing, pct };
}

export function truthLedgerCounts(project: BuilderProject | null) {
  const ledger = (project as any)?.ledger;

  let scanIssues = 0;
  let diagItems = 0;
  let applied = 0;
  let improved = 0;

  // If ledger is an array of events
  if (Array.isArray(ledger)) {
    for (const e of ledger) {
      const type = String(e?.type ?? "").toLowerCase();
      if (type.includes("scan")) scanIssues += 1;
      else if (type.includes("diag")) diagItems += 1;
      else if (type.includes("fix") || type.includes("patch")) applied += 1;
      else if (type.includes("improv") || type.includes("confirm"))
        improved += 1;
    }
    return { scanIssues, diagItems, applied, improved };
  }

  // If ledger is an object summary
  if (ledger && typeof ledger === "object") {
    scanIssues = Number((ledger as any).scanIssues ?? 0) || 0;
    diagItems = Number((ledger as any).diagItems ?? 0) || 0;
    applied = Number((ledger as any).applied ?? 0) || 0;
    improved = Number((ledger as any).improved ?? 0) || 0;
  }

  return { scanIssues, diagItems, applied, improved };
}
