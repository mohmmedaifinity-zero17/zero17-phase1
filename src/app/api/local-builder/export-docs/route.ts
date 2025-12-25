// src/app/api/local-builder/export-docs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

/**
 * Simple docs bundle type (matches Builder Lab client)
 */
interface DocsBundle {
  readme: string;
  architecture: string;
  runbook: string;
}

interface ExportDocsBody {
  rootDir: string;
  projectTitle?: string;
  docs: DocsBundle;
}

/**
 * Basic safety check so we don't write in crazy places.
 * You can adjust this to match your real local-builder root.
 */
function isSafeRoot(rootDir: string) {
  // Allow writing only under the current working directory
  const cwd = process.cwd();
  const resolved = path.resolve(rootDir);
  return resolved.startsWith(cwd);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ExportDocsBody;

    if (!body || !body.rootDir || !body.docs) {
      return NextResponse.json(
        { ok: false, error: "Missing rootDir or docs in body." },
        { status: 400 }
      );
    }

    const { rootDir, docs, projectTitle } = body;

    if (!isSafeRoot(rootDir)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Refusing to write docs outside of the current project directory.",
        },
        { status: 400 }
      );
    }

    const repoRoot = path.resolve(rootDir);

    const readmePath = path.join(repoRoot, "README.md");
    const archPath = path.join(repoRoot, "ARCHITECTURE.md");
    const runbookPath = path.join(repoRoot, "RUNBOOK.md");

    const titleHeader = projectTitle ? `# ${projectTitle}\n\n` : "";

    await fs.mkdir(repoRoot, { recursive: true });

    await fs.writeFile(readmePath, titleHeader + docs.readme, "utf8");
    await fs.writeFile(archPath, docs.architecture, "utf8");
    await fs.writeFile(runbookPath, docs.runbook, "utf8");

    return NextResponse.json(
      {
        ok: true,
        readmePath,
        archPath,
        runbookPath,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[/api/local-builder/export-docs] error:", err);
    return NextResponse.json(
      {
        ok: false,
        error:
          err?.message ||
          "Unexpected error while exporting docs to the generated repo.",
      },
      { status: 500 }
    );
  }
}
