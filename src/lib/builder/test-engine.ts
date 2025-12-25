// src/lib/builder/test-engine.ts

import type {
  ArchitectureMap,
  MultiLensSpec,
  TestPlan,
  TestCase,
  TestCaseStatus,
} from "@/lib/builder/types";

type Risk = "low" | "medium" | "high";
type Area = "happy_path" | "edge_case" | "failure" | "performance";

function uid(prefix: string) {
  const r =
    (globalThis as any).crypto?.randomUUID?.() ??
    `${Date.now()}_${Math.random().toString(16).slice(2)}`;
  return `${prefix}_${r}`;
}

function makeCase(params: {
  title: string;
  description: string;
  area: Area;
  risk: Risk;
}): TestCase {
  return {
    id: uid("tc"),
    title: params.title,
    description: params.description,
    area: params.area,
    risk: params.risk,
    status: "not_run",
    notes: "",
  };
}

export function generateTestPlan(input: {
  spec: MultiLensSpec | null;
  architecture: ArchitectureMap | null;
}): TestPlan {
  const { spec, architecture } = input;

  const screens = architecture?.screens ?? [];
  const entities = architecture?.entities ?? [];
  const apis = architecture?.apis ?? [];
  const infra = architecture?.infra;

  const cases: TestCase[] = [];

  // Spec → outcomes / flows
  const founderProblem = spec?.founderLens?.problem?.trim();
  if (founderProblem) {
    cases.push(
      makeCase({
        title: "Core outcome is achievable",
        description:
          "Verify the product can deliver the core outcome described in the Founder Lens with no missing dependencies.",
        area: "happy_path",
        risk: "high",
      })
    );
  }

  const coreFlows = spec?.founderLens?.coreFlows ?? [];
  coreFlows.slice(0, 8).forEach((flow, i) => {
    cases.push(
      makeCase({
        title: `Primary flow works: ${flow}`,
        description:
          "Walk through this flow end-to-end (UI → validation → persistence → result). Confirm no dead ends.",
        area: "happy_path",
        risk: i === 0 ? "high" : "medium",
      })
    );
  });

  // QA lens acceptance tests
  const acceptance = spec?.qaLens?.acceptanceTests ?? [];
  acceptance.slice(0, 20).forEach((t) => {
    cases.push(
      makeCase({
        title: `Acceptance: ${t.description}`,
        description:
          "From QA Lens. Ensure behavior matches exactly and doesn’t regress after refine.",
        area: "happy_path",
        risk: "medium",
      })
    );
  });

  // Architecture-based tests
  cases.push(
    makeCase({
      title: "Screens render without runtime errors",
      description:
        "Open each defined screen; ensure no crashes, missing assumptions, or blocking exceptions.",
      area: "happy_path",
      risk: "high",
    })
  );

  if (screens.length === 0) {
    cases.push(
      makeCase({
        title: "At least one screen is defined",
        description:
          "Architecture map has no screens. Add screens so codegen/tests can bind to UI flows.",
        area: "failure",
        risk: "high",
      })
    );
  }

  if (entities.length === 0) {
    cases.push(
      makeCase({
        title: "Core data model exists",
        description:
          "No entities defined. Add at least workspace/user + 1 domain entity to enable persistence and flows.",
        area: "failure",
        risk: "high",
      })
    );
  } else {
    cases.push(
      makeCase({
        title: "Entity validation rules work",
        description:
          "Attempt create/update with missing required fields; confirm validation blocks invalid writes.",
        area: "edge_case",
        risk: "medium",
      })
    );
  }

  // Auth / tenancy
  cases.push(
    makeCase({
      title: "Auth blocks unauthorized access",
      description:
        "Protected pages/APIs reject unauthenticated users; tenant-scoped reads prevent cross-user access.",
      area: "failure",
      risk: "high",
    })
  );

  // APIs
  if (apis.length === 0) {
    cases.push(
      makeCase({
        title: "APIs exist for core flows (or explicitly UI-only)",
        description:
          "No APIs defined in architecture map. Add 2–6 endpoints for primary flows or mark as UI-only.",
        area: "edge_case",
        risk: "medium",
      })
    );
  } else {
    cases.push(
      makeCase({
        title: "API happy path returns 2xx",
        description:
          "Call each API with valid payload; confirm correct 2xx responses + state transitions.",
        area: "happy_path",
        risk: "high",
      })
    );
    cases.push(
      makeCase({
        title: "API rejects invalid payloads (4xx)",
        description:
          "Call each API with invalid payloads; confirm safe 4xx messages and no stack traces leaked.",
        area: "failure",
        risk: "high",
      })
    );
  }

  // Infra coherence
  cases.push(
    makeCase({
      title: "Infra selection is coherent",
      description:
        "Ensure DB/hosting/auth selections are consistent and realistic for production.",
      area: "edge_case",
      risk: "medium",
    })
  );

  if (infra?.billingProvider) {
    cases.push(
      makeCase({
        title: "Billing webhooks are safe (if enabled)",
        description:
          "Verify signature validation, idempotency, and replay protection for billing webhooks.",
        area: "failure",
        risk: "high",
      })
    );
  }

  // Perf baseline
  cases.push(
    makeCase({
      title: "Baseline performance smoke",
      description:
        "Key screens load fast enough; API latency stable under light usage. No obvious waterfalls.",
      area: "performance",
      risk: "medium",
    })
  );

  // Agent lens (optional)
  const agents = spec?.agentLens?.agents ?? [];
  if (agents.length > 0) {
    cases.push(
      makeCase({
        title: "Agent escalation + limits are safe",
        description:
          "Agents must respect escalationRules/riskLimits and stay inside allowed scope.",
        area: "failure",
        risk: "high",
      })
    );
  }

  const coverageAreas: string[] = [
    "primary_flows",
    "screens",
    "auth",
    "data_model",
    "apis",
    "infra",
    "performance",
  ];
  if (agents.length > 0) coverageAreas.push("agents");

  return {
    summary:
      "Phase 6 Auto-Test Plan (virtual sweep). Early reliability signal + gap detection before real test runner.",
    coverageAreas,
    cases,
  };
}

export function runVirtualTests(input: {
  plan: TestPlan;
  architecture: ArchitectureMap | null;
}): TestPlan {
  const { plan, architecture } = input;

  const screens = architecture?.screens?.length ?? 0;
  const entities = architecture?.entities?.length ?? 0;
  const apis = architecture?.apis?.length ?? 0;

  const now = new Date().toISOString();

  function setStatus(tc: TestCase, status: TestCaseStatus, notes?: string) {
    tc.status = status;
    tc.lastRunAt = now;
    tc.notes = notes ?? tc.notes ?? "";
  }

  const updatedCases = plan.cases.map((c) => {
    const tc = { ...c };

    if (!architecture) {
      setStatus(
        tc,
        "virtual_fail",
        "No architecture_json available. Generate/save architecture first."
      );
      return tc;
    }

    const t = tc.title.toLowerCase();

    if (t.includes("screen")) {
      if (screens <= 0) setStatus(tc, "virtual_fail", "No screens defined.");
      else setStatus(tc, "virtual_pass", "Screens exist; virtual pass.");
      return tc;
    }

    if (t.includes("entity") || t.includes("data model")) {
      if (entities <= 0) setStatus(tc, "virtual_fail", "No entities defined.");
      else setStatus(tc, "virtual_pass", "Entities exist; virtual pass.");
      return tc;
    }

    if (t.includes("api")) {
      if (apis <= 0) setStatus(tc, "virtual_fail", "No APIs defined.");
      else setStatus(tc, "virtual_pass", "APIs exist; virtual pass.");
      return tc;
    }

    if (tc.area === "failure" && tc.risk === "high") {
      setStatus(
        tc,
        "virtual_fail",
        "High-risk failure-path needs real auth/validation wiring to confirm."
      );
      return tc;
    }

    setStatus(tc, "virtual_pass", "Virtual pass.");
    return tc;
  });

  return { ...plan, cases: updatedCases };
}

export function summarizeTestPlan(plan: TestPlan) {
  const total = plan.cases.length;
  const pass = plan.cases.filter((c) => c.status === "virtual_pass").length;
  const fail = plan.cases.filter((c) => c.status === "virtual_fail").length;
  const notRun = plan.cases.filter((c) => c.status === "not_run").length;

  const scoreRaw = total === 0 ? 0 : (pass + 0.5 * notRun) / total;
  const score = Math.round(scoreRaw * 100);

  return { total, pass, fail, notRun, score };
}
