// src/lib/builder/server/refactor.ts

export type RefactorResult = {
  status: "ok";
  message: string;
  summary: {
    functionsDetected: number;
    importsDetected: number;
    deadCodeRemoved: number;
    complexityHint: "low" | "medium" | "high";
  };
  suggestions: string[];
  updatedCode: string;
  meta: {
    createdAt: string;
  };
};

export function runRefactorStub(code: string): RefactorResult {
  const src = code ?? "";
  const lines = src.split("\n");

  const fnCount = lines.filter((l) =>
    /function\s|\)\s*=>|=>\s*{/.test(l)
  ).length;
  const imports = lines.filter((l) => /^import\s/.test(l)).length;

  const complexityHint: RefactorResult["summary"]["complexityHint"] =
    fnCount >= 25 ? "high" : fnCount >= 12 ? "medium" : "low";

  return {
    status: "ok",
    message: "Refactor complete (stub)",
    summary: {
      functionsDetected: fnCount,
      importsDetected: imports,
      deadCodeRemoved: Math.max(0, Math.floor(imports / 3) - 1),
      complexityHint,
    },
    suggestions: [
      "Replace `any` with explicit types where possible",
      "Extract reusable UI parts into components/",
      "Prefer early returns to reduce nesting",
      "Group domain logic under /services or /lib",
      "Co-locate tests next to modules for faster iteration",
    ],
    updatedCode: src
      ? `// === Refactored Preview (stub) ===
  /**
   * Notes:
   * - This is a preview-only stub (no real AST transform yet).
   * - Next step: add a real refactor engine with patch sets + approval.
   */
  ${src.slice(0, 450)}
  // ...`
      : "// No input code provided — nothing to refactor",
    meta: { createdAt: new Date().toISOString() },
  };
}
