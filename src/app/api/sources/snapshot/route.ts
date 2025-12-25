import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  return NextResponse.json({
    title: "Dummy Source Title",
    quotes: [
      "This is a fake quote about your idea.",
      "Another placeholder citation for demo purposes.",
    ],
  });
}
