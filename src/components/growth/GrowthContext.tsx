// src/components/growth/GrowthContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

export type GrowthGoal =
  | "Awareness"
  | "Leads"
  | "Sales"
  | "Retention"
  | "Activation";

export type PlanDay = {
  day: number;
  title: string;
  summary: string;
  channels: string[];
  metric: string;
};

export type GrowthConfig = {
  goal: GrowthGoal;
  icp: string;
  offer: string;
  budget: number;
  primaryMetric: string;
  primaryAngle: string;
  angles?: {
    clarity: string;
    premium: string;
    bold: string;
    contrarian: string;
  };
  plan: PlanDay[] | null;
};

type GrowthContextValue = {
  config: GrowthConfig;
  setConfig: Dispatch<SetStateAction<GrowthConfig>>;
};

const defaultConfig: GrowthConfig = {
  goal: "Leads",
  icp: "",
  offer: "",
  budget: 500,
  primaryMetric: "Cost per lead",
  primaryAngle: "",
  angles: undefined,
  plan: null,
};

const GrowthContext = createContext<GrowthContextValue | undefined>(undefined);

export function GrowthProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<GrowthConfig>(defaultConfig);

  return (
    <GrowthContext.Provider value={{ config, setConfig }}>
      {children}
    </GrowthContext.Provider>
  );
}

export function useGrowthConfig() {
  const ctx = useContext(GrowthContext);
  if (!ctx) {
    throw new Error("useGrowthConfig must be used within GrowthProvider");
  }
  return ctx;
}
