// src/lib/builder/types.ts

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

export type PatchEntry = {
  id: string;
  label: string;
  note: string;
  createdAt: string;
  author: string;
  snapshot: Partial<BuilderProject>;
};

export type ExportFile = {
  path: string;
  kind: string;
  description: string;
  purpose?: string;
};

export type ExportPlan = {
  summary: string;
  stackHint?: string;
  files?: ExportFile[];
  fileTree?: any[];
  commands?: string[];
  cliNotes?: string[];
  notes?: string[];
  refinements?: any[];
  patches?: any[];
  locked_fixes?: any[];
};

export type DeploymentStep = {
  id: string;
  category?: string;
  title: string;
  description?: string;
  detail?: string;
};

export type DeploymentPlan = {
  target: string;
  envVars?: Array<{
    key: string;
    required: boolean;
    hint: string;
  }>;
  steps?: DeploymentStep[];
  smokeChecks?: string[];
  rollback?: string[];
  summary: string;
};

export type TestCase = {
  id: string;
  title: string;
  description: string;
  area: string;
  risk: string;
  status: string;
  lastRunAt: string;
  notes?: string;
};

export type TestPlan = {
  summary: string;
  coverageAreas?: string[];
  cases: TestCase[];
};

export type DiagnosticItem = {
  id: string;
  area: string;
  severity: "error" | "warning" | "info";
  symptom: string;
  likelyCause: string;
  suggestedFix: string;
  roi?: number;
  priority?: number;
  minutes?: number;
  phase?: string;
};

export type DiagnosticsReport = {
  summary: string;
  items: DiagnosticItem[];
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
  api_json?: any;
  ui_json?: any;
  ops_json?: any;
  docs_json?: any;
  diagnostics_json?: any;
  export_plan_json?: any;
  test_plan_json?: TestPlan;
  deployment_plan_json?: DeploymentPlan;
  scan_report_json?: any;
  docs_pack_json?: any;

  // NEW (safe optional)
  patches?: PatchEntry[];
  agents?: AgentEmployee[];
  branding?: BrandingOverrides;
};
