// src/lib/builder/diagnostics-heuristics.ts

type QualityLevel = "ok" | "warning" | "risk";

export interface QualityScanSection {
  id: string;
  title: string;
  level: QualityLevel;
  summary: string;
  recommendations: string[];
}

export type TestCaseStatus = "pass" | "fail";

export interface TestCase {
  id: string;
  title: string;
  status: TestCaseStatus;
  detail: string;
}

export interface TestReport {
  total: number;
  passed: number;
  failed: number;
  cases: TestCase[];
}

export interface DeployStep {
  id: string;
  label: string;
  detail: string;
}

export interface DeployPlan {
  targetEnv: string;
  steps: DeployStep[];
  summary: string;
}

export interface AgentDefinition {
  id: string;
  name: string;
  mission: string;
  persona: string;
  tools: string;
  handoffs: string;
  model?: string;
  temperature?: number;
}

export type ArchitectureEntityKind = "data" | "service" | "external";

export interface ArchitectureEntity {
  id: string;
  name: string;
  description: string;
  kind: ArchitectureEntityKind;
  notes: string;
}

/* ---- Diagnostics model ---- */

export type DiagnosticSeverity = "info" | "warning" | "error";

export interface DiagnosticItem {
  id: string;
  area: string;
  severity: DiagnosticSeverity;
  symptom: string;
  likelyCause: string;
  suggestedFix: string;
}

export interface DiagnosticsBody {
  projectId: string;
  title: string;
  buildType: string;
  sections?: QualityScanSection[];
  testReport?: TestReport | null;
  deployPlan?: DeployPlan | null;
  agents?: AgentDefinition[];
  architecture?: ArchitectureEntity[];
}

/**
 * Pure heuristic diagnostics.
 * No LLM dependency so this always works.
 */
export function buildHeuristicDiagnostics(
  input: DiagnosticsBody
): DiagnosticItem[] {
  const diagnostics: DiagnosticItem[] = [];
  const { sections, testReport, deployPlan, agents, architecture, buildType } =
    input;

  const id = (prefix: string) =>
    `${prefix}_${Math.random().toString(36).slice(2, 8)}`;

  // 1. Link quality scan "risk" and "warning" into explicit bugs
  if (sections && sections.length > 0) {
    for (const s of sections) {
      if (s.level === "risk") {
        diagnostics.push({
          id: id("risk"),
          area: s.title,
          severity: "error",
          symptom: `Quality scan flagged this area as HIGH RISK: ${s.summary}`,
          likelyCause:
            "This area likely has structural issues (missing flows, missing ownership, or incorrect assumptions).",
          suggestedFix:
            s.recommendations[0] ||
            "Pick 1–2 most critical flows in this area, rewrite them as explicit scenarios, and re-run codegen + tests.",
        });
      } else if (s.level === "warning") {
        diagnostics.push({
          id: id("warn"),
          area: s.title,
          severity: "warning",
          symptom: `Quality scan flagged this area as WARNING: ${s.summary}`,
          likelyCause:
            "This is probably not fatal, but it will cause friction or instability if you ship it as-is.",
          suggestedFix:
            s.recommendations[0] ||
            "Turn one recommendation here into a concrete change (spec, schema, or agent mission) and re-run tests.",
        });
      }
    }
  }

  // 2. Test failures → concrete bug hints
  if (testReport && testReport.failed > 0) {
    diagnostics.push({
      id: id("tests_failed"),
      area: "Tests",
      severity: "error",
      symptom: `${testReport.failed} test(s) are failing out of ${testReport.total}.`,
      likelyCause:
        "The generated app scaffold is structurally OK, but specific flows or edge cases aren't matching expectations.",
      suggestedFix:
        "Open the failing test cases, read the expected behavior line by line, then adjust either the handler logic or the test assumptions. Re-run tests after each small fix.",
    });

    for (const c of testReport.cases) {
      if (c.status === "fail") {
        diagnostics.push({
          id: id("test_case"),
          area: "Tests",
          severity: "warning",
          symptom: `Failing test: ${c.title}`,
          likelyCause:
            "This flow or edge case is not fully implemented or is returning an unexpected shape/status.",
          suggestedFix:
            c.detail ||
            "Mirror the failing test as a manual scenario: (1) hit the endpoint / UI manually, (2) compare actual vs expected, (3) patch the mismatch.",
        });
      }
    }
  }

  // 3. No tests at all
  if (!testReport) {
    diagnostics.push({
      id: id("no_tests"),
      area: "Tests",
      severity: "warning",
      symptom: "No test report available.",
      likelyCause:
        "You haven't wired any Jest/Playwright runs yet, so regressions will be invisible.",
      suggestedFix:
        "Start with 3–5 high-leverage tests: one health check, one critical flow, one failure path, and one agent run. Treat them as 'tripwires' before every deploy.",
    });
  }

  // 4. Deploy plan gaps
  if (!deployPlan) {
    diagnostics.push({
      id: id("no_deploy_plan"),
      area: "Deploy",
      severity: "warning",
      symptom: "No deploy blueprint attached to this build yet.",
      likelyCause:
        "You haven't codified how this leaves the lab: env vars, migrations, smoke tests, and rollback are implicit.",
      suggestedFix:
        "Generate a deploy blueprint and turn its steps into a GitHub Actions or Vercel config, plus a short runbook entry.",
    });
  } else {
    if (!deployPlan.steps || deployPlan.steps.length < 3) {
      diagnostics.push({
        id: id("thin_deploy_plan"),
        area: "Deploy",
        severity: "warning",
        symptom:
          "Deploy plan exists but looks very thin (few steps or missing detail).",
        likelyCause:
          "The blueprint might be too generic. Migrations, secrets, and post-deploy smoke checks are not explicitly captured.",
        suggestedFix:
          "Enrich the deploy plan with (1) DB migrations, (2) env var checks, (3) a smoke test suite, and (4) a rollback procedure.",
      });
    }
  }

  // 5. Agent issues – no agents for a build type that expects them
  if ((buildType === "agent" || buildType === "workflow") && !agents?.length) {
    diagnostics.push({
      id: id("no_agents"),
      area: "Agents",
      severity: "error",
      symptom:
        "This build type expects a crew of AI agents, but no agent employees are defined.",
      likelyCause:
        "You haven't yet translated the flows into concrete agents with missions and tools.",
      suggestedFix:
        "Define at least 3–5 agents with clear missions, non-overlapping scopes, and explicit handoffs. Use the Daily OS templates as a starting point.",
    });
  }

  // 6. Agents without missions or tools
  if (agents && agents.length > 0) {
    const missingMission = agents.filter((a) => !a.mission?.trim());
    if (missingMission.length > 0) {
      diagnostics.push({
        id: id("agent_mission"),
        area: "Agents",
        severity: "warning",
        symptom: `${missingMission.length} agent(s) have no mission defined.`,
        likelyCause:
          "Agents were created as placeholders and never given an explicit job to own.",
        suggestedFix:
          "For each agent, write a 1–3 sentence mission starting with a verb (e.g., 'Own...', 'Protect...', 'Continuously monitor...').",
      });
    }

    const missingTools = agents.filter((a) => !a.tools?.trim());
    if (missingTools.length > 0) {
      diagnostics.push({
        id: id("agent_tools"),
        area: "Agents",
        severity: "warning",
        symptom: `${missingTools.length} agent(s) have no tools listed.`,
        likelyCause:
          "The runtime won't know which APIs/DB tables/queues each agent is allowed to touch.",
        suggestedFix:
          "List explicit tools (APIs, DB tables, queues, knowledge bases) for each agent so the runtime can enforce capabilities.",
      });
    }
  }

  // 7. Architecture issues
  if (!architecture || architecture.length === 0) {
    diagnostics.push({
      id: id("no_architecture"),
      area: "Architecture",
      severity: "error",
      symptom: "No architecture entities defined.",
      likelyCause:
        "You jumped straight from idea to code without naming the core data and service boundaries.",
      suggestedFix:
        "Define at least: workspace, user, primary artifact (task, document, content), agent, and run, plus any external systems.",
    });
  }

  // 8. Default "all clear"
  if (diagnostics.length === 0) {
    diagnostics.push({
      id: id("all_clear"),
      area: "System",
      severity: "info",
      symptom:
        "No obvious structural risks detected from the scan, tests, deploy plan, or agents.",
      likelyCause:
        "Core pieces look coherent. Remaining issues are likely in fine-grained UX, copy, or real-world edge cases.",
      suggestedFix:
        "Ship to a small cohort, capture incidents, and pipe them back into tests and agents.",
    });
  }

  return diagnostics;
}
