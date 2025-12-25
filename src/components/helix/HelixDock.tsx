// src/components/helix/HelixDock.tsx
"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

/**
 * Floating Helix button (bottom-right).
 * - Does NOT block clicks anywhere else (no full-screen overlay).
 * - Big, premium gradient pill like before.
 */
export default function HelixDock() {
  const router = useRouter();

  return (
    <motion.button
      type="button"
      onClick={() => router.push("/helix")}
      className="fixed bottom-4 right-4 z-40 inline-flex items-center justify-center rounded-full bg-gradient-to-br from-sky-500 via-emerald-400 to-amber-300 px-5 py-2.5 text-[11px] font-semibold text-slate-950 shadow-2xl hover:brightness-110 active:scale-[0.97] cursor-pointer"
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18 }}
    >
      <span className="mr-1.5 text-sm">✨</span>
      Helix · Global Brain
    </motion.button>
  );
}
