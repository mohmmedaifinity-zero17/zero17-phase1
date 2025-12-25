// src/app/api/builder/projects/route.ts
import { NextResponse } from "next/server";
import type { BuilderBuildType, BuilderProject } from "@/lib/builder/types";
import { requireUserOrDemo } from "@/app/api/builder/_shared";

export const dynamic = "force-dynamic";

type Body = {
  title?: string;
  description?: string | null;
  build_type?: string;
};

function normalizeKind(build_type?: string): BuilderBuildType {
  const t = (build_type ?? "app").toString().trim();
  return (
    ["app", "agent", "dashboard", "workflow"].includes(t) ? t : "app"
  ) as BuilderBuildType;
}

export async function POST(req: Request) {
  const { supabase, userId } = await requireUserOrDemo();

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const title = (body?.title ?? "").toString().trim();
  if (!title)
    return NextResponse.json({ error: "Missing title" }, { status: 400 });

  const kind = normalizeKind(body?.build_type);
  const description = (body?.description ?? "").toString();

  // ✅ MINIMAL INSERT (only columns we *must* have)
  const insertRow: any = {
    user_id: userId, // uuid
    title, // text
    description, // text (or nullable)
    kind, // text
    status: "draft", // text
  };

  const { data, error: insErr } = await supabase
    .from("builder_projects")
    .insert(insertRow)
    .select("*")
    .single();

  if (insErr) {
    console.error("[POST /api/builder/projects] insert error:", insErr);

    // ✅ show real error locally to stop the loop
    const isDev = process.env.NODE_ENV !== "production";
    return NextResponse.json(
      {
        error: "Failed to create project",
        ...(isDev
          ? {
              supabase: {
                message: insErr.message,
                code: insErr.code,
                details: (insErr as any).details,
                hint: (insErr as any).hint,
              },
            }
          : {}),
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { project: data as BuilderProject },
    { status: 200 }
  );
}
