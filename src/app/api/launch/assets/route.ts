import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const {
      projectName = "Zero17",
      previewUrl = "https://zero17-preview.vercel.app",
      oneLiner = "From idea to live MVP in ~1 hour.",
    } = await req.json().catch(() => ({}));

    const productHunt = {
      name: projectName,
      tagline: oneLiner,
      description:
        "Zero17 is a founder OS that validates your idea, generates a working MVP, and ships launch assets—fast. Research → Build → Launch in one flow.",
      topics: ["AI", "Developer Tools", "Productivity", "SaaS"],
      url: previewUrl,
      gallery: ["screenshot1.png", "screenshot2.png"], // stub
    };

    const linkedin = `🚀 Launching ${projectName}\n\n${oneLiner}\n\nValidate → Build → Launch in one flow.\nLive preview: ${previewUrl}\n\n#startup #ai #builders #founders`;

    const tweet = `Launching ${projectName} — ${oneLiner} ${previewUrl} #AI #buildinpublic`;

    const reelScript = [
      "Hook: “What if you could ship an MVP in ~1 hour?”",
      "Show: Research score → Builder arena → Deploy preview",
      "CTA: “Try Zero17 today. Link in bio.”",
    ];

    const tags = ["#AI", "#MVP", "#Builders", "#Startup", "#ProductHunt"];

    return NextResponse.json({
      status: "ok",
      assets: { productHunt, linkedin, tweet, reelScript, tags },
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "error", error: err?.message ?? "unknown" },
      { status: 500 }
    );
  }
}
