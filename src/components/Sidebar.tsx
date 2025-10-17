"use client";

import { useEffect, useState } from "react";

type Conversation = { id: string; title: string; createdAt: string };

export function Sidebar({ onNew, onSelect, selectedId }: { onNew: () => void; onSelect: (id: string) => void; selectedId?: string | null }) {
  const [items, setItems] = useState<Conversation[]>([]);

  useEffect(() => {
    // Load from localStorage for now; later, fetch from backend
    const raw = localStorage.getItem("saku_sessions");
    const parsed = raw ? (JSON.parse(raw) as Conversation[]) : [];
    setItems(parsed);
  }, []);

  return (
    <aside className="w-64 border-r h-[calc(100vh-3rem)] sticky top-12 p-3 flex flex-col gap-3">
      <button className="w-full bg-black text-white rounded py-2" onClick={onNew}>
        New Chat
      </button>
      <div className="text-xs opacity-60">Recent</div>
      <div className="flex-1 overflow-y-auto space-y-1">
        {items.length === 0 ? (
          <div className="text-sm opacity-60">No conversations</div>
        ) : (
          items.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`w-full text-left px-2 py-2 rounded ${selectedId === c.id ? "bg-black text-white" : "hover:bg-black/5"}`}
            >
              <div className="truncate text-sm">{c.title}</div>
              <div className="text-[10px] opacity-60">{new Date(c.createdAt).toLocaleString()}</div>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}


