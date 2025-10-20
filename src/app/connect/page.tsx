"use client";

import { useEffect, useState } from "react";
import { MainSidebar } from "@/components/MainSidebar";

type Connector = { key: string; name: string; connected: boolean };

export default function ConnectPage() {
  const [items, setItems] = useState<Connector[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - OAuth logic moved to external location
  useEffect(() => {
    setLoading(true);
    const mockConnectors = [
      { key: 'gmail', name: 'Gmail', connected: false },
      { key: 'drive', name: 'Google Drive', connected: false },
      { key: 'calendar', name: 'Google Calendar', connected: false },
      { key: 'slack', name: 'Slack', connected: false },
      { key: 'notion', name: 'Notion', connected: false },
      { key: 'discord', name: 'Discord', connected: false }
    ];
    setItems(mockConnectors);
    setLoading(false);
  }, []);

  function toggle(key: string) {
    // OAuth logic moved to external location - show placeholder message
    alert(`Integration toggle for ${key} - OAuth logic moved to external location`);
  }

  return (
    <div className="min-h-screen bg-[#f7f8f9] flex">
      <MainSidebar />
      <main className="flex-1 py-6 px-4">
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
    </div>
  );
}


