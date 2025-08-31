import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import HelixPill from "./components/HelixPill";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zero17",
  description: "Phase-1 MVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* HELIX floating pill on every page */}
        <HelixPill />
        {children}
      </body>
    </html>
  );
}
