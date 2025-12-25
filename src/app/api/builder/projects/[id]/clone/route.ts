// src/app/api/builder/projects/[id]/clone/route.ts
import { NextResponse } from "next/server";
import { getUserIdOrDev } from "@/lib/builder/server/auth";
import { devCloneProject } from "@/lib/builder/server/store";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, ctx: { params: { id: string } }) {
  const { userId } = await getUserIdOrDev();
  const id = ctx.params.id;

  try {
    const project = devCloneProject(userId, id);
    return NextResponse.json({ project }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Failed to fork project" },
      { status: 500 }
    );
  }
}
