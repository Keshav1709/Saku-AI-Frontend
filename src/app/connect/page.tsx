"use client";

import { useEffect, useState } from "react";

type Connector = { key: string; name: string; connected: boolean };

export default function ConnectPage() {
  const [items, setItems] = useState<Connector[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/connectors");
      const json = await res.json();
      setItems(json.connectors ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function toggle(key: string) {
    await fetch("/api/connectors/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    refresh();
  }

  return (
    <main className="min-h-screen bg-[#f7f8f9] py-6 px-4">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="text-4xl font-semibold text-center mb-2">Connect your tools</h1>
        <p className="text-center text-neutral-600 mb-6">Grant Saku AI access to your apps so it can help you search, summarize, and automate your work.</p>
        <div className="space-y-3">
          {loading ? (
            <div className="text-center text-neutral-500">Loading…</div>
          ) : (
            items.map((c) => (
              <div key={c.key} className="flex items-center justify-between bg-white rounded-xl border px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded bg-[#f7f8f9] flex items-center justify-center">{c.name[0]}</div>
                  <div className="font-medium">{c.name}</div>
                </div>
                <button
                  onClick={() => toggle(c.key)}
                  className={`px-3 py-1 rounded border ${c.connected ? "text-blue-600 border-blue-200 bg-blue-50" : "hover:bg-black/5"}`}
                >
                  {c.connected ? "Connected" : "Connect"}
                </button>
              </div>
            ))
          )}
        </div>
        <div className="flex flex-wrap gap-3 justify-center mt-6">
          <a href="/dashboard" className="bg-[#0b1220] text-white rounded px-4 py-2">Complete Setup</a>
          <a href="/dashboard" className="border rounded px-4 py-2">Skip For Now</a>
        </div>
      </div>
    </main>
  );
}


