import { NextResponse } from "next/server";
import { getUserContext } from "@/app/api/builder/_shared";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId, isAuthed, isDemo } = await getUserContext();
  return NextResponse.json(
    { isAuthed, isDemo, userId: userId ?? null },
    { status: 200 }
  );
}

