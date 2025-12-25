// src/components/research/ResearchLayoutClient.tsx
"use client";

import type { ReactNode } from "react";
import { ResearchProvider } from "@/components/research/ResearchContext";

export function ResearchLayoutClient({ children }: { children: ReactNode }) {
  return <ResearchProvider>{children}</ResearchProvider>;
}
