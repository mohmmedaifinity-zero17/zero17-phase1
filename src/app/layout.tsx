// src/app/layout.tsx
import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import Image from "next/image";

import ClientProviders from "@/app/ClientProviders";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zero17 — Founder Operating System",
  description:
    "Zero17 is the god-mode operating system for founders: Research, Build, Launch and Growth in one place.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className="bg-zero17-warm-fusion brightness-105 saturate-105"
    >
      <body className={inter.className}>
        {/* GLOBAL HEADER */}
        <header className="fixed inset-x-0 top-0 z-40 border-b border-white/60 bg-white/75 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            {/* Logo → back home */}
            <Link
              href="/"
              className="group flex items-center gap-2"
              aria-label="Back to Zero17 home"
            >
              <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-sky-200 via-amber-200 to-rose-200 shadow-sm">
                <Image
                  src="/zero17-mark.png"
                  alt="Zero17"
                  fill
                  priority
                  sizes="32px"
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold tracking-tight text-slate-800 group-hover:text-slate-950">
                  Zero17
                </span>
                <span className="text-[9px] uppercase tracking-[0.16em] text-slate-400">
                  Founder OS
                </span>
              </div>
            </Link>

            {/* Main nav */}
            <nav className="flex items-center gap-4 text-[11px] text-slate-700">
              <NavLink href="/research" label="Research" />
              <NavLink href="/builder" label="Builder" />
              <NavLink href="/launch" label="Launch" />
              <NavLink href="/growth" label="Growth OS" />
              <NavLink href="/projects" label="Projects" />
              <NavLink href="/pricing" label="Pricing" />
              <NavLink href="/about" label="About" />

              {/* Auth disabled while Builder Lab is being finalized */}
              <Link
                href="/pricing"
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-800 hover:bg-slate-50"
              >
                Pricing
              </Link>

              <Link
                href="/helix"
                className="rounded-full bg-slate-900 px-3 py-1 font-semibold text-white hover:bg-slate-800"
              >
                HELIX
              </Link>
            </nav>
          </div>
        </header>

        {/* CLIENT PROVIDERS */}
        <ClientProviders>
          {/* PAGE CONTENT */}
          <div className="min-h-screen pt-16">{children}</div>

          {/* GLOBAL FOOTER */}
          <footer className="border-t border-slate-800 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-slate-200">
            <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 text-[11px] md:grid-cols-[2fr,2fr,1.5fr]">
              {/* Brand */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="relative h-7 w-7 overflow-hidden rounded-full bg-gradient-to-br from-sky-200 via-amber-200 to-rose-200">
                    <Image
                      src="/zero17-mark.png"
                      alt="Zero17"
                      fill
                      sizes="28px"
                      className="object-contain"
                    />
                  </div>
                  <span className="text-xs font-semibold text-white">
                    Zero17
                  </span>
                </div>
                <p className="max-w-xs text-[11px] text-slate-300">
                  The god-mode operating system for founders — from idea to
                  launch to compounding growth, in one solar system.
                </p>
              </div>

              {/* Product */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="mb-1 text-[11px] font-semibold text-slate-100">
                    Product
                  </div>
                  <ul className="space-y-1">
                    <FooterLink href="/research" label="Research Lab" />
                    <FooterLink href="/builder" label="Builder Lab" />
                    <FooterLink href="/launch" label="Launch Engine" />
                    <FooterLink href="/growth" label="Growth OS" />
                    <FooterLink href="/projects" label="Projects & Proof" />
                  </ul>
                </div>
                <div>
                  <div className="mb-1 text-[11px] font-semibold text-slate-100">
                    Company
                  </div>
                  <ul className="space-y-1">
                    <FooterLink href="/about" label="About Zero17" />
                    <FooterLink href="/pricing" label="Pricing" />
                    <FooterLink href="/terms" label="Terms" />
                    <FooterLink href="/privacy" label="Privacy" />
                  </ul>
                </div>
              </div>

              {/* Social */}
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-slate-100">
                  Connect
                </div>
                <ul className="space-y-1">
                  <FooterLink
                    href="https://linkedin.com"
                    label="LinkedIn"
                    external
                  />
                  <FooterLink
                    href="https://twitter.com"
                    label="X / Twitter"
                    external
                  />
                  <FooterLink
                    href="https://youtube.com"
                    label="YouTube"
                    external
                  />
                  <FooterLink
                    href="mailto:founder@zero17.app"
                    label="Email"
                    external
                  />
                </ul>
              </div>
            </div>

            <div className="border-t border-slate-700 text-[10px] text-slate-400">
              <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
                <span>
                  © {new Date().getFullYear()} Zero17. All rights reserved.
                </span>
                <span>Built by a founder + AI squad in god-mode.</span>
              </div>
            </div>
          </footer>
        </ClientProviders>
      </body>
    </html>
  );
}

/* Helpers */

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="hidden items-center transition-colors hover:text-slate-950 md:inline-flex"
    >
      {label}
    </Link>
  );
}

function FooterLink({
  href,
  label,
  external,
}: {
  href: string;
  label: string;
  external?: boolean;
}) {
  if (external) {
    return (
      <li>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-slate-300 transition-colors hover:text-slate-50"
        >
          {label}
        </a>
      </li>
    );
  }
  return (
    <li>
      <Link
        href={href}
        className="text-slate-300 transition-colors hover:text-slate-50"
      >
        {label}
      </Link>
    </li>
  );
}
