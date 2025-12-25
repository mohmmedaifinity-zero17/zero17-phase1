"use client";

// ✅ AUTH BOOT DISABLED (DEV MODE)
// Commented out to allow Builder Lab to work without auth during development.
// Re-enable later when ready to add authentication.

// import { useEffect, useState } from "react";
// import { createClient } from "@supabase/supabase-js";
//
// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// );

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ DEV MODE: No auth boot, render immediately
  return <>{children}</>;

  // ❌ COMMENTED OUT: Anonymous auth boot (re-enable later)
  // const [ready, setReady] = useState(false);
  //
  // useEffect(() => {
  //   let cancelled = false;
  //
  //   async function boot() {
  //     // 1) If user already has a session, great
  //     const { data } = await supabase.auth.getSession();
  //     if (data.session) {
  //       if (!cancelled) setReady(true);
  //       return;
  //     }
  //
  //     // 2) Otherwise create anonymous session (free mode)
  //     const res = await supabase.auth.signInAnonymously();
  //     if (res.error) {
  //       console.error("Anonymous auth failed:", res.error);
  //     }
  //
  //     if (!cancelled) setReady(true);
  //   }
  //
  //   boot();
  //   return () => {
  //     cancelled = true;
  //   };
  // }, []);
  //
  // if (!ready) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center text-sm text-slate-600">
  //       Booting Zero17…
  //     </div>
  //   );
  // }
  //
  // return <>{children}</>;
}
