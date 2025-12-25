import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { variant, projectName } = body;

    // === Step 1: Generate scaffold (files in-memory) ===
    const scaffold = await generateScaffold(variant, projectName);

    // === Step 2: Run checks on scaffold ===
    const firstCheck = await runChecks(scaffold);

    // === If issues exist → Auto-fix → Re-check ===
    let final = firstCheck;
    let appliedFixes: string[] = [];

    if (firstCheck.hasIssues) {
      const fixed = await autoFix(scaffold, firstCheck);
      appliedFixes = fixed.fixes;
      final = await runChecks(fixed.output);
    }

    return NextResponse.json(
      {
        projectName,
        variant,
        appliedFixes,
        checks: final,
        readiness:
          (final.perf + final.a11y + final.security + final.codeQuality) / 4,
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message ?? "Factory failed" },
      { status: 500 }
    );
  }
}

/* ---------------------------------------------------
   DUMMY IMPLEMENTATIONS FOR NOW — Safe & Deterministic
   (You will later inject GPT-5 calls for real AI logic)
--------------------------------------------------- */

async function generateScaffold(variant: string, projectName: string) {
  return {
    "/index.tsx": `<div>${projectName} - ${variant} variant</div>`,
    "/utils.ts": `export const hello = () => "Hello";`,
  };
}

async function runChecks(scaffold: any) {
  const issues = ["Missing aria-label", "Long function detected"];

  return {
    hasIssues: true,
    perf: 82,
    a11y: 76,
    security: 88,
    codeQuality: 70,
    issues,
  };
}

async function autoFix(scaffold: any, checkResult: any) {
  const fixes = ["Added aria-label", "Refactored long function"];

  return {
    fixes,
    output: {
      ...scaffold,
      "/index.tsx": scaffold["/index.tsx"] + `\n<!-- auto-fixed -->`,
    },
  };
}
