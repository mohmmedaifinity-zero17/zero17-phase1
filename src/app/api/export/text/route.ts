export async function POST(req: Request) {
  const { content = "", filename = "export.txt" } = await req
    .json()
    .catch(() => ({ content: "", filename: "export.txt" }));
  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
