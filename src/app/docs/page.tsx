"use client";

import { useEffect, useState } from "react";
import { MainSidebar } from "@/components/MainSidebar";

type Doc = { id: string; title: string; createdAt: string };

export default function DocsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/docs");
        const data = await res.json();
        if (active) setDocs(data.docs ?? []);
      } catch {
        if (active) setDocs([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f8f9] flex">
      <MainSidebar />
      <main className="flex-1 p-6">
        <div className="bg-white rounded-2xl border p-6">
          <h1 className="text-xl font-semibold mb-4">Documents</h1>
          <div className="mb-4 flex gap-2">
            <input
              className="border rounded px-3 py-2 text-sm flex-1"
              placeholder="Search indexed content..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              className="px-3 py-2 bg-black text-white rounded text-sm"
              onClick={async () => {
                if (!query.trim()) return;
                try {
                  const resp = await fetch('/api/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query, k: 8 }) });
                  const json = await resp.json();
                  setResults(json.results || []);
                } catch (e) {
                  setResults([]);
                }
              }}
            >
              Search
            </button>
          </div>
          {results.length > 0 && (
            <div className="mb-6">
              <div className="text-sm font-medium mb-2">Search Results</div>
              <ul className="space-y-2">
                {results.map((r, i) => (
                  <li key={i} className="border rounded p-3 text-sm">
                    <div className="opacity-70">Doc: {r.doc_id} · Chunk: {r.chunk_index}</div>
                    <div>{r.snippet}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {loading ? (
            <p className="opacity-70">Loading…</p>
          ) : docs.length === 0 ? (
            <p className="opacity-70">No documents yet.</p>
          ) : (
            <ul className="space-y-2">
              {docs.map((d) => (
                <li key={d.id} className="border rounded p-3">
                  <div className="font-medium">{d.title}</div>
                  <div className="text-xs opacity-70">{new Date(d.createdAt).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}


