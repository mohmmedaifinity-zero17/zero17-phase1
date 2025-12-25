// src/components/research/ResearchContext.tsx
"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type ResearchContextValue = {
  idea: string;
  icp: string;
  stage: string;
  setIdea: (v: string) => void;
  setIcp: (v: string) => void;
  setStage: (v: string) => void;
};

const ResearchContext = createContext<ResearchContextValue | null>(null);

export function ResearchProvider({ children }: { children: ReactNode }) {
  const [idea, setIdea] = useState("");
  const [icp, setIcp] = useState("");
  const [stage, setStage] = useState("pre-idea");

  const value: ResearchContextValue = {
    idea,
    icp,
    stage,
    setIdea,
    setIcp,
    setStage,
  };

  return (
    <ResearchContext.Provider value={value}>
      {children}
    </ResearchContext.Provider>
  );
}

export function useResearch(): ResearchContextValue {
  const ctx = useContext(ResearchContext);
  if (!ctx) {
    throw new Error("useResearch must be used inside ResearchProvider");
  }
  return ctx;
}
