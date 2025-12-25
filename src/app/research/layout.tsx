// src/app/research/layout.tsx
import type { ReactNode } from "react";
import { ResearchLayoutClient } from "@/components/research/ResearchLayoutClient";

export default function ResearchLayout({ children }: { children: ReactNode }) {
  // This wraps all /research pages (including /qie, /atomic, /sim, etc)
  // with the ResearchProvider via the client wrapper.
  return <ResearchLayoutClient>{children}</ResearchLayoutClient>;
}
