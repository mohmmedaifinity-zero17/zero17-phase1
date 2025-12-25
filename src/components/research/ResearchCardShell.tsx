// src/components/research/ResearchCardShell.tsx
"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant =
  | "origin"
  | "insight"
  | "reality"
  | "synthesis"
  | "mirror"
  | "scores"
  | "risk"
  | "whatIf"
  | "blueprint"
  | "memory";

interface Props {
  variant: Variant;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  headerRight?: ReactNode;
}

export default function ResearchCardShell({
  variant,
  title,
  subtitle,
  children,
  className,
  headerRight,
}: Props) {
  const palette = getVariantClasses(variant);

  return (
    <section
      className={cn(
        "rounded-2xl border shadow-sm transition-colors",
        "backdrop-blur-sm",
        palette.border,
        palette.bg,
        className
      )}
    >
      {(title || subtitle || headerRight) && (
        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-white/5 px-4 pb-2 pt-3">
          <div className="space-y-0.5">
            {title && (
              <h2 className={cn("text-sm font-semibold", palette.title)}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className={cn("text-[10px] leading-snug", palette.subtitle)}>
                {subtitle}
              </p>
            )}
          </div>
          {headerRight && (
            <div className="flex items-center gap-2">{headerRight}</div>
          )}
        </div>
      )}

      <div className="px-4 py-3">{children}</div>
    </section>
  );
}

function getVariantClasses(variant: Variant) {
  switch (variant) {
    case "origin":
      return {
        bg: "bg-slate-950/95",
        border: "border-sky-500/40",
        title: "text-sky-50",
        subtitle: "text-slate-300",
      };
    case "insight":
      return {
        bg: "bg-gradient-to-br from-slate-950/95 via-sky-950/80 to-slate-950/95",
        border: "border-sky-400/50",
        title: "text-sky-50",
        subtitle: "text-slate-300",
      };
    case "reality":
      return {
        bg: "bg-gradient-to-br from-emerald-950/95 via-slate-950/95 to-slate-950/95",
        border: "border-emerald-400/60",
        title: "text-emerald-50",
        subtitle: "text-emerald-100/80",
      };
    case "synthesis":
      return {
        bg: "bg-gradient-to-br from-violet-950/95 via-slate-950/95 to-slate-950/95",
        border: "border-violet-400/60",
        title: "text-violet-50",
        subtitle: "text-violet-100/80",
      };
    case "mirror":
      return {
        bg: "bg-slate-950/95",
        border: "border-indigo-400/50",
        title: "text-indigo-50",
        subtitle: "text-slate-300",
      };
    case "scores":
      return {
        bg: "bg-slate-950/95",
        border: "border-emerald-400/50",
        title: "text-emerald-50",
        subtitle: "text-slate-300",
      };
    case "risk":
      return {
        bg: "bg-gradient-to-br from-rose-950/95 via-slate-950/95 to-slate-950/95",
        border: "border-rose-400/60",
        title: "text-rose-50",
        subtitle: "text-rose-100/80",
      };
    case "whatIf":
      return {
        bg: "bg-slate-950/95",
        border: "border-sky-400/50",
        title: "text-sky-50",
        subtitle: "text-slate-300",
      };
    case "blueprint":
      return {
        bg: "bg-slate-950/95",
        border: "border-slate-600/60",
        title: "text-slate-50",
        subtitle: "text-slate-300",
      };
    case "memory":
      return {
        bg: "bg-slate-950/95",
        border: "border-amber-400/60",
        title: "text-amber-50",
        subtitle: "text-amber-100/80",
      };
    default:
      return {
        bg: "bg-slate-950/95",
        border: "border-slate-700",
        title: "text-slate-50",
        subtitle: "text-slate-300",
      };
  }
}
