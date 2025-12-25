// src/lib/builder/server/proofPack.ts

import JSZip from "jszip";

export async function buildProofPack(project: any) {
  const zip = new JSZip();

  zip.file(
    "project.json",
    JSON.stringify(
      {
        id: project.id,
        title: project.title,
        status: project.status,
        updated_at: project.updated_at,
      },
      null,
      2
    )
  );

  zip.file("ledger.json", JSON.stringify(project.ledger || [], null, 2));

  zip.file("agents.json", JSON.stringify(project.agents || [], null, 2));

  const content = await zip.generateAsync({ type: "nodebuffer" });
  return content;
}
