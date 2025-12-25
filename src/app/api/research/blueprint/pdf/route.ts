import { NextRequest, NextResponse } from "next/server";
// @ts-ignore - pdfkit types not available
import PDFDocument from "pdfkit";
import { Blueprint, ResearchIdea } from "@/lib/research/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const blueprint = body.blueprint as Blueprint | null;
    const idea = body.idea as ResearchIdea | null;

    if (!blueprint || !idea) {
      return NextResponse.json(
        { error: "Missing blueprint or idea" },
        { status: 400 }
      );
    }

    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("error", (err: Error) => {
      console.error("[Zero17] PDF error:", err);
    });

    const done = new Promise<Buffer>((resolve) => {
      doc.on("end", () => {
        resolve(Buffer.concat(chunks));
      });
    });

    // Title
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("Zero17 – Research Blueprint", { align: "left" })
      .moveDown(0.5);

    doc
      .fontSize(12)
      .font("Helvetica")
      .fillColor("#555555")
      .text(`Idea: ${idea.title || idea.description || ""}`)
      .moveDown(0.2);
    doc
      .text(`Generated on: ${new Date().toLocaleString()}`, { align: "left" })
      .moveDown(0.8);

    // Summary
    doc
      .fontSize(13)
      .font("Helvetica-Bold")
      .fillColor("#000000")
      .text("Summary", { underline: true })
      .moveDown(0.2);

    doc
      .fontSize(11)
      .font("Helvetica")
      .fillColor("#222222")
      .text(blueprint.summary || "No summary.")
      .moveDown(0.8);

    // Phases
    const phases: [string, string][] = [
      ["Phase 0 – Build Now", blueprint.phase0Scope],
      ["Phase 1 – 60–90 Days", blueprint.phase1Scope],
      ["Phase 2 – 6–12 Months", blueprint.phase2Scope],
    ];

    phases.forEach(([title, body]) => {
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor("#000000")
        .text(title)
        .moveDown(0.2);
      doc
        .fontSize(11)
        .font("Helvetica")
        .fillColor("#222222")
        .text(body || "—")
        .moveDown(0.6);
    });

    // Feature stack
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#000000")
      .text("Feature Stack")
      .moveDown(0.2);

    const stack = blueprint.featureStack || {
      core: [],
      distinctive: [],
      matrixOptional: [],
    };

    const featureGroups: [string, string[]][] = [
      ["Core", stack.core || []],
      ["Distinctive", stack.distinctive || []],
      ["Matrix Optional", stack.matrixOptional || []],
    ];

    featureGroups.forEach(([label, items]) => {
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .fillColor("#000000")
        .text(label)
        .moveDown(0.1);
      if (!items.length) {
        doc
          .font("Helvetica")
          .fillColor("#555555")
          .text("• (none)")
          .moveDown(0.2);
      } else {
        items.forEach((f) => {
          doc.font("Helvetica").fillColor("#222222").text(`• ${f}`);
        });
        doc.moveDown(0.3);
      }
    });

    // System plan & GTM
    doc
      .moveDown(0.3)
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#000000")
      .text("System Plan")
      .moveDown(0.2);
    doc
      .fontSize(11)
      .font("Helvetica")
      .fillColor("#222222")
      .text(blueprint.systemPlan || "—")
      .moveDown(0.5);

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#000000")
      .text("GTM Seed Plan")
      .moveDown(0.2);
    doc
      .fontSize(11)
      .font("Helvetica")
      .fillColor("#222222")
      .text(blueprint.gtmSeedPlan || "—")
      .moveDown(0.5);

    // Decision note
    if (blueprint.decisionNote) {
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor("#000000")
        .text("Decision Note")
        .moveDown(0.2);
      doc
        .fontSize(11)
        .font("Helvetica")
        .fillColor("#222222")
        .text(blueprint.decisionNote)
        .moveDown(0.3);
    }

    doc.end();
    const pdfBuffer = await done;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          'attachment; filename="zero17_research_blueprint.pdf"',
      },
    });
  } catch (err: any) {
    console.error("[Zero17] Blueprint PDF route error:", err);
    return NextResponse.json(
      {
        error: "Failed to generate blueprint PDF",
        details: String(err?.message || err),
      },
      { status: 500 }
    );
  }
}
