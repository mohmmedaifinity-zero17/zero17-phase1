"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type ViewState =
  | { mode: "loading" }
  | { mode: "signed_out" }
  | { mode: "signed_in"; email: string };

export default function GlobalAuthBar() {
  const supabase = createClientComponentClient();
  const [state, setState] = useState<ViewState>({ mode: "loading" });

  useEffect(() => {
    let mounted = true;

    async function boot() {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;

      const email = data.user?.email ?? null;
      setState(email ? { mode: "signed_in", email } : { mode: "signed_out" });
    }

    boot();

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      const email = session?.user?.email ?? null;
      setState(email ? { mode: "signed_in", email } : { mode: "signed_out" });
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  async function signOut() {
    await supabase.auth.signOut();
    location.href = "/";
  }

  if (state.mode === "loading") {
    return (
      <div className="h-8 w-[180px] animate-pulse rounded-xl bg-slate-100" />
    );
  }

  if (state.mode === "signed_out") {
    return (
      <div className="flex items-center gap-2">
        <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] text-amber-900">
          Demo mode
        </span>
        <Link
          href="/auth/sign-in"
          className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-900">
        {state.email}
      </span>
      <button
        onClick={signOut}
        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-slate-50"
      >
        Sign out
      </button>
    </div>
  );
}
