// src/lib/builder/types/agent.ts

export type AgentStatus = "draft" | "shadow" | "production";

export type AgentDefinition = {
  id: string;
  name: string;
  role: string;
  createdAt: string;
  status: AgentStatus;
};

export type AgentRunRecord = {
  runId: string;
  agentId: string;
  mode: "shadow" | "production";
  kpis: {
    successRate: number;
    avgLatencyMs: number;
    confidenceScore: number;
  };
  createdAt: string;
};
