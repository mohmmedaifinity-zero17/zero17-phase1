// src/lib/builder/types.ts

import type { PatchEntry } from "./server/patchHistory";
export type { PatchEntry };

export type { DocsPack } from "./docs-pack";

export type BuilderBuildType = "app" | "agent" | "dashboard" | "workflow";

export type AgentMode = "draft" | "shadow" | "production";

export type AgentEmployee = {
  id: string;
  name: string;
  role: string;
  objective: string;
  mode: AgentMode;
  createdAt: string;
  updatedAt: string;
  // Optional: model/tool config later
  config?: Record<string, any>;
  // Shadow evaluation / production readiness notes
  signals?: {
    shadowRuns?: number;
    passRate?: number;
    lastRunAt?: string;
    notes?: string;
  };
};

export type BrandingOverrides = {
  theme?: "midnight" | "aurora" | "sunrise" | "mono";
  appName?: string;
  tagline?: string;
  logoDataUrl?: string; // base64 data URL (fast dev; later we move to storage)
};

export type TestCaseStatus =
  | "not_run"
  | "pass"
  | "fail"
  | "virtual_fail"
  | "virtual_pass";
export type TestCaseArea =
  | "happy_path"
  | "edge_case"
  | "failure"
  | "performance";
export type TestCaseRisk = "low" | "medium" | "high";

export type TestCase = {
  id: string;
  title: string;
  description: string;
  area: TestCaseArea;
  risk: TestCaseRisk;
  status: TestCaseStatus;
  notes: string;
  lastRunAt: string;
};

export type TestPlan = {
  summary: string;
  coverageAreas: string[];
  cases: TestCase[];
};

export type DiagnosticSeverity = "info" | "warning" | "error";

export type DiagnosticItem = {
  id: string;
  area: string;
  severity: DiagnosticSeverity;
  symptom: string;
  likelyCause: string;
  suggestedFix: string;
};

export type DiagnosticsReport = {
  summary: string;
  items: DiagnosticItem[];
};

export type ExportFile = {
  path: string;
  kind: "layout" | "page" | "schema" | "infra" | "config" | "test" | "doc";
  description: string;
};

export type ExportPlan = {
  summary: string;
  fileTree?: Array<{ path: string; purpose: string }>;
  files?: ExportFile[];
  commands?: string[];
  notes?: string[];
  cliNotes?: string[];
  stackHint?: string;
};

export type DeploymentPlan = {
  target: string;
  envVars: Array<{ key: string; required: boolean; hint: string }>;
  steps: Array<{ id: string; title: string; detail: string }>;
  smokeChecks: string[];
  rollback: string[];
  summary: string;
};

export type BuilderProject = {
  id: string;
  user_id: string;

  title: string;
  description?: string;
  kind?: BuilderBuildType;

  status: string; // "draft" | "building" | "locked" etc

  created_at: string;
  updated_at: string;

  // Freeze mode (stability lock)
  frozen?: boolean;
  freezeReason?: string;

  // Canonical artifacts (existing fields in your app)
  spec_json?: any;
  architecture_json?: any;
  test_plan_json?: TestPlan | null;
  scan_report_json?: any;
  api_json?: any;
  ui_json?: any;
  ops_json?: any;
  docs_json?: any;
  docs_pack_json?: any;
  deployment_plan_json?: any;
  diagnostics_json?: any;
  export_plan_json?: any;

  // NEW (safe optional)
  patches?: PatchEntry[];
  agents?: AgentEmployee[];
  branding?: BrandingOverrides;
  ledger?: any[];
};
