// src/lib/builder/cockpit-metrics.ts

import type { BuilderProject } from "@/lib/builder/types";

export type ReadinessBadge = "red" | "amber" | "green";

export type CockpitMetrics = {
  projectId: string;
  title: string;
  buildType: string;
  status: string;

  spec: {
    score: number; // 0-100
    missing: string[];
  };

  architecture: {
    score: number; // 0-100
    missing: string[];
    counts: {
      screens: number;
      entities: number;
      apis: number;
    };
  };

  tests: {
    score: number; // 0-100
    total: number;
    pass: number;
    fail: number;
    notRun: number;
    missing: string[];
  };

  scan: {
    score: number; // 0-100
    issues: number;
    missing: string[];
  };

  overall: {
    score: number; // 0-100
    badge: ReadinessBadge;
    nextBestActions: string[];
  };
};

function clamp0to100(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function badgeFromScore(score: number): ReadinessBadge {
  if (score >= 80) return "green";
  if (score >= 60) return "amber";
  return "red";
}

function safeLen(v: any): number {
  if (!v) return 0;
  if (Array.isArray(v)) return v.length;
  return 0;
}

export function computeCockpitMetrics(project: BuilderProject): CockpitMetrics {
  const spec = project.spec_json as any;
  const arch = project.architecture_json as any;
  const tests = project.test_plan_json as any;
  const scan = project.scan_report_json as any;

  // ---------------- Spec score ----------------
  const specMissing: string[] = [];
  let specScore = 100;

  const founderProblem = spec?.founderLens?.problem?.trim();
  if (!founderProblem) {
    specScore -= 20;
    specMissing.push("Founder Lens: problem statement");
  }

  const founderUsers = safeLen(spec?.founderLens?.users);
  if (founderUsers === 0) {
    specScore -= 10;
    specMissing.push("Founder Lens: target users");
  }

  const coreFlows = safeLen(spec?.founderLens?.coreFlows);
  if (coreFlows === 0) {
    specScore -= 15;
    specMissing.push("Founder Lens: core flows");
  } else if (coreFlows < 2) {
    specScore -= 6;
    specMissing.push("Founder Lens: add 1–2 more core flows");
  }

  const acceptance = safeLen(spec?.qaLens?.acceptanceTests);
  if (acceptance === 0) {
    specScore -= 20;
    specMissing.push("QA Lens: acceptance tests (3–10)");
  } else if (acceptance < 3) {
    specScore -= 8;
    specMissing.push("QA Lens: acceptance tests are thin (<3)");
  }

  const clientGet = safeLen(spec?.clientLens?.whatYouGet);
  if (clientGet === 0) {
    specScore -= 8;
    specMissing.push("Client Lens: what you get");
  }

  const roi = spec?.clientLens?.roiNarrative?.trim();
  if (!roi) {
    specScore -= 5;
    specMissing.push("Client Lens: ROI narrative");
  }

  const isAgentBuild =
    project.build_type === "agent" || safeLen(spec?.agentLens?.agents) > 0;

  if (isAgentBuild) {
    const agents = safeLen(spec?.agentLens?.agents);
    if (agents === 0) {
      specScore -= 12;
      specMissing.push("Agent Lens: define at least 1 agent");
    }
  }

  specScore = clamp0to100(specScore);

  // ---------------- Architecture score ----------------
  const archMissing: string[] = [];
  let archScore = 100;

  const screens = safeLen(arch?.screens);
  const entities = safeLen(arch?.entities);
  const apis = safeLen(arch?.apis);

  if (!arch) {
    archScore = 0;
    archMissing.push("Architecture Map missing");
  } else {
    if (screens === 0) {
      archScore -= 25;
      archMissing.push("Architecture: screens");
    }

    if (entities === 0) {
      archScore -= 20;
      archMissing.push("Architecture: entities (data model)");
    }

    if (apis === 0) {
      archScore -= 10;
      archMissing.push("Architecture: APIs (if not UI-only)");
    }

    const authProvider = arch?.infra?.authProvider;
    if (!authProvider || authProvider === "none") {
      archScore -= 15;
      archMissing.push("Infra: auth provider");
    }

    const database = arch?.infra?.database;
    if (!database) {
      archScore -= 10;
      archMissing.push("Infra: database");
    }

    const hosting = arch?.infra?.hosting;
    if (!hosting) {
      archScore -= 8;
      archMissing.push("Infra: hosting target");
    }
  }

  archScore = clamp0to100(archScore);

  // ---------------- Tests score ----------------
  const testsMissing: string[] = [];
  let testTotal = 0;
  let testPass = 0;
  let testFail = 0;
  let testNotRun = 0;
  let testsScore = 0;

  if (!tests || !Array.isArray(tests?.cases)) {
    testsMissing.push("No Test Plan (run Phase 6)");
    testsScore = 0;
  } else {
    testTotal = tests.cases.length;
    testPass = tests.cases.filter(
      (c: any) => c.status === "virtual_pass"
    ).length;
    testFail = tests.cases.filter(
      (c: any) => c.status === "virtual_fail"
    ).length;
    testNotRun = tests.cases.filter((c: any) => c.status === "not_run").length;

    // Signal score: pass=1, not_run=0.5, fail=0
    const raw = testTotal === 0 ? 0 : (testPass + 0.5 * testNotRun) / testTotal;
    testsScore = clamp0to100(raw * 100);

    if (testFail > 0) {
      testsMissing.push(`${testFail} failing virtual tests`);
    }
  }

  // ---------------- Scan score ----------------
  const scanMissing: string[] = [];
  let scanScore = 0;
  let scanIssues = 0;

  if (!scan) {
    scanMissing.push("No Scan Report (run Phase 7)");
    scanScore = 0;
  } else {
    scanScore = clamp0to100(scan.score ?? 0);
    scanIssues = safeLen(scan.issues);
  }

  // ---------------- Overall score ----------------
  // Weighting: spec 25, arch 30, tests 20, scan 25
  const overallScore = clamp0to100(
    specScore * 0.25 + archScore * 0.3 + testsScore * 0.2 + scanScore * 0.25
  );

  const nextBestActions: string[] = [];

  // Priority actions (tight + deterministic)
  if (!arch) nextBestActions.push("Generate Architecture Map (Phase 2)");
  if (specMissing.length > 0) nextBestActions.push("Fill Spec gaps (Phase 1)");
  if (archMissing.length > 0)
    nextBestActions.push("Fix Architecture gaps (Phase 2)");
  if (!tests) nextBestActions.push("Run Auto-Test Engine (Phase 6)");
  if (!scan) nextBestActions.push("Run Smart Scan (Phase 7)");
  if (testFail > 0)
    nextBestActions.push("Resolve failing virtual tests (Phase 6)");
  if (scanIssues > 0) nextBestActions.push("Address Scan issues (Phase 7)");

  // De-dupe and cap
  const deduped = Array.from(new Set(nextBestActions)).slice(0, 6);

  return {
    projectId: project.id,
    title: project.title,
    buildType: project.build_type,
    status: project.status,

    spec: {
      score: specScore,
      missing: specMissing,
    },

    architecture: {
      score: archScore,
      missing: archMissing,
      counts: {
        screens,
        entities,
        apis,
      },
    },

    tests: {
      score: testsScore,
      total: testTotal,
      pass: testPass,
      fail: testFail,
      notRun: testNotRun,
      missing: testsMissing,
    },

    scan: {
      score: scanScore,
      issues: scanIssues,
      missing: scanMissing,
    },

    overall: {
      score: overallScore,
      badge: badgeFromScore(overallScore),
      nextBestActions: deduped,
    },
  };
}
