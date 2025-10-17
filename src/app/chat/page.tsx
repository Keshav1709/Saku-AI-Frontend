"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Sidebar } from "@/components/Sidebar";

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement | null>(null);
  const [sessionId, setSessionId] = useState<string>(() => crypto.randomUUID());

  useEffect(() => {
    const token = localStorage.getItem("saku_auth");
    if (!token) router.replace("/login");
  }, [router]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  function logout() {
    localStorage.removeItem("saku_auth");
    router.replace("/login");
  }

  async function onSend() {
    if (!input.trim()) return;
    const userMsg = { role: "user" as const, content: input };
    setMessages((m) => [...m, userMsg, { role: "assistant", content: "" }]);
    setInput("");
    // Stream via SSE from internal API
    const url = `/api/chat/stream?prompt=${encodeURIComponent(userMsg.content)}`;
    const evt = new EventSource(url);
    evt.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "token") {
          setMessages((m) => {
            const next = [...m];
            const last = next[next.length - 1];
            next[next.length - 1] = { role: "assistant", content: (last?.content || "") + data.value };
            return next;
          });
        } else if (data.type === "done") {
          evt.close();
          // persist session index
          const sessions = JSON.parse(localStorage.getItem("saku_sessions") || "[]");
          const title = userMsg.content.slice(0, 40) || "Conversation";
          const exists = sessions.find((s: any) => s.id === sessionId);
          if (!exists) {
            sessions.unshift({ id: sessionId, title, createdAt: new Date().toISOString() });
            localStorage.setItem("saku_sessions", JSON.stringify(sessions.slice(0, 30)));
          }
        }
      } catch {}
    };
    evt.onerror = () => {
      evt.close();
    };
  }

  return (
    <div className="min-h-screen grid grid-cols-[16rem_1fr]">
      <Sidebar
        selectedId={sessionId}
        onNew={() => {
          setSessionId(crypto.randomUUID());
          setMessages([]);
        }}
        onSelect={(id) => {
          setSessionId(id);
          // future: load messages for that session
        }}
      />
      <main className="flex flex-col">
        <div className="flex-1 grid grid-rows-[1fr_auto]">
          <div ref={listRef} className="overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                <div className="inline-block max-w-[75%] border rounded px-3 py-2">
                  <span className="text-xs block opacity-60 mb-1">{m.role}</span>
                  <div>{m.content}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t flex gap-2">
            <input
              className="flex-1 border rounded px-3 py-2"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
            />
            <button onClick={onSend} className="px-4 py-2 bg-black text-white rounded">
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}


