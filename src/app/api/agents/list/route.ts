// src/app/api/agents/list/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const agents = [
  {
    id: "growth-chief",
    name: "Growth Chief-of-Staff",
    role: "chief",
  },
  {
    id: "perf-lab",
    name: "Performance Marketer",
    role: "performance",
  },
  {
    id: "content-social",
    name: "Content & Social",
    role: "content",
  },
  {
    id: "sales-outreach",
    name: "Sales & Outreach",
    role: "sales",
  },
  {
    id: "data-retention",
    name: "Data & Retention",
    role: "retention",
  },
];

export async function GET() {
  return NextResponse.json({ agents }, { status: 200 });
}
