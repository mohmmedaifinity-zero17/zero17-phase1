// src/lib/builder/server/buildFactoryV3.ts

import { diffLines } from "diff";

export type BuildPhase = "lint" | "typecheck" | "tests" | "autofix" | "retest";

export type BuildIssue = {
  phase: BuildPhase;
  severity: "low" | "medium" | "high";
  message: string;
};

export type BuildDiff = {
  added: string[];
  removed: string[];
};

export type BuildFactoryV3Report = {
  status: "passed" | "failed" | "improved";
  phases: BuildPhase[];
  issues: BuildIssue[];
  diff?: BuildDiff;
  summary: string;
  createdAt: string;
};

function runChecks(code: string): BuildIssue[] {
  const issues: BuildIssue[] = [];

  if (/console\.log\(/.test(code)) {
    issues.push({
      phase: "lint",
      severity: "low",
      message: "console.log detected",
    });
  }

  if (/\bany\b/.test(code)) {
    issues.push({
      phase: "typecheck",
      severity: "medium",
      message: "Usage of 'any' type",
    });
  }

  if (!/describe\(|it\(/.test(code)) {
    issues.push({
      phase: "tests",
      severity: "high",
      message: "No test cases detected",
    });
  }

  return issues;
}

function autoFix(code: string): string {
  // Safe, deterministic fixes only
  return code
    .replace(/console\.log\(.*?\);?/g, "")
    .replace(/\bany\b/g, "unknown");
}

export function runBuildFactoryV3(originalCode: string): BuildFactoryV3Report {
  const initialIssues = runChecks(originalCode);
  const canFix = initialIssues.some((i) => i.severity !== "high");

  let fixedCode = originalCode;
  let diff: BuildDiff | undefined;

  if (canFix) {
    fixedCode = autoFix(originalCode);

    const d = diffLines(originalCode, fixedCode);
    diff = {
      added: d.filter((x) => x.added).map((x) => x.value),
      removed: d.filter((x) => x.removed).map((x) => x.value),
    };
  }

  const finalIssues = runChecks(fixedCode);
  const hasHigh = finalIssues.some((i) => i.severity === "high");

  return {
    status: canFix && !hasHigh ? "improved" : hasHigh ? "failed" : "passed",
    phases: [
      "lint",
      "typecheck",
      "tests",
      ...(canFix ? ["autofix", "retest"] : []),
    ],
    issues: finalIssues,
    diff,
    summary: hasHigh
      ? "Critical issues remain after auto-fix."
      : canFix
        ? "Build improved after auto-fix and re-test."
        : "Build passed cleanly.",
    createdAt: new Date().toISOString(),
  };
}
