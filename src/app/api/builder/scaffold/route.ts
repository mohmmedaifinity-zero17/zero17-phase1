import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import JSZip from "jszip";

type Body = { variant: "speed" | "strategic"; projectName: string };

const readDirectoryIntoZip = async ({
  dir,
  zip,
  base = "",
}: {
  dir: string;
  zip: JSZip;
  base?: string;
}) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(base, entry.name);

    if (entry.isDirectory()) {
      await readDirectoryIntoZip({ dir: fullPath, zip, base: relativePath });
    } else {
      const fileBuffer = await fs.readFile(fullPath);
      zip.file(relativePath, fileBuffer);
    }
  }
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;
    if (!body?.variant || !body?.projectName) {
      return NextResponse.json(
        { error: "variant and projectName required" },
        { status: 400 }
      );
    }

    const root = process.cwd();
    const srcDir = path.join(root, "templates", body.variant);

    const zip = new JSZip();
    await readDirectoryIntoZip({ dir: srcDir, zip });

    const zipped = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
    });
    const uint8Array = new Uint8Array(zipped);
    const blob = new Blob([uint8Array]);

    const headers = new Headers({
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${body.projectName}-${body.variant}-scaffold.zip"`,
    });
    return new NextResponse(blob, { status: 200, headers });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "scaffold failed" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
