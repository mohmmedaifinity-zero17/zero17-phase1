"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthButton() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  if (loading) {
    return (
      <button className="rounded-full border border-slate-300 px-4 py-1.5 text-xs text-slate-500">
        …
      </button>
    );
  }

  if (!user) {
    return (
      <button
        onClick={() => router.push("/auth/login")}
        className="rounded-full bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-sky-500"
      >
        Sign in
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-slate-600">{user.email}</span>
      <button
        onClick={signOut}
        className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
      >
        Sign out
      </button>
    </div>
  );
}
