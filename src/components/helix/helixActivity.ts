// src/components/helix/helixActivity.ts

export type HelixActivity = {
  path: string;
  ts: string; // ISO timestamp
};

const KEY = "z17-helix-activity";

export function recordHelixLocation(path: string) {
  if (typeof window === "undefined") return;
  try {
    const event: HelixActivity = {
      path,
      ts: new Date().toISOString(),
    };
    window.localStorage.setItem(KEY, JSON.stringify(event));
  } catch {
    // ignore
  }
}

export function loadHelixLocation(): HelixActivity | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as HelixActivity;
  } catch {
    return null;
  }
}
