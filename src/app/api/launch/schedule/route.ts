import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { contact } = await req.json().catch(() => ({ contact: null }));
    const today = new Date();
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i + 1); // next 7 days
      d.setHours(9, 0, 0, 0);
      return d.toISOString();
    });

    return NextResponse.json({
      status: "ok",
      schedule: {
        contact: contact || "not-set",
        cadence: "daily",
        time: "09:00 local",
        nextRuns: days,
        note: "Stub scheduler—persisting & notifications come in Phase-2.",
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { status: "error", error: e?.message ?? "unknown" },
      { status: 500 }
    );
  }
}
