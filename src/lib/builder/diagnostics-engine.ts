// src/lib/builder/diagnostics-engine.ts

import type { BuilderProject } from "@/lib/builder/types";

export type DiagnosticSeverity = "low" | "medium" | "high" | "critical";

export type DiagnosticItem = {
  id: string;
  severity: DiagnosticSeverity;
  title: string;
  whyItMatters: string;
  fixNow: string;
  phase: number; // 1..10
};

function did(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function computeDiagnostics(project: BuilderProject): {
  summary: string;
  items: DiagnosticItem[];
} {
  const spec: any = (project as any).spec_json ?? null;
  const arch: any = (project as any).architecture_json ?? null;
  const tests: any = (project as any).test_plan_json ?? null;
  const scan: any = (project as any).scan_report_json ?? null;

  const items: DiagnosticItem[] = [];

  // Phase 1: Spec gaps
  if (!spec?.founderLens?.problem) {
    items.push({
      id: did("spec_problem"),
      severity: "high",
      title: "Missing Founder Problem Statement",
      whyItMatters:
        "Without a crisp problem statement, every downstream decision drifts.",
      fixNow: "Phase 1 → add Founder Lens: problem + target users + one-liner.",
      phase: 1,
    });
  }

  const flows = spec?.founderLens?.coreFlows ?? [];
  if (!Array.isArray(flows) || flows.length < 2) {
    items.push({
      id: did("spec_flows"),
      severity: "medium",
      title: "Core flows are thin",
      whyItMatters:
        "Weak flow definition causes missing screens/APIs and broken builds.",
      fixNow: "Phase 1 → write 3–6 core flows (happy path + key variations).",
      phase: 1,
    });
  }

  const acc = spec?.qaLens?.acceptanceTests ?? [];
  if (!Array.isArray(acc) || acc.length < 3) {
    items.push({
      id: did("qa_acceptance"),
      severity: "high",
      title: "Acceptance tests are missing/thin",
      whyItMatters:
        "No definition of done = endless revisions and production risk.",
      fixNow: "Phase 1 → QA Lens: add 5–10 acceptance tests.",
      phase: 1,
    });
  }

  // Phase 2: Architecture gaps
  if (!arch) {
    items.push({
      id: did("arch_missing"),
      severity: "critical",
      title: "Architecture Map missing",
      whyItMatters:
        "Without architecture, codegen/test/scan signals are unreliable.",
      fixNow:
        "Phase 2 → generate Architecture Map; define screens/entities/apis + infra.",
      phase: 2,
    });
  } else {
    if (!arch?.infra?.authProvider || arch?.infra?.authProvider === "none") {
      items.push({
        id: did("arch_auth"),
        severity: "critical",
        title: "No Auth provider configured",
        whyItMatters:
          "Security + multi-tenant boundaries will break without auth.",
        fixNow:
          "Phase 2 → infra.authProvider = Supabase/Auth0/Clerk and enforce RLS/user scoping.",
        phase: 2,
      });
    }

    if (!arch?.entities?.length) {
      items.push({
        id: did("arch_entities"),
        severity: "high",
        title: "No entities (data model) defined",
        whyItMatters:
          "You can’t persist state reliably without schema and relationships.",
        fixNow:
          "Phase 2 → add core entities (User, Project, DomainEntity…) with fields.",
        phase: 2,
      });
    }

    if (!arch?.screens?.length) {
      items.push({
        id: did("arch_screens"),
        severity: "high",
        title: "No screens defined",
        whyItMatters:
          "UI flows can’t be built/refined/tested without screen definitions.",
        fixNow: "Phase 2 → define 3–8 screens mapped to core flows.",
        phase: 2,
      });
    }
  }

  // Phase 6: Test failures
  if (!tests) {
    items.push({
      id: did("tests_missing"),
      severity: "medium",
      title: "No Test Plan generated",
      whyItMatters:
        "You’re missing the QA artifact that powers scan/cockpit readiness.",
      fixNow: "Phase 6 → click Run tests to generate test_plan_json.",
      phase: 6,
    });
  } else {
    const fail = (tests.cases ?? []).filter(
      (c: any) => c.status === "virtual_fail"
    ).length;
    if (fail > 0) {
      items.push({
        id: did("tests_fail"),
        severity: fail >= 3 ? "high" : "medium",
        title: `${fail} virtual tests failing`,
        whyItMatters:
          "These failures predict real runtime issues once you deploy.",
        fixNow:
          "Phase 6 → fix missing screens/entities/apis/auth assumptions; rerun tests.",
        phase: 6,
      });
    }
  }

  // Phase 7: Scan issues
  if (!scan) {
    items.push({
      id: did("scan_missing"),
      severity: "medium",
      title: "No Smart Scan report",
      whyItMatters:
        "Scan score becomes your global standard + client trust signal.",
      fixNow: "Phase 7 → run quality scan to generate scan_report_json.",
      phase: 7,
    });
  } else {
    const critical = (scan.issues ?? []).filter(
      (i: any) => i.severity === "critical"
    ).length;
    const high = (scan.issues ?? []).filter(
      (i: any) => i.severity === "high"
    ).length;
    if (critical > 0 || high > 0) {
      items.push({
        id: did("scan_issues"),
        severity: critical > 0 ? "critical" : "high",
        title: `Scan has ${critical} critical / ${high} high issue(s)`,
        whyItMatters:
          "These are the blockers for production readiness and trust.",
        fixNow: "Phase 7 → fix High/Critical issues first, then rerun scan.",
        phase: 7,
      });
    }
  }

  // Phase 9: Docs pack presence
  const docs = (project as any).docs_pack_json ?? null;
  if (!docs) {
    items.push({
      id: did("docs_missing"),
      severity: "low",
      title: "Docs & Client Pack not generated",
      whyItMatters:
        "Docs are your delivery, onboarding, and credibility layer.",
      fixNow: "Phase 9 → generate docs pack after test+scan for best output.",
      phase: 9,
    });
  }

  // Sort by severity then phase
  const weight: Record<DiagnosticSeverity, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  items.sort((a, b) => {
    const dw = weight[a.severity] - weight[b.severity];
    if (dw !== 0) return dw;
    return a.phase - b.phase;
  });

  const summary =
    items.length === 0
      ? "No major issues detected. Looks production-ready at this level."
      : `Found ${items.length} issue(s). Fix Critical/High first.`;

  return { summary, items };
}
