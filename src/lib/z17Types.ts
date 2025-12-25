// src/lib/z17Types.ts

export type Z17ProjectStatus =
  | "draft"
  | "building"
  | "launched"
  | "growing"
  | "archived";

export type Z17ProjectKind = "mvp" | "agent" | "internal";

export type Z17Project = {
  id: string;
  name: string;
  kind: Z17ProjectKind;
  idea_summary: string | null;
  blueprint: any | null;
  status: Z17ProjectStatus;
  created_at: string;
  updated_at: string;
};

export type Z17QaRunStatus = "pending" | "running" | "passed" | "failed";

export type Z17QaRun = {
  id: string;
  project_id: string | null;
  label: string | null;
  status: Z17QaRunStatus;
  score: number | null;
  report: any | null;
  created_at: string;
};

export type Z17LedgerEntryType =
  | "qa"
  | "launch"
  | "proof_pack"
  | "agent_promotion";

export type Z17LedgerEntry = {
  id: string;
  project_id: string | null;
  entry_type: Z17LedgerEntryType;
  payload: any | null;
  hash: string | null;
  created_at: string;
};
