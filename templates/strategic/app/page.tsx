export default function Page() {
  return (
    <main className="max-w-5xl mx-auto p-10">
      <section className="mb-10">
        <h1 className="text-4xl font-extrabold">Zero17 Strategic Scaffold</h1>
        <p className="mt-3 text-zinc-600">
          Structured sections, ready for scale.
        </p>
      </section>
      <section className="grid md:grid-cols-3 gap-6">
        <Card title="Auth Shell" note="Plug your provider later" />
        <Card title="DB Ready" note="Supabase schema hooks" />
        <Card title="Routing" note="App router sections prewired" />
      </section>
    </main>
  );
}

function Card({ title, note }: { title: string; note: string }) {
  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-zinc-500 mt-1">{note}</div>
    </div>
  );
}
