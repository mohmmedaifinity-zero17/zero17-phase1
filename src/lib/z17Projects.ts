// src/lib/z17Projects.ts
import { supabaseServer } from "@/lib/supabaseServer";
import {
  Z17Project,
  Z17ProjectKind,
  Z17ProjectStatus,
  Z17QaRun,
  Z17LedgerEntry,
  Z17LedgerEntryType,
  Z17QaRunStatus,
} from "./z17Types";
import crypto from "crypto";

export type CreateProjectInput = {
  name: string;
  kind?: Z17ProjectKind;
  ideaSummary?: string;
  blueprint?: any;
  status?: Z17ProjectStatus;
};

export async function createZ17Project(
  input: CreateProjectInput
): Promise<Z17Project> {
  const {
    name,
    kind = "mvp",
    ideaSummary,
    blueprint,
    status = "draft",
  } = input;

  const { data, error } = await supabaseServer
    .from("z17_projects")
    .insert({
      name,
      kind,
      idea_summary: ideaSummary ?? null,
      blueprint: blueprint ?? null,
      status,
    })
    .select("*")
    .single();

  if (error) {
    console.error("createZ17Project error:", error);
    throw new Error(error.message);
  }

  return data as Z17Project;
}

export async function updateZ17ProjectStatus(
  projectId: string,
  status: Z17ProjectStatus
): Promise<Z17Project> {
  const { data, error } = await supabaseServer
    .from("z17_projects")
    .update({ status })
    .eq("id", projectId)
    .select("*")
    .single();

  if (error) {
    console.error("updateZ17ProjectStatus error:", error);
    throw new Error(error.message);
  }

  return data as Z17Project;
}

export type CreateQaRunInput = {
  projectId: string;
  label?: string;
  status?: Z17QaRunStatus;
  score?: number;
  report?: any;
};

export async function createZ17QaRun(
  input: CreateQaRunInput
): Promise<Z17QaRun> {
  const {
    projectId,
    label = "Build Factory Lite QA",
    status = "passed",
    score,
    report,
  } = input;

  const { data, error } = await supabaseServer
    .from("z17_qa_runs")
    .insert({
      project_id: projectId,
      label,
      status,
      score: score ?? null,
      report: report ?? null,
    })
    .select("*")
    .single();

  if (error) {
    console.error("createZ17QaRun error:", error);
    throw new Error(error.message);
  }

  return data as Z17QaRun;
}

export type CreateLedgerEntryInput = {
  projectId: string;
  entryType: Z17LedgerEntryType;
  payload: any;
  hash?: string; // optional; if not provided we compute
};

export async function createZ17LedgerEntry(
  input: CreateLedgerEntryInput
): Promise<Z17LedgerEntry> {
  const { projectId, entryType, payload, hash } = input;

  const jsonPayload = payload ?? {};
  const computedHash =
    hash ??
    crypto
      .createHash("sha256")
      .update(JSON.stringify(jsonPayload))
      .digest("hex");

  const { data, error } = await supabaseServer
    .from("z17_truth_ledger")
    .insert({
      project_id: projectId,
      entry_type: entryType,
      payload: jsonPayload,
      hash: computedHash,
    })
    .select("*")
    .single();

  if (error) {
    console.error("createZ17LedgerEntry error:", error);
    throw new Error(error.message);
  }

  return data as Z17LedgerEntry;
}

/**
 * Convenience helper: when a QA run finishes, record both QA + ledger.
 */
export async function recordQaRunWithLedger(args: {
  projectId: string;
  label?: string;
  status?: Z17QaRunStatus;
  score?: number;
  report?: any;
}): Promise<{ qaRun: Z17QaRun; ledger: Z17LedgerEntry }> {
  const qaRun = await createZ17QaRun(args);

  const ledger = await createZ17LedgerEntry({
    projectId: args.projectId,
    entryType: "qa",
    payload: {
      qa_run_id: qaRun.id,
      label: qaRun.label,
      status: qaRun.status,
      score: qaRun.score,
      report: qaRun.report,
    },
  });

  return { qaRun, ledger };
}
