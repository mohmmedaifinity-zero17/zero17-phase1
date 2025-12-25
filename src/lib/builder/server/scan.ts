// src/lib/builder/server/scan.ts

export type ScanIssue = {
  type: string;
  found: boolean;
  advice: string;
  severity: "low" | "medium" | "high";
};

export type ScanResult = {
  status: "ok";
  message: string;
  score: number;
  issues: ScanIssue[];
  recommendations: string[];
  meta: {
    bytes: number;
    lines: number;
    createdAt: string;
  };
};

export function runSecurityScan(code: string): ScanResult {
  const bytes = Buffer.byteLength(code ?? "", "utf8");
  const lines = (code ?? "").split("\n").length;

  // Heuristics (stub but structured + extensible)
  const hasSecret = /API[_-]?KEY|SECRET|TOKEN|BEARER\s+[A-Za-z0-9\-_]+\./i.test(
    code
  );
  const hasHttp = /http:\/\//i.test(code);
  const hasDangerousHtml = /dangerouslySetInnerHTML/i.test(code);
  const hasEval = /\beval\s*\(/i.test(code);

  const issues: ScanIssue[] = [
    {
      type: "Hardcoded secrets",
      found: hasSecret,
      advice: "Move secrets to env vars; never commit keys.",
      severity: "high",
    },
    {
      type: "Insecure protocol (http)",
      found: hasHttp,
      advice: "Use https for external calls.",
      severity: "medium",
    },
    {
      type: "Unsafe HTML injection",
      found: hasDangerousHtml,
      advice: "Avoid dangerouslySetInnerHTML or strictly sanitize input.",
      severity: "high",
    },
    {
      type: "Dynamic code execution",
      found: hasEval,
      advice: "Avoid eval(). Use safe parsers and explicit logic.",
      severity: "high",
    },
    {
      type: "XSS risk (general)",
      found: false,
      advice: "Escape user-generated HTML; validate inputs; encode outputs.",
      severity: "medium",
    },
  ];

  // score calculation: weighted by severity
  const severityWeight: Record<ScanIssue["severity"], number> = {
    low: 4,
    medium: 8,
    high: 14,
  };

  const penalty = issues
    .filter((i) => i.found)
    .reduce((sum, i) => sum + severityWeight[i.severity], 0);

  const score = Math.max(55, Math.min(99, 99 - penalty));

  return {
    status: "ok",
    message: "Security scan complete (stub)",
    score,
    issues,
    recommendations: [
      "Add Content-Security-Policy headers",
      "Turn on TypeScript strict mode",
      "Audit external packages monthly",
      "Add server-side input validation (zod) for all user inputs",
    ],
    meta: {
      bytes,
      lines,
      createdAt: new Date().toISOString(),
    },
  };
}
