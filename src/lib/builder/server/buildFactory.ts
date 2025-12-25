// src/lib/builder/server/buildFactory.ts

export type FactoryPhase =
  | "lint"
  | "typecheck"
  | "tests"
  | "autofix"
  | "retest";

export type FactoryIssue = {
  phase: FactoryPhase;
  message: string;
  severity: "low" | "medium" | "high";
};

export type FactoryReport = {
  status: "passed" | "failed" | "improved";
  phases: FactoryPhase[];
  issues: FactoryIssue[];
  autofixApplied: boolean;
  summary: string;
  createdAt: string;
};

/**
 * Deterministic Build Factory Lite
 * NOTE: Stubbed heuristics — structured for real runners later.
 */
export function runBuildFactoryLite(projectSnapshot: string): FactoryReport {
  const issues: FactoryIssue[] = [];

  // ── Phase 1: Lint
  if (/console\.log\(/i.test(projectSnapshot)) {
    issues.push({
      phase: "lint",
      message: "console.log found in production code",
      severity: "low",
    });
  }

  // ── Phase 2: Typecheck
  if (/\bany\b/.test(projectSnapshot)) {
    issues.push({
      phase: "typecheck",
      message: "`any` type detected",
      severity: "medium",
    });
  }

  // ── Phase 3: Tests
  if (!/describe\(|it\(/.test(projectSnapshot)) {
    issues.push({
      phase: "tests",
      message: "No test cases detected",
      severity: "high",
    });
  }

  // Decide if autofix is allowed
  const canAutofix = issues.some(
    (i) => i.severity === "low" || i.severity === "medium"
  );

  let autofixApplied = false;

  if (canAutofix) {
    autofixApplied = true;

    // Simulated fixes (safe + explainable)
    issues
      .filter((i) => i.severity !== "high")
      .forEach((i) => {
        i.message += " (auto-fix applied)";
      });
  }

  const highSeverityLeft = issues.some((i) => i.severity === "high");

  return {
    status:
      autofixApplied && !highSeverityLeft
        ? "improved"
        : highSeverityLeft
          ? "failed"
          : "passed",
    phases: [
      "lint",
      "typecheck",
      "tests",
      ...(autofixApplied ? (["autofix", "retest"] as FactoryPhase[]) : []),
    ],
    issues,
    autofixApplied,
    summary: autofixApplied
      ? "Build improved with one safe auto-fix pass."
      : highSeverityLeft
        ? "Build failed due to critical issues."
        : "Build passed without fixes.",
    createdAt: new Date().toISOString(),
  };
}
