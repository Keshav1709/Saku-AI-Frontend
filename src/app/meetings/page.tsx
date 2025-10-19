"use client";

import { useEffect, useState } from "react";
import { MainSidebar } from "@/components/MainSidebar";
import { useRouter } from "next/navigation";

type Meeting = {
  id: string;
  title: string;
  provider: string;
  date: string;
  tags: string[];
  owner?: string;
};

export default function MeetingsPage() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [provider, setProvider] = useState("Zoom");
  const [date, setDate] = useState("");
  const [tags, setTags] = useState("");
  const [q, setQ] = useState("");
  const [activeTab, setActiveTab] = useState<'mine'|'shared'|'incomplete'>('mine');
  const [sourceFilterOpen, setSourceFilterOpen] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  async function refresh() {
    setLoading(true);
    try {
      const resp = await fetch("/api/meetings");
      const json = await resp.json();
      setMeetings(json.meetings || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("saku_auth");
    if (!token) router.replace("/login");
    refresh();
  }, [router]);

  async function createMeeting() {
    if (!title.trim()) return;
    const body = {
      title,
      provider,
      date: date || undefined,
      tags: tags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    const resp = await fetch("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await resp.json();
    if (json?.ok) {
      setShowCreate(false);
      setTitle("");
      setProvider("Zoom");
      setDate("");
      setTags("");
      refresh();
    }
  }

  async function remove(id: string) {
    const resp = await fetch(`/api/meetings/${id}`, { method: "DELETE" });
    if (resp.ok) refresh();
  }

  const filtered = meetings.filter((m) => {
    if (!q.trim()) return true;
    const hay = `${m.title} ${m.provider} ${(m.tags || []).join(" ")}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#f7f8f9] flex">
      <MainSidebar />
      <main className="flex-1 p-6">
        {/* Top Controls Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 text-sm text-neutral-700">
            <span className="px-2 py-1 border rounded bg-white">GPT-4</span>
            <span className="px-2 py-1 border rounded bg-white">All Sources</span>
            <span className="px-2 py-1 border rounded bg-white">All Access</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowCreate(true)} className="px-3 py-2 bg-black text-white rounded text-sm">+ New Meeting</button>
          </div>
        </div>

        {/* Global command search */}
        <div className="relative mb-4">
          <input placeholder="Ask anything or type / for commands…" className="w-full border rounded px-3 py-2 pr-20 text-sm" />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-neutral-400">
            <span>🔍</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border">
          {/* Tabs row */}
          <div className="flex items-center gap-6 px-4 pt-3">
            {([
              {key:'mine', label:'My Meetings'},
              {key:'shared', label:'Shared With Me'},
              {key:'incomplete', label:'Incomplete'},
            ] as const).map(t => (
              <button key={t.key} onClick={()=>setActiveTab(t.key)} className={`pb-2 text-sm ${activeTab===t.key? 'border-b-2 border-black text-black':'text-neutral-600 hover:text-black'}`}>{t.label}</button>
            ))}
          </div>
          <div className="px-4 py-3 flex items-center gap-3 border-t">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search meetings..."
              className="border rounded px-3 py-2 text-sm flex-1"
            />
            <div className="relative">
              <button onClick={()=>setSourceFilterOpen(v=>!v)} className="px-3 py-2 border rounded text-sm bg-white">Source ▾</button>
              {sourceFilterOpen && (
                <div className="absolute right-0 mt-1 bg-white border rounded shadow text-sm z-10">
                  {['All','Google Meet','Zoom','Teams'].map(s=> (
                    <div key={s} className="px-3 py-1 hover:bg-neutral-50 cursor-pointer" onClick={()=>setSourceFilterOpen(false)}>{s}</div>
                  ))}
                </div>
              )}
            </div>
            <div className="ml-auto">
              <label className="px-3 py-2 bg-black text-white rounded text-sm cursor-pointer">
                Upload
                <input type="file" accept="video/*,audio/*" className="hidden" onChange={async (e)=>{
                  const f = e.target.files?.[0];
                  if (!f) return;
                  try {
                    const targetId = Object.keys(selected).find(id => selected[id]) || meetings[0]?.id;
                    if (!targetId) {
                      alert('Select a meeting first.');
                      return;
                    }
                    // Prefer sending as multipart, but if it fails, fallback to raw body
                    const fd = new FormData();
                    fd.set('file', f);
                    const resp = await fetch(`/api/meetings/${targetId}/upload`, { method: 'POST', body: fd });
                    if (!resp.ok) throw new Error(await resp.text());
                    refresh();
                  } catch (e) {
                    console.error('Upload failed', e);
                  } finally {
                    if (e.target) (e.target as HTMLInputElement).value = '';
                  }
                }} />
              </label>
            </div>
          </div>

          {loading ? (
            <div className="text-neutral-600">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="text-neutral-600">No meetings found.</div>
          ) : (
            <>
            {/* Desktop/tablet table */}
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b text-neutral-600">
                    <th className="py-2 px-2 w-8">
                      <input type="checkbox" aria-label="Select all" onChange={(e)=>{
                        const next: Record<string, boolean> = {};
                        filtered.forEach((m)=> next[m.id] = e.target.checked);
                        setSelected(next);
                      }} />
                    </th>
                    <th className="py-2 px-2">Source</th>
                    <th className="py-2 px-2">Name</th>
                    <th className="py-2 px-2">Date & Time</th>
                    <th className="py-2 px-2">Tags</th>
                    <th className="py-2 px-2">Owner</th>
                    <th className="py-2 px-2 w-10">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr key={m.id} className="border-b hover:bg-neutral-50">
                      <td className="py-2 px-2">
                        <input type="checkbox" checked={!!selected[m.id]} onChange={(e)=> setSelected({...selected, [m.id]: e.target.checked})} />
                      </td>
                      <td className="py-2 px-2 text-neutral-800">{m.provider}</td>
                      <td className="py-2 px-2">
                        <button
                          className="text-black hover:underline"
                          onClick={() => router.push(`/meetings/${m.id}`)}
                        >
                          {m.title}
                        </button>
                      </td>
                      <td className="py-2 px-2">{new Date(m.date).toLocaleString()}</td>
                      <td className="py-2 px-2">
                        <div className="flex flex-wrap gap-1">
                          {(m.tags || []).map((t) => (
                            <span key={t} className="px-2 py-0.5 text-xs rounded bg-yellow-100 text-yellow-800">
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full bg-neutral-200 flex items-center justify-center text-xs border">A</div>
                          <div className="w-6 h-6 rounded-full bg-neutral-300 flex items-center justify-center text-xs border">B</div>
                        </div>
                      </td>
                      <td className="py-2 px-2">
                        <button onClick={() => remove(m.id)} className="text-neutral-500 hover:text-black">⋯</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile card list */}
            <div className="md:hidden divide-y">
              {filtered.map((m)=> (
                <div key={m.id} className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{m.title}</div>
                    <button onClick={()=> router.push(`/meetings/${m.id}`)} className="text-xs px-2 py-1 border rounded">Open</button>
                  </div>
                  <div className="text-xs text-neutral-600">{m.provider} • {new Date(m.date).toLocaleDateString()}</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {(m.tags || []).map(t=> <span key={t} className="px-2 py-0.5 text-[11px] rounded bg-yellow-100 text-yellow-800">{t}</span>)}
                  </div>
                </div>
              ))}
            </div>
            {/* Pagination stub */}
            <div className="px-4 py-2 border-t text-sm text-neutral-600 flex items-center gap-2">
              <button className="px-2 py-1 border rounded bg-white">«</button>
              <span>1</span>
              <span className="mx-1">of</span>
              <span>3</span>
              <button className="px-2 py-1 border rounded bg-white">»</button>
            </div>
            </>
          )}
        </div>

        {showCreate && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white rounded-lg p-5 w-full max-w-md">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Create Meeting</h2>
                <button onClick={() => setShowCreate(false)} className="text-neutral-500">✕</button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm mb-1">Title</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="Client Meeting" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Provider</label>
                  <select value={provider} onChange={(e) => setProvider(e.target.value)} className="w-full border rounded px-3 py-2 text-sm bg-white">
                    <option>Zoom</option>
                    <option>Google Meet</option>
                    <option>Teams</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Date</label>
                  <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Tags (comma separated)</label>
                  <input value={tags} onChange={(e) => setTags(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="brainstorming, design" />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setShowCreate(false)} className="px-3 py-2 border rounded text-sm">Cancel</button>
                <button onClick={createMeeting} className="px-3 py-2 bg-black text-white rounded text-sm">Create</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


