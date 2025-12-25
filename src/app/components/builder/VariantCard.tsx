"use client";
import React from "react";

export default function VariantCard({
  name,
  description,
  onSelectAction,
  selected,
}: {
  name: "speed" | "strategic";
  description: string;
  onSelectAction: (v: "speed" | "strategic") => void;
  selected: boolean;
}) {
  return (
    <button
      onClick={() => onSelectAction(name)}
      className={`text-left rounded-2xl border p-5 transition ${
        selected ? "ring-2 ring-black bg-white" : "hover:bg-white/60"
      }`}
    >
      <div className="text-xs uppercase text-zinc-500">Variant</div>
      <div className="text-xl font-bold capitalize">{name}</div>
      <p className="mt-2 text-sm text-zinc-600">{description}</p>
    </button>
  );
}
