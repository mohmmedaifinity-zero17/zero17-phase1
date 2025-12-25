// src/lib/helix/helixEvents.ts
export type HelixNextMovePayload = {
  source: "research" | "builder" | "launch" | "growth" | string;
  summary: string;
  createdAt?: string;
};

const EVENT_NAME = "z17:helixNextMove";

/**
 * Fire a browser event so HelixPill can update
 * whenever Research / Builder / Launch / Growth commits a serious move.
 */
export function sendHelixNextMove(payload: HelixNextMovePayload) {
  if (typeof window === "undefined") return;

  const enriched: Required<HelixNextMovePayload> = {
    ...payload,
    createdAt: payload.createdAt ?? new Date().toISOString(),
  };

  window.dispatchEvent(
    new CustomEvent(EVENT_NAME, {
      detail: enriched,
    })
  );
}
