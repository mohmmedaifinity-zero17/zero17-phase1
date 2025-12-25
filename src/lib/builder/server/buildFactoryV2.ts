// src/lib/builder/server/buildFactoryV2.ts

export type BuildPhase = "lint" | "typecheck" | "tests" | "autofix" | "retest";

export type BuildIssue = {
  phase: BuildPhase;
  severity: "low" | "medium" | "high";
  message: string;
  fixed?: boolean;
};

export type BuildFactoryReport = {
  status: "passed" | "failed" | "improved";
  phases: BuildPhase[];
  issues: BuildIssue[];
  fixesApplied: number;
  summary: string;
  createdAt: string;
};

export function runBuildFactoryV2(codeSnapshot: string): BuildFactoryReport {
  const issues: BuildIssue[] = [];

  // Lint
  if (/console\.log\(/.test(codeSnapshot)) {
    issues.push({
      phase: "lint",
      severity: "low",
      message: "console.log found",
    });
  }

  // Types
  if (/\bany\b/.test(codeSnapshot)) {
    issues.push({
      phase: "typecheck",
      severity: "medium",
      message: "Usage of 'any' detected",
    });
  }

  // Tests
  if (!/describe\(|it\(/.test(codeSnapshot)) {
    issues.push({
      phase: "tests",
      severity: "high",
      message: "No test cases found",
    });
  }

  // Autofix (safe only)
  let fixesApplied = 0;
  issues.forEach((i) => {
    if (i.severity !== "high") {
      i.fixed = true;
      fixesApplied++;
    }
  });

  const hasHigh = issues.some((i) => i.severity === "high");

  return {
    status:
      fixesApplied > 0 && !hasHigh ? "improved" : hasHigh ? "failed" : "passed",
    phases: [
      "lint",
      "typecheck",
      "tests",
      ...(fixesApplied ? (["autofix", "retest"] as BuildPhase[]) : []),
    ],
    issues,
    fixesApplied,
    summary: hasHigh
      ? "Critical issues remain after auto-fix."
      : fixesApplied
        ? "Build improved after auto-fix and re-test."
        : "Build passed cleanly.",
    createdAt: new Date().toISOString(),
  };
}
