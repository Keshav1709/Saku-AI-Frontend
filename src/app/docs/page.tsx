"use client";

import { useEffect, useState } from "react";

type Doc = { id: string; title: string; createdAt: string };

export default function DocsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);

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
    <main className="p-6">
      <h1 className="text-xl font-semibold mb-4">Documents</h1>
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
    </main>
  );
}


