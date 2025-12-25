// src/app/api/builder/quality/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

/**
 * Types aligned with Builder Lab client
 */

type BuildType = "app" | "agent" | "dashboard" | "workflow";

interface ArchitectureEntity {
  id: string;
  name: string;
  description: string;
  kind: "data" | "service" | "external";
  notes: string;
}

interface AgentDefinition {
  id: string;
  name: string;
  mission: string;
  persona: string;
  tools: string;
  handoffs: string;
}

interface MultiLensSpec {
  founder: {
    problem: string;
    desiredOutcome: string;
    coreUsers: string;
  };
  product: {
    keyFeatures: string;
    nonGoals: string;
  };
  tech: {
    stack: string;
    dataModel: string;
    constraints: string;
  };
  ux: {
    primaryFlows: string;
    tone: string;
  };
  launch: {
    pricing: string;
    successMetric: string;
  };
}

interface TestCase {
  id: string;
  title: string;
  status: "pass" | "fail";
  detail: string;
}

interface TestReport {
  total: number;
  passed: number;
  failed: number;
  cases: TestCase[];
}

interface DeployStep {
  id: string;
  label: string;
  detail: string;
}

interface DeployPlan {
  targetEnv: string;
  steps: DeployStep[];
  summary: string;
}

export interface QualityScanSection {
  id: string;
  title: string;
  level: "ok" | "warning" | "risk";
  summary: string;
  recommendations: string[];
}

export interface DocsBundle {
  readme: string;
  architecture: string;
  runbook: string;
}

export interface QualityScanResult {
  sections: QualityScanSection[];
  docs: DocsBundle;
}

interface QualityScanBody {
  title: string;
  buildType: BuildType;
  spec?: MultiLensSpec | null;
  architecture?: ArchitectureEntity[] | null;
  agents?: AgentDefinition[] | null;
  testReport?: TestReport | null;
  deployPlan?: DeployPlan | null;
}

/**
 * Helper: build a compact context string for the LLM
 */
function buildContextSummary(body: QualityScanBody): string {
  const {
    title,
    buildType,
    spec,
    architecture,
    agents,
    testReport,
    deployPlan,
  } = body;

  const archLines =
    architecture && architecture.length
      ? architecture
          .map(
            (a) =>
              `- [${a.kind}] ${a.name}: ${a.description || "no description"}`
          )
          .join("\n")
      : "No architecture entities defined yet.";

  const agentLines =
    agents && agents.length
      ? agents
          .map(
            (a) =>
              `- ${a.name || a.id}: mission="${a.mission || "?"}", tools="${
                a.tools || "?"
              }", handoffs="${a.handoffs || "?"}"`
          )
          .join("\n")
      : "No agents defined yet.";

  const testSummary = testReport
    ? `Tests: ${testReport.total} total, ${testReport.passed} pass, ${testReport.failed} fail.`
    : "No structured test report yet.";

  const deploySummary = deployPlan
    ? `Deploy target: ${deployPlan.targetEnv}. Steps: ${deployPlan.steps
        .map((s) => s.label)
        .join(", ")}.`
    : "No deploy plan yet.";

  const specLines = spec
    ? [
        `Founder problem: ${spec.founder.problem}`,
        `Founder desired outcome: ${spec.founder.desiredOutcome}`,
        `Core users: ${spec.founder.coreUsers}`,
        `Product key features: ${spec.product.keyFeatures}`,
        `Product non-goals: ${spec.product.nonGoals}`,
        `Tech stack: ${spec.tech.stack}`,
        `Tech data model: ${spec.tech.dataModel}`,
        `Tech constraints: ${spec.tech.constraints}`,
        `UX flows: ${spec.ux.primaryFlows}`,
        `UX tone: ${spec.ux.tone}`,
        `Launch pricing: ${spec.launch.pricing}`,
        `Launch success metric: ${spec.launch.successMetric}`,
      ].join("\n")
    : "No multi-lens spec captured.";

  return [
    `Title: ${title}`,
    `Build type: ${buildType}`,
    "",
    "=== Spec ===",
    specLines,
    "",
    "=== Architecture entities ===",
    archLines,
    "",
    "=== Agent employees ===",
    agentLines,
    "",
    "=== Tests ===",
    testSummary,
    "",
    "=== Deploy plan ===",
    deploySummary,
  ].join("\n");
}

/**
 * Fallback quality result when no API key is configured.
 * This lets the UI still show a deterministic offline scan.
 */
function buildOfflineQualityResult(body: QualityScanBody): QualityScanResult {
  const hasArch = !!(body.architecture && body.architecture.length);
  const hasAgents = !!(body.agents && body.agents.length);
  const hasSpec = !!body.spec;

  const sections: QualityScanSection[] = [
    {
      id: "founder_fit",
      title: "Founder / problem-solution fit",
      level: hasSpec ? "ok" : "warning",
      summary: hasSpec
        ? "You’ve captured a multi-lens spec. Next step is to pressure-test it against brutal real-world constraints."
        : "No multi-lens spec detected — you’re flying without a source of truth for what this build is really about.",
      recommendations: hasSpec
        ? [
            "Run through the founder lens and check if every field would still feel true 3 months after launch.",
            "Check that non-goals are explicit and respected in the rest of the build to avoid scope creep.",
          ]
        : [
            "Use the Builder Lab spec section to write a founder-level problem, desired outcome, and non-goals.",
            "Make sure core users are sharply defined (not 'everyone' or a vague segment).",
          ],
    },
    {
      id: "architecture",
      title: "Architecture & data model",
      level: hasArch ? "ok" : "warning",
      summary: hasArch
        ? "You’ve started mapping entities and services. Focus now on relationships, constraints, and scaling paths."
        : "No explicit architecture entities defined. You’re at risk of an accidental, tangled schema.",
      recommendations: hasArch
        ? [
            "For each entity, write down 2–3 concrete read/write paths from the main user flows.",
            "Double-check that each critical external integration is represented as an explicit 'external' entity.",
          ]
        : [
            "Define at least workspace, user, artifacts (tasks/drafts/runs), and integration connection entities.",
            "Call out any external systems as 'external' entities with clear integration boundaries.",
          ],
    },
    {
      id: "agents",
      title: "Agent crew clarity",
      level: hasAgents ? "ok" : "warning",
      summary: hasAgents
        ? "You’ve defined agent employees. The next level is clarifying boundaries and escalation rules."
        : "No agents defined yet. You’re missing the OS layer of 'who owns what' in your AI employee model.",
      recommendations: hasAgents
        ? [
            "For each agent, tighten mission to a single sentence that includes scope and success criteria.",
            "Make handoffs explicit: which agent or human owns each downstream decision.",
          ]
        : [
            "Create 3–5 core agents that own distinct slices: briefing, execution, calendar, inbox, reporting.",
            "Give each agent a mission, persona, tools, and handoff description.",
          ],
    },
    {
      id: "tests_deploy",
      title: "Tests & deployment confidence",
      level: body.testReport || body.deployPlan ? "ok" : "warning",
      summary:
        body.testReport || body.deployPlan
          ? "You’ve started scaffolding tests or deploy. Next: wire them to real failure modes and SLOs."
          : "No test report or deploy plan connected yet. You’ll be guessing at stability during launch.",
      recommendations:
        body.testReport || body.deployPlan
          ? [
              "Map your top 3 product failure modes (e.g., data loss, auth bugs, broken agent runs) to explicit tests.",
              "Define one or two SLOs (e.g., 99.5% success for agent runs) and plan alerts for violations.",
            ]
          : [
              "Start by adding simple 'can boot + healthcheck' tests for core flows.",
              "Draft a deploy checklist: environment variables, migrations, seed data, smoke tests.",
            ],
    },
  ];

  const title = body.title || "Unnamed build";

  const docs: DocsBundle = {
    readme: `# ${title}\n\nThis is an offline, heuristic README skeleton generated without an LLM.\n\n- Clarify the problem and who this build is for.\n- Summarize key flows and constraints.\n- Link out to architecture and runbook docs.\n`,
    architecture:
      "## Architecture (offline skeleton)\n\n- List your core entities and their relationships.\n- Call out external systems and what they are trusted for.\n- Note any scaling, latency, or compliance constraints.\n",
    runbook:
      "## Runbook (offline skeleton)\n\n- How to start the system.\n- How to run health checks.\n- Known failure modes and immediate triage steps.\n",
  };

  return { sections, docs };
}

/**
 * Build the LLM prompt
 */
function buildQualityPrompt(context: string): string {
  return [
    "You are a ruthless but deeply helpful CTO + Head of Product reviewing a build inside an AI-first builder lab called Zero17.",
    "",
    "You will receive:",
    "- The high-level spec (founder, product, tech, UX, launch lenses)",
    "- Architecture entities and services",
    "- Agent employees and their missions",
    "- Any current tests and deploy plan scaffolds",
    "",
    "Your job:",
    "1) Run a quality scan across founder fit, architecture, agent design, tests, and deploy readiness.",
    "2) Identify strengths, gaps, risks, and anti-patterns.",
    "3) Produce a short but sharp set of recommendations for each area.",
    "4) Generate 3 docs:",
    "   - README: for engineers and operators joining the project.",
    "   - Architecture notes: how the system hangs together and why.",
    "   - Runbook: how to operate, diagnose, and recover from issues.",
    "",
    "Important style rules:",
    "- Be concrete, not fluffy. Avoid buzzwords.",
    "- Prefer bullets over long paragraphs.",
    "- Treat this as something a world-class CTO would send to the founding team before a launch.",
    "",
    "Output strictly as JSON with this exact shape:",
    `{
  "sections": [
    {
      "id": "string",
      "title": "string",
      "level": "ok" | "warning" | "risk",
      "summary": "string",
      "recommendations": ["string", "..."]
    }
  ],
  "docs": {
    "readme": "markdown string",
    "architecture": "markdown string",
    "runbook": "markdown string"
  }
}`,
    "",
    "If some inputs are missing (e.g. no tests yet), call that out explicitly and adjust recommendations.",
    "",
    "Now here is the project context:\n",
    context,
  ].join("\n");
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as QualityScanBody;

    if (!body || !body.title || !body.buildType) {
      return NextResponse.json(
        { ok: false, error: "Missing title or buildType in request body." },
        { status: 400 }
      );
    }

    const context = buildContextSummary(body);

    const apiKey = process.env.OPENAI_API_KEY;

    // If no API key, return a deterministic offline scan so UI still behaves well.
    if (!apiKey) {
      const offline = buildOfflineQualityResult(body);
      return NextResponse.json(
        {
          ok: true,
          mode: "offline",
          result: offline,
          note: "OPENAI_API_KEY is not set. Returning an offline heuristic scan instead of an LLM-powered one.",
        },
        { status: 200 }
      );
    }

    const client = new OpenAI({ apiKey });

    const prompt = buildQualityPrompt(context);

    const completion = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const raw =
      completion.output[0] &&
      "content" in completion.output[0] &&
      Array.isArray(completion.output[0].content) &&
      completion.output[0].content[0] &&
      "type" in completion.output[0].content[0] &&
      completion.output[0].content[0].type === "output_text" &&
      "text" in completion.output[0].content[0]
        ? completion.output[0].content[0].text
        : null;

    if (!raw) {
      return NextResponse.json(
        { ok: false, error: "Unexpected OpenAI response format" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(raw) as QualityScanResult;

    return NextResponse.json(
      {
        ok: true,
        mode: "online",
        result: parsed,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[/api/builder/quality] error:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "Unexpected error in builder quality scan.",
      },
      { status: 500 }
    );
  }
}
