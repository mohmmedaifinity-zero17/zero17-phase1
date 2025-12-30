// src/components/growth/GrowthSprintPanel.tsx
"use client";

import SprintEnginePanel from "./SprintEnginePanel";
import type {
  GrowthMasterbrainInput,
  GrowthMasterbrainOutput,
  GrowthDNAPlan,
  GrowthSprintPlan,
  GrowthSnapshot,
} from "@/lib/growth/types";

type Props = {
  input: GrowthMasterbrainInput | null;
  masterbrain: GrowthMasterbrainOutput | null;
  dna: GrowthDNAPlan | null;
  sprint: GrowthSprintPlan | null;
  snapshot: GrowthSnapshot | null;
  onSprintChange: (s: GrowthSprintPlan | null) => void;
  onSnapshotChange: (s: GrowthSnapshot | null) => void;
  onStepChange: (s: 1 | 2 | 3) => void;
};

/**
 * Thin wrapper around `SprintEnginePanel` so GrowthOverview can pass
 * richer context (input, dna, snapshot) without breaking existing sprint UI.
 * For now, we forward only the fields SprintEnginePanel needs.
 */
export default function GrowthSprintPanel({
  masterbrain,
  sprint,
  onSprintChange,
  onStepChange,
}: Props) {
  return (
    <SprintEnginePanel
      masterbrain={masterbrain}
      sprint={sprint}
      onSprintChangeAction={onSprintChange}
      onStepChangeAction={onStepChange}
    />
  );
}




























