// src/lib/helix/context.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { HelixLane, HelixState, HelixNextAction } from "./types";

const STORAGE_KEY = "zero17_helix_state_v1";

const defaultState: HelixState = {
  lane: "lab",
  progress: {
    lab: {},
    builder: {},
    launch: {},
    growth: {},
  },
  lastUpdated: null,
};

type HelixContextValue = {
  state: HelixState;
  setLane: (lane: HelixLane) => void;
  mark: (
    lane: HelixLane,
    key: keyof HelixState["progress"]["lab"],
    value: any
  ) => void;
  computeNextAction: () => HelixNextAction;
};

const HelixContext = createContext<HelixContextValue | null>(null);

function loadState(): HelixState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as HelixState;
    // Ensure all lanes exist
    return {
      lane: parsed.lane ?? "lab",
      progress: {
        lab: parsed.progress?.lab ?? {},
        builder: parsed.progress?.builder ?? {},
        launch: parsed.progress?.launch ?? {},
        growth: parsed.progress?.growth ?? {},
      },
      lastUpdated: parsed.lastUpdated ?? null,
    };
  } catch {
    return defaultState;
  }
}

function saveState(state: HelixState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/* -----------------------------------------
   HELIX PROVIDER
------------------------------------------ */

export function HelixProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<HelixState>(defaultState);

  useEffect(() => {
    const initial = loadState();
    setState(initial);
  }, []);

  useEffect(() => {
    if (!state) return;
    saveState(state);
  }, [state]);

  function setLane(lane: HelixLane) {
    setState((prev) => ({
      ...prev,
      lane,
      lastUpdated: new Date().toISOString(),
    }));
  }

  function mark(
    lane: HelixLane,
    key: keyof HelixState["progress"]["lab"],
    value: any
  ) {
    setState((prev) => ({
      ...prev,
      progress: {
        ...prev.progress,
        [lane]: {
          ...(prev.progress[lane] ?? {}),
          [key]: value,
        },
      },
      lastUpdated: new Date().toISOString(),
    }));
  }

  function computeNextAction(): HelixNextAction {
    const s = state;
    const lane = s.lane;

    if (lane === "lab") {
      const p = s.progress.lab;
      if (!p.scored) {
        return {
          title: "Run Smart Scores on your idea",
          description:
            "Score risk, opportunity and confidence in the Research Lab before you invest time building.",
          ctaLabel: "Open Research Lab",
          href: "/lab/score",
        };
      }
      if (!p.blueprint) {
        return {
          title: "Generate a Blueprint PDF",
          description:
            "Turn your validated idea into an investor-grade blueprint you can share.",
          ctaLabel: "Create Blueprint",
          href: "/lab/blueprint",
        };
      }
      return {
        title: "Send your blueprint into Builder Lab",
        description:
          "You’re validated. Now move that blueprint into Builder and start shipping.",
        ctaLabel: "Go to Builder Hub",
        href: "/builder",
      };
    }

    if (lane === "builder") {
      const p = s.progress.builder;
      if (!p.arenaChosen) {
        return {
          title: "Enter the Builder Arena",
          description:
            "Pick Speed or Strategic so Zero17 can generate your scaffold and QA.",
          ctaLabel: "Open Arena",
          href: "/builder/arena",
        };
      }
      if (!p.factoryRun) {
        return {
          title: "Run Build Factory Lite",
          description:
            "Let Zero17 auto-check your scaffold, fix obvious issues and score readiness.",
          ctaLabel: "Run Build Factory",
          href: "/builder/arena",
        };
      }
      if (!p.proofPack) {
        return {
          title: "Generate a Proof-of-Work Pack",
          description:
            "Bundle tests, checks and readiness into a single pack you can show to users or investors.",
          ctaLabel: "Create Proof Pack",
          href: "/builder/arena",
        };
      }
      return {
        title: "Prepare for Launch Preflight",
        description:
          "You’ve got a proof-backed build. Next: run Launch Engine preflight.",
        ctaLabel: "Open Launch Engine",
        href: "/launch",
      };
    }

    if (lane === "launch") {
      const p = s.progress.launch;
      if (!p.preflight) {
        return {
          title: "Run Launch Preflight",
          description:
            "Check performance, security and env variables before binding a domain.",
          ctaLabel: "Run Preflight",
          href: "/launch",
        };
      }
      if (!p.domainBound) {
        return {
          title: "Bind a custom domain",
          description:
            "Point a real domain or subdomain to your build so you look production-ready.",
          ctaLabel: "Open Domain Wizard",
          href: "/launch/domains",
        };
      }
      if (!p.live) {
        return {
          title: "Push your build live",
          description:
            "Promote from preview to live link and capture your Truth Ledger entry.",
          ctaLabel: "Finalize Launch",
          href: "/launch",
        };
      }
      return {
        title: "Move into Growth OS",
        description:
          "You’re live. Let’s turn this build into revenue with the Growth OS.",
        ctaLabel: "Open Growth OS",
        href: "/growth",
      };
    }

    // lane === "growth"
    const p = s.progress.growth;
    if (!p.offerDefined) {
      return {
        title: "Define your monetization offer",
        description:
          "Use the Monetization Foundry to decide what you sell, at what price, to whom.",
        ctaLabel: "Open Monetization Foundry",
        href: "/growth/offer",
      };
    }
    if (!p.pricingSet) {
      return {
        title: "Set pricing & packaging",
        description:
          "Use Pricing Helper to pick a smart price and plan structure for your product.",
        ctaLabel: "Open Pricing Helper",
        href: "/growth/pricing",
      };
    }
    if (!p.postsThisWeek || p.postsThisWeek < 3) {
      return {
        title: "Publish 3 proof-based posts",
        description:
          "Turn your latest progress and Proof Packs into content that attracts leads.",
        ctaLabel: "Open Growth Stream",
        href: "/growth/stream",
      };
    }
    return {
      title: "Review key metrics and iterate",
      description:
        "Check your MRR, churn and activation, then adjust your experiments.",
      ctaLabel: "Open Growth Dashboard",
      href: "/growth",
    };
  }

  const value: HelixContextValue = {
    state,
    setLane,
    mark,
    computeNextAction,
  };

  return (
    <HelixContext.Provider value={value}>{children}</HelixContext.Provider>
  );
}

/* -----------------------------------------
   HOOK
------------------------------------------ */

export function useHelix() {
  const ctx = useContext(HelixContext);
  if (!ctx) {
    throw new Error("useHelix must be used within HelixProvider");
  }
  return ctx;
}
