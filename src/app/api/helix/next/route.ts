import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tone = (searchParams.get("tone") ?? "beginner").toLowerCase() as
    | "beginner"
    | "pro";

  const common = [
    {
      label: "Refactor (improve code)",
      href: "/builder?action=refactor",
      reason: "Tighten structure before shipping.",
    },
    {
      label: "Security Scan",
      href: "/builder?action=scan",
      reason: "Catch obvious risks (secrets, XSS, etc).",
    },
    {
      label: "Deploy preview",
      href: "/builder?action=deploy",
      reason: "Get a live preview URL to test.",
    },
    {
      label: "Launch assets",
      href: "/launch",
      reason: "Generate copy & proof-of-work pack.",
    },
  ];

  const steps =
    tone === "pro"
      ? [
          {
            label: "Back to Research Lab",
            href: "/lab",
            reason: "Re-check signals quickly.",
          },
          ...common,
        ]
      : [
          {
            label: "Start in Research Lab",
            href: "/lab",
            reason: "We’ll guide you step-by-step.",
          },
          ...common,
        ];

  return NextResponse.json({ steps, tone });
}
