// src/lib/builder/server/agentFactory.ts

export type AgentSpec = {
  name: string;
  role: string;
  responsibilities: string[];
  tools: string[];
  constraints: string[];
};

export type AgentEvalResult = {
  passed: boolean;
  score: number;
  notes: string[];
};

export function buildAgentFromJD(jobDescription: string): AgentSpec {
  return {
    name: "AI Employee",
    role: jobDescription.split("\n")[0] || "General Agent",
    responsibilities: jobDescription.split("\n").slice(1, 5),
    tools: ["browser", "api", "memory"],
    constraints: ["No destructive actions", "Follow policies"],
  };
}

export function evaluateAgent(agent: AgentSpec): AgentEvalResult {
  const score = agent.responsibilities.length >= 3 ? 85 : 60;

  return {
    passed: score >= 75,
    score,
    notes:
      score >= 75
        ? ["Agent passed evaluation"]
        : ["Agent lacks sufficient clarity"],
  };
}
