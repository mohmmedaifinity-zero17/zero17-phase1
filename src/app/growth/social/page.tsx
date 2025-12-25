// src/app/growth/social/page.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  MessageCircle,
  Share2,
  Image as ImageIcon,
} from "lucide-react";

type Channel = "twitter" | "linkedin" | "email" | "shorts";

export default function SocialPage() {
  const [winType, setWinType] = useState("result");
  const [winDetail, setWinDetail] = useState("");
  const [icp, setIcp] = useState("");
  const [channel, setChannel] = useState<Channel>("twitter");
  const [tone, setTone] = useState("friendly");

  const postExample = useMemo(() => {
    if (!winDetail && !icp) return "";
    const baseIcp = icp || "my ideal customer";
    const baseWin = winDetail || "a small but real win";

    if (channel === "twitter") {
      return `1/ Small win for ${baseIcp} today 🚀

${baseWin}

No hacks. Just:
• Clear offer
• Tiny experiment
• Quick follow-up

Building in public with Zero17 — one simple growth loop every week.`;
    }

    if (channel === "linkedin") {
      return `Today we helped ${baseIcp} hit a small but important milestone:

👉 ${baseWin}

Why this matters:
• It proves the offer is working
• It gives us a story to share
• It tells us where to double down next week

This is how we’re building with deliberate, simple growth loops — not random moves.`;
    }

    if (channel === "email") {
      return `Subject: A quick story from this week

Hey,

Quick win from this week with ${baseIcp}:

${baseWin}

We did it with a very simple plan:
1) Clear goal
2) One small experiment
3) Follow-up and adjustment

If you’d like a similar outcome, just reply “LOOP” and I’ll send you 2–3 ideas you can try next week.

– You`;
    }

    // shorts / reels script
    return `Hook (2–3 sec):
"Here’s a tiny win that proves this growth loop works."

Story (10–20 sec):
"We worked with ${baseIcp}. This week the mini goal was: ${baseWin}.
No crazy ad budget, just a focused experiment and follow-up."

Close (5–10 sec):
"If you want these kinds of small wins stacked every week, build one simple loop and repeat it. That’s what we’re doing inside Zero17."`;
  }, [winDetail, icp, channel]);

  return (
    <div className="min-h-[calc(100vh-56px)]">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Back link */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/growth"
            className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-black"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Growth OS
          </Link>
        </div>

        {/* Heading */}
        <section className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-500" />
            <h1 className="text-xl font-semibold">Social & Proof Engine</h1>
          </div>
          <p className="text-[11px] text-slate-600 max-w-3xl">
            Turn tiny wins into &quot;proof bricks&quot; — stories, screenshots
            and mini case studies. These bricks feed your posts, DMs, emails and
            launch assets.
          </p>
        </section>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Proof brick builder */}
          <section className="z17-card bg-white/90 p-4 space-y-3">
            <div className="space-y-1 text-[11px]">
              <label className="font-semibold text-slate-700 flex items-center gap-1">
                <ImageIcon className="w-3 h-3 text-sky-500" />
                What kind of win is this?
              </label>
              <div className="flex flex-wrap gap-1">
                <ProofTypeChip
                  label="Result"
                  active={winType === "result"}
                  onClick={() => setWinType("result")}
                />
                <ProofTypeChip
                  label="Before → after"
                  active={winType === "before-after"}
                  onClick={() => setWinType("before-after")}
                />
                <ProofTypeChip
                  label="Client quote"
                  active={winType === "quote"}
                  onClick={() => setWinType("quote")}
                />
              </div>
            </div>

            <div className="space-y-1 text-[11px]">
              <label className="font-semibold text-slate-700">
                Describe the win in one or two lines
              </label>
              <textarea
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-sky-100"
                placeholder="Example: A user launched their AI MVP and booked 5 demo calls in 7 days with one simple outreach loop."
                value={winDetail}
                onChange={(e) => setWinDetail(e.target.value)}
              />
            </div>

            <div className="space-y-1 text-[11px]">
              <label className="font-semibold text-slate-700">
                Who was this win for?
              </label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] outline-none focus:ring-2 focus:ring-sky-100"
                placeholder="Example: solo founder building an AI productivity tool"
                value={icp}
                onChange={(e) => setIcp(e.target.value)}
              />
            </div>

            <div className="space-y-1 text-[11px]">
              <label className="font-semibold text-slate-700">
                Main channel for this story
              </label>
              <div className="flex flex-wrap gap-1">
                <ChannelChip
                  id="twitter"
                  label="Twitter / X"
                  active={channel === "twitter"}
                  onClick={() => setChannel("twitter")}
                />
                <ChannelChip
                  id="linkedin"
                  label="LinkedIn"
                  active={channel === "linkedin"}
                  onClick={() => setChannel("linkedin")}
                />
                <ChannelChip
                  id="email"
                  label="Email"
                  active={channel === "email"}
                  onClick={() => setChannel("email")}
                />
                <ChannelChip
                  id="shorts"
                  label="Reels / Shorts script"
                  active={channel === "shorts"}
                  onClick={() => setChannel("shorts")}
                />
              </div>
            </div>

            <div className="space-y-1 text-[11px]">
              <label className="font-semibold text-slate-700">
                Tone of voice
              </label>
              <div className="flex flex-wrap gap-1">
                {[
                  ["friendly", "Friendly"],
                  ["expert", "Expert"],
                  ["bold", "Bold"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTone(key)}
                    className={`px-2 py-1 rounded-full text-[11px] border ${
                      tone === key
                        ? "bg-sky-500 text-white border-sky-500"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Right: post generator */}
          <section className="z17-card bg-slate-950 text-white p-4 space-y-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-sky-300" />
              <div className="text-sm font-semibold">Post / script example</div>
            </div>

            {!postExample && (
              <p className="text-[11px] text-slate-100">
                Fill the left side. You&apos;ll see a simple example of a{" "}
                {channel === "twitter"
                  ? "tweet"
                  : channel === "linkedin"
                    ? "LinkedIn post"
                    : channel === "email"
                      ? "short email"
                      : "30-second script"}
                . Paste it into your social / email tool and lightly edit to
                make it yours.
              </p>
            )}

            {postExample && (
              <pre className="whitespace-pre-wrap text-[11px] text-slate-50 bg-slate-900 rounded-2xl px-3 py-2 border border-slate-700">
                {postExample}
              </pre>
            )}

            <div className="mt-2 border-t border-slate-800 pt-2 space-y-1">
              <div className="text-[11px] font-semibold text-sky-300">
                Simple publishing habit
              </div>
              <ul className="list-disc pl-4 text-[10px] text-slate-100 space-y-0.5">
                <li>Share 1 small win per week (proof brick).</li>
                <li>Tag the type of win (result / before-after / quote).</li>
                <li>
                  Reuse the same brick across 2–3 channels instead of starting
                  from zero.
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ProofTypeChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-1 rounded-full text-[11px] border ${
        active
          ? "bg-sky-500 text-white border-sky-500"
          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}

function ChannelChip({
  id,
  label,
  active,
  onClick,
}: {
  id: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-1 rounded-full text-[11px] border ${
        active
          ? "bg-slate-900 text-white border-slate-900"
          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}
