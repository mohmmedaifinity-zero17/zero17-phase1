// src/lib/zero17-db.ts
import { supabase } from "./supabase";

/**
 * Phase-1 tables (from your schema):
 * agents, agent_runs, agent_evals, artifacts, dashboards, metrics
 * NOTE: agents.project_id, artifacts.project_id, dashboards.project_id, metrics.project_id reference projects(id).
 * Ensure a projects row exists for the id you pass.
 */

export type UUID = string;

// -------- Types --------
export type Agent = {
  id: UUID;
  project_id: UUID | null;
  name: string | null;
  recipe_yaml: string | null;
  policies: Record<string, any> | null;
  created_at: string;
};

export type NewAgent = Omit<Agent, "id" | "created_at"> &
  Partial<Pick<Agent, "project_id" | "name" | "recipe_yaml" | "policies">>;

export type AgentRun = {
  id: UUID;
  agent_id: UUID;
  inputs: Record<string, any> | null;
  outputs: Record<string, any> | null;
  passed: boolean | null;
  kpis: Record<string, any> | null;
  created_at: string;
};

export type NewAgentRun = Omit<AgentRun, "id" | "created_at">;

export type AgentEval = {
  id: UUID;
  agent_id: UUID;
  fixtures: Record<string, any> | null;
  redteam: Record<string, any> | null;
  last_passed_at: string | null;
  sla: Record<string, any> | null;
};

export type UpsertAgentEval = Omit<AgentEval, "id">;

export type Artifact = {
  id: UUID;
  project_id: UUID;
  type: string | null;
  path: string | null;
  meta: Record<string, any> | null;
  created_at: string;
};
export type NewArtifact = Omit<Artifact, "id" | "created_at">;

export type Dashboard = {
  id: UUID;
  project_id: UUID;
  domain: string | null;
  config: Record<string, any> | null;
  created_at: string;
};
export type UpsertDashboard = Omit<Dashboard, "id" | "created_at">;

export type Metric = {
  id: UUID;
  project_id: UUID;
  name: string;
  value: number | null;
  meta: Record<string, any> | null;
  ts: string;
};
export type NewMetric = Omit<Metric, "id" | "ts"> & { ts?: string };

// -------- helpers --------
function ok<T>(data: T | null, error: any): T {
  if (error) throw error;
  // @ts-expect-error - supabase can return T[] or T | null depending on method; callers know context
  return data;
}

function okOne<T>(rows: T[] | null, error: any): T {
  if (error) throw error;
  if (!rows || rows.length === 0) throw new Error("Not found");
  return rows[0];
}

// -------- agents --------
export const Agents = {
  async create(input: NewAgent) {
    const { data, error } = await supabase
      .from("agents")
      .insert(input)
      .select("*");
    return okOne<Agent>(data, error);
  },
  async get(id: UUID) {
    const { data, error } = await supabase
      .from("agents")
      .select("*")
      .eq("id", id)
      .limit(1);
    return okOne<Agent>(data, error);
  },
  async listByProject(project_id: UUID) {
    const { data, error } = await supabase
      .from("agents")
      .select("*")
      .eq("project_id", project_id)
      .order("created_at", { ascending: false });
    return ok<Agent[]>(data, error);
  },
  async update(id: UUID, patch: Partial<NewAgent>) {
    const { data, error } = await supabase
      .from("agents")
      .update(patch)
      .eq("id", id)
      .select("*");
    return okOne<Agent>(data, error);
  },
  async remove(id: UUID) {
    const { error } = await supabase.from("agents").delete().eq("id", id);
    if (error) throw error;
    return { id, deleted: true };
  },
};

// -------- agent_runs --------
export const AgentRuns = {
  async create(run: NewAgentRun) {
    const { data, error } = await supabase
      .from("agent_runs")
      .insert(run)
      .select("*");
    return okOne<AgentRun>(data, error);
  },
  async listByAgent(agent_id: UUID, limit = 25) {
    const { data, error } = await supabase
      .from("agent_runs")
      .select("*")
      .eq("agent_id", agent_id)
      .order("created_at", { ascending: false })
      .limit(limit);
    return ok<AgentRun[]>(data, error);
  },
  async get(id: UUID) {
    const { data, error } = await supabase
      .from("agent_runs")
      .select("*")
      .eq("id", id)
      .limit(1);
    return okOne<AgentRun>(data, error);
  },
};

// -------- agent_evals --------
export const AgentEvals = {
  async upsert(e: UpsertAgentEval) {
    // upsert by agent_id (one row per agent)
    const { data, error } = await supabase
      .from("agent_evals")
      .upsert(e, { onConflict: "agent_id" })
      .select("*");
    return okOne<AgentEval>(data, error);
  },
  async getByAgent(agent_id: UUID) {
    const { data, error } = await supabase
      .from("agent_evals")
      .select("*")
      .eq("agent_id", agent_id)
      .limit(1);
    return okOne<AgentEval>(data, error);
  },
};

// -------- artifacts --------
export const Artifacts = {
  async add(a: NewArtifact) {
    const { data, error } = await supabase
      .from("artifacts")
      .insert(a)
      .select("*");
    return okOne<Artifact>(data, error);
  },
  async listByProject(project_id: UUID, type?: string) {
    let q = supabase
      .from("artifacts")
      .select("*")
      .eq("project_id", project_id)
      .order("created_at", { ascending: false });
    if (type) q = q.eq("type", type);
    const { data, error } = await q;
    return ok<Artifact[]>(data, error);
  },
};

// -------- dashboards --------
export const Dashboards = {
  async upsert(d: UpsertDashboard) {
    // one dashboard per (project_id, domain) suggested
    const { data, error } = await supabase
      .from("dashboards")
      .upsert(d, { onConflict: "project_id,domain" })
      .select("*");
    return okOne<Dashboard>(data, error);
  },
  async get(project_id: UUID, domain: string) {
    const { data, error } = await supabase
      .from("dashboards")
      .select("*")
      .eq("project_id", project_id)
      .eq("domain", domain)
      .limit(1);
    return okOne<Dashboard>(data, error);
  },
};

// -------- metrics --------
export const Metrics = {
  async add(m: NewMetric) {
    const payload = { ...m, ts: m.ts ?? new Date().toISOString() };
    const { data, error } = await supabase
      .from("metrics")
      .insert(payload)
      .select("*");
    return okOne<Metric>(data, error);
  },
  async list(project_id: UUID, name?: string, sinceISO?: string) {
    let q = supabase.from("metrics").select("*").eq("project_id", project_id);
    if (name) q = q.eq("name", name);
    if (sinceISO) q = q.gte("ts", sinceISO);
    const { data, error } = await q
      .order("ts", { ascending: false })
      .limit(500);
    return ok<Metric[]>(data, error);
  },
};
