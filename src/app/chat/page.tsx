"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MainSidebar } from "@/components/MainSidebar";

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string; citations?: any[] }[]>([]);
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
    setMessages((m) => [...m, userMsg, { role: "assistant", content: "", citations: [] }]);
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
            next[next.length - 1] = { 
              role: "assistant", 
              content: (last?.content || "") + data.value,
              citations: last?.citations || []
            };
            return next;
          });
        } else if (data.type === "context") {
          // Update the last message with citations
          setMessages((m) => {
            const next = [...m];
            const last = next[next.length - 1];
            if (last && last.role === "assistant") {
              next[next.length - 1] = { 
                ...last, 
                citations: data.citations || [] 
              };
            }
            return next;
          });
        } else if (data.type === "done") {
          evt.close();
          // persist session index
          const sessions = JSON.parse(localStorage.getItem("saku_sessions") || "[]");
          const title = userMsg.content.slice(0, 40) || "Conversation";
          const exists = sessions.find((s: { id: string }) => s.id === sessionId);
          if (!exists) {
            sessions.unshift({ id: sessionId, title, createdAt: new Date().toISOString() });
            localStorage.setItem("saku_sessions", JSON.stringify(sessions.slice(0, 30)));
          }
        }
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };
    evt.onerror = (error) => {
      console.error("SSE error:", error);
      evt.close();
    };
  }

  return (
    <div className="min-h-screen bg-[#f7f8f9] flex">
      <MainSidebar
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
      <main className="flex-1 flex flex-col">
          <div className="flex-1 grid grid-rows-[1fr_auto]">
            <div ref={listRef} className="overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                  <div className="inline-block max-w-[75%] border rounded px-3 py-2">
                    <span className="text-xs block opacity-80 mb-1 text-black font-medium">{m.role}</span>
                    <div className="text-black">{m.content}</div>
                    {m.citations && m.citations.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="text-xs text-black font-medium mb-1">Sources:</div>
                        <div className="space-y-1">
                          {m.citations.map((citation, idx) => (
                            <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                              <div className="font-medium text-black">
                                {citation.doc_id ? `Document ${citation.doc_id}` : 'Source'}
                                {citation.chunk_index !== undefined && ` (Chunk ${citation.chunk_index})`}
                              </div>
                              <div className="text-neutral-800 mt-1">
                                {citation.snippet}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t flex gap-2">
              <input
                className="flex-1 border rounded px-3 py-2 text-black placeholder-neutral-600"
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
              <button onClick={onSend} className="px-4 py-2 bg-black text-white rounded font-medium">
                Send
              </button>
            </div>
          </div>
      </main>
    </div>
  );
}


