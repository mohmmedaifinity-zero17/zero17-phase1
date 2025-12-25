import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient(cookies());

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 200 }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      user: user ? { id: user.id, email: user.email } : null,
    },
    { status: 200 }
  );
}
