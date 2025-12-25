// src/app/api/growth/mirror/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { openai } from "@/lib/openai";

type MirrorBody = {
  currentMasterbrainInput: any;
};

export async function POST(req: Request) {
  const supabase = createServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: MirrorBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { data: history, error: historyError } = await supabase
    .from("zero17_growth_memory")
    .select(
      "id, created_at, label, masterbrain_input, sprint_plan, decision, growth_outcome"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(25);

  if (historyError) {
    console.error("Error loading growth history:", historyError);
    return NextResponse.json(
      { error: "Failed to load growth history" },
      { status: 500 }
    );
  }

  if (!history || history.length === 0) {
    return NextResponse.json({
      headline: "No past growth runs yet",
      summary:
        "Once you run a few sprints, Growth Mirror will compare this plan to previous ones and highlight patterns.",
      matches: [],
      chiefAdvice:
        "For now, treat this as a fresh bet. Run a tight 7–14 day sprint and then save the outcome back into Growth Memory.",
    });
  }

  try {
    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "You are Growth Mirror, an elite growth advisor.\n" +
            "User gives you current growth masterbrain input and a list of past growth runs from Growth OS.\n" +
            "Your job: identify at most 3 most relevant past runs, warn about repeated mistakes, and suggest adjustments.\n" +
            "Return STRICT JSON with shape:\n" +
            "{\n" +
            '  \"headline\": string,\n' +
            '  \"summary\": string,\n' +
            '  \"matches\": [\n' +
            "    {\n" +
            '      \"id\": string,\n' +
            '      \"createdAt\": string,\n' +
            '      \"label\": string,\n' +
            '      \"similarityNote\": string,\n' +
            '      \"decision\": string | null,\n' +
            '      \"outcomeSummary\": string | null\n' +
            "    }\n" +
            "  ],\n" +
            '  \"chiefAdvice\": string\n' +
            "}\n" +
            "Focus on brutal clarity, avoid fluff, and speak like an honest growth cofounder.",
        },
        {
          role: "user",
          content: JSON.stringify({
            currentInput: body.currentMasterbrainInput,
            history,
          }),
        },
      ],
    });

    const raw =
      response.output[0] &&
      "content" in response.output[0] &&
      Array.isArray(response.output[0].content) &&
      response.output[0].content[0] &&
      "type" in response.output[0].content[0] &&
      response.output[0].content[0].type === "output_text" &&
      "text" in response.output[0].content[0]
        ? response.output[0].content[0].text
        : null;

    if (!raw) {
      return NextResponse.json(
        { error: "Unexpected OpenAI response format" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(raw);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Error in /growth/mirror OpenAI call:", err);
    return NextResponse.json(
      {
        error: "Failed to compute Growth Mirror. Try again in a moment.",
      },
      { status: 500 }
    );
  }
}
