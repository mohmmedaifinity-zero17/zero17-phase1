// src/app/api/agents/run-live/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

/**
 * Agent runtime config (same shape as agents/runtime.ts)
 */

export interface AgentNodeConfig {
  id: string;
  name: string;
  mission: string;
  persona: string;
  tools: string;
  handoffs: string;
}

export interface AgentEdgeConfig {
  fromId: string;
  toId: string;
  reason: string;
}

export interface AgentRuntimeConfig {
  nodes: AgentNodeConfig[];
  edges: AgentEdgeConfig[];
}

export interface AgentRunStep {
  id: string;
  agentId: string;
  agentName: string;
  input: string;
  output: string;
}

export interface AgentRunTrace {
  input: string;
  steps: AgentRunStep[];
}

interface RunLiveBody {
  config?: AgentRuntimeConfig;
  input?: string;
  startAgentId?: string | null;
  maxSteps?: number;
  model?: string;
}

/**
 * Build the system prompt for each agent.
 */
function buildSystemPrompt(agent: AgentNodeConfig): string {
  return [
    "You are an AI agent employee inside a multi-agent operating system.",
    "",
    `Your name: ${agent.name || "Unnamed agent"}`,
    agent.mission ? `Mission: ${agent.mission}` : "",
    agent.persona ? `Persona: ${agent.persona}` : "",
    agent.tools ? `Tools you can conceptually use: ${agent.tools}` : "",
    agent.handoffs
      ? `Handoffs & boundaries: ${agent.handoffs}`
      : "You should hand off when the task is clearly outside your mission.",
    "",
    "Guidelines:",
    "- Think and respond like a senior operator, not a generic chatbot.",
    "- Stay tightly aligned with your mission and persona.",
    "- If the next step clearly belongs to another agent or a human, end your answer by clearly stating the handoff.",
    "- Prefer structured bullet points and clear next actions.",
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Basic multi-step runner (same logic as runAgentGraph, but server-side
 * with real LLM calls).
 */
async function runAgentGraphLive(params: {
  client: OpenAI;
  config: AgentRuntimeConfig;
  input: string;
  startAgentId?: string | null;
  maxSteps?: number;
  model: string;
}): Promise<AgentRunTrace> {
  const { client, config, input, startAgentId, maxSteps = 4, model } = params;
  const nodes = config.nodes ?? [];

  if (!nodes.length) {
    return { input, steps: [] };
  }

  let startIndex = 0;
  if (startAgentId) {
    const idx = nodes.findIndex(
      (n) => n.id === startAgentId || n.name === startAgentId
    );
    if (idx >= 0) startIndex = idx;
  }

  const steps: AgentRunStep[] = [];
  const totalSteps = Math.min(maxSteps, nodes.length || 1);
  let currentIndex = startIndex;
  let currentInput = input.trim();

  for (let i = 0; i < totalSteps; i++) {
    const node = nodes[currentIndex];

    const systemPrompt = buildSystemPrompt(node);

    const res = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content:
            i === 0
              ? currentInput ||
                "The founder has not provided much context. Ask for clarification."
              : currentInput || "Continue the chain of thought and actions.",
        },
      ],
      temperature: 0.35,
      max_tokens: 500,
    });

    const output =
      res.choices[0]?.message?.content?.trim() ||
      "Agent produced an empty response.";

    steps.push({
      id: `step_${i}`,
      agentId: node.id,
      agentName: node.name,
      input: currentInput,
      output,
    });

    // Feed forward
    currentInput = output;
    currentIndex = (currentIndex + 1) % nodes.length;
  }

  return { input, steps };
}

/**
 * POST /api/agents/run-live
 *
 * Body:
 * {
 *   "config": { nodes: [...], edges: [...] },
 *   "input": "start situation",
 *   "startAgentId": "optional-id-or-name",
 *   "maxSteps": 3,
 *   "model": "gpt-4.1-mini"  // optional
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "OPENAI_API_KEY is not set. Add it to your .env.local before running live agents.",
        },
        { status: 500 }
      );
    }

    const body = (await req.json()) as RunLiveBody;
    const { config, input, startAgentId, maxSteps, model } = body;

    if (!config || !Array.isArray(config.nodes)) {
      return NextResponse.json(
        { ok: false, error: "Missing or invalid agent runtime config." },
        { status: 400 }
      );
    }

    if (!input || !input.trim()) {
      return NextResponse.json(
        {
          ok: false,
          error: "Provide a non-empty 'input' to start the live run.",
        },
        { status: 400 }
      );
    }

    const client = new OpenAI({ apiKey });

    const trace = await runAgentGraphLive({
      client,
      config,
      input,
      startAgentId: startAgentId ?? undefined,
      maxSteps: maxSteps ?? 4,
      model: model || "gpt-4.1-mini",
    });

    return NextResponse.json(
      {
        ok: true,
        trace,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[/api/agents/run-live] error:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "Unexpected error in live agent run.",
      },
      { status: 500 }
    );
  }
}
