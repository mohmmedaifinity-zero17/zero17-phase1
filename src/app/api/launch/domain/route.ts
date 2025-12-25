import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const { domain } = body ? JSON.parse(body) : { domain: "yourproduct.com" };

  const result = {
    domain,
    records: [
      { type: "A", name: "@", value: "76.76.21.21" },
      { type: "CNAME", name: "www", value: "cname.vercel-dns.com" },
    ],
    suggestedSubdomains: [
      `app.${domain}`,
      `api.${domain}`,
      `docs.${domain}`,
      `status.${domain}`,
    ],
    securityHeaders: [
      "Strict-Transport-Security: max-age=63072000; includeSubDomains; preload",
      "Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'",
      "X-Frame-Options: SAMEORIGIN",
      "X-Content-Type-Options: nosniff",
    ],
    latencyPreview: [
      { region: "India", ms: 120 },
      { region: "US East", ms: 160 },
      { region: "Europe", ms: 180 },
      { region: "Singapore", ms: 110 },
      { region: "Sydney", ms: 190 },
    ],
  };

  return NextResponse.json(result, { status: 200 });
}
