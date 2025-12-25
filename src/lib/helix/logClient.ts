// src/lib/helix/logClient.ts

export type HelixEventKind =
  | "research"
  | "growth"
  | "builder"
  | "launch"
  | "sprint"
  | "decision"
  | string;

export async function logHelixEvent(args: {
  source: "research" | "builder" | "launch" | "growth" | string;
  kind: HelixEventKind;
  title: string;
  summary: string;
  metadata?: Record<string, any>;
  nextMoveSummary?: string;
}) {
  try {
    const res = await fetch("/api/helix/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });

    if (!res.ok) {
      console.error("[Helix] log failed", await res.text());
    }
  } catch (err) {
    console.error("[Helix] log failed", err);
  }
}
