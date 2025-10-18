export default function Dashboard() {
  return (
    <main className="min-h-screen bg-[#f7f8f9] p-6">
      <div className="grid grid-cols-[16rem_1fr] gap-6">
        <aside className="bg-white rounded-2xl border p-3">
          <div className="font-semibold mb-4">SakuAI</div>
          <nav className="space-y-1 text-sm">
            <a href="#" className="block px-3 py-2 rounded hover:bg-black/5">Home</a>
            <a href="#" className="block px-3 py-2 rounded hover:bg-black/5">New Chat</a>
            <a href="#" className="block px-3 py-2 rounded hover:bg-black/5">WorkFlows</a>
            <a href="#" className="block px-3 py-2 rounded hover:bg-black/5">Meetings</a>
            <a href="#" className="block px-3 py-2 rounded hover:bg-black/5">Insights</a>
            <a href="/settings" className="block px-3 py-2 rounded hover:bg-black/5">Settings</a>
          </nav>
          <div className="mt-6 text-xs text-neutral-500">Chats</div>
          <div className="text-xs text-neutral-500">…</div>
        </aside>
        <section className="bg-white rounded-2xl border p-6">
          <h1 className="text-xl font-semibold mb-2">Chat With AI</h1>
          <p className="text-neutral-600 mb-6">Break down lengthy texts into concise summaries to grasp.</p>
          <div className="rounded-xl border p-12 text-center">
            <div className="text-3xl mb-2">Welcome Saku AI</div>
            <p className="text-neutral-500 mb-6">Get Started By Script A Task And Chat Can Do The Rest.. Not Sure Where To Start?</p>
            <div className="flex flex-wrap gap-3 justify-center">
              {[
                "Write Copy",
                "Image Generation",
                "Research",
                "Generate Article",
                "Data Analytics",
                "Generate Code",
              ].map((b) => (
                <button key={b} className="px-4 py-2 rounded border hover:bg-black/5">
                  {b}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}


