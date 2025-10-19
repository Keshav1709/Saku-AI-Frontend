"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MainSidebar } from "@/components/MainSidebar";

export default function MeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [meeting, setMeeting] = useState<any>(null);
  const [tab, setTab] = useState<"notes" | "agenda" | "actions">("notes");
  const [noteText, setNoteText] = useState("");
  const [agendaItem, setAgendaItem] = useState("");
  const [actionTitle, setActionTitle] = useState("");
  const [actionAssignee, setActionAssignee] = useState("");
  const [actionDue, setActionDue] = useState("");
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);

  async function load() {
    const resp = await fetch(`/api/meetings/${id}`);
    const json = await resp.json();
    setMeeting(json.meeting || null);
  }

  useEffect(() => {
    const token = localStorage.getItem("saku_auth");
    if (!token) router.replace("/login");
    load();
  }, [id, router]);

  async function addNote() {
    if (!noteText.trim()) return;
    await fetch(`/api/meetings/${id}/notes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: noteText }) });
    setNoteText("");
    load();
  }

  async function addAgenda() {
    if (!agendaItem.trim()) return;
    await fetch(`/api/meetings/${id}/agenda`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ item: agendaItem }) });
    setAgendaItem("");
    load();
  }

  async function addAction() {
    if (!actionTitle.trim()) return;
    await fetch(`/api/meetings/${id}/actions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: actionTitle, assignee: actionAssignee, due: actionDue }) });
    setActionTitle("");
    setActionAssignee("");
    setActionDue("");
    load();
  }

  async function uploadRecording(file: File) {
    setUploading(true);
    try {
      const metaResp = await fetch(`/api/meetings/${id}/upload-url`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename: file.name, contentType: file.type }) });
      const meta = await metaResp.json();
      if (!meta?.uploadUrl) throw new Error('signing_failed');
      await fetch(meta.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
      // Save the objectUri as meeting recording
      await fetch(`/api/meetings/${id}/recording`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ objectUri: meta.objectUri }) });
      await load();
    } finally {
      setUploading(false);
    }
  }

  async function transcribeAndAnalyze() {
    setProcessing(true);
    try {
      await fetch(`/api/meetings/${id}/transcribe`, { method: 'POST' });
      await fetch(`/api/meetings/${id}/insights/run`, { method: 'POST' });
      await load();
    } finally {
      setProcessing(false);
    }
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-[#f7f8f9] flex">
        <MainSidebar />
        <main className="flex-1 p-6">Loading…</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8f9] flex">
      <MainSidebar />
      <main className="flex-1 p-6">
        {/* Top header like Figma */}
        <div className="mb-4">
          <div className="flex items-center gap-4 text-sm text-neutral-700 mb-3">
            <span className="px-2 py-1 border rounded bg-white">GPT-4</span>
            <span className="px-2 py-1 border rounded bg-white">All Sources</span>
            <span className="px-2 py-1 border rounded bg-white">All Access</span>
          </div>
          <div className="relative mb-3">
            <input placeholder="Ask anything or type / for commands…" className="w-full border rounded px-3 py-2 pr-20 text-sm" />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-neutral-400">
              <span>🔍</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border grid grid-cols-12 gap-0">
          {/* Left: media and highlights */}
          <div className="col-span-8 p-4 border-r">
            <div className="bg-black/5 rounded aspect-video flex items-center justify-center text-neutral-500 mb-3">Client Meeting.mp4</div>
            <div className="flex items-center gap-4 text-sm text-neutral-700 mb-2">
              <button className="border-b-2 border-black">Highlights</button>
              <button className="text-neutral-500">Chapters</button>
            </div>
            <div className="space-y-2">
              {[1,2,3,4].map(i=> (
                <div key={i} className="p-3 border rounded flex items-center gap-3">
                  <div className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700">Topic</div>
                  <div className="text-sm text-neutral-800 flex-1">Sample highlight item {i}</div>
                  <div className="w-16 h-10 bg-neutral-100 rounded"></div>
                </div>
              ))}
            </div>
          </div>
          {/* Right: tabs and panels */}
          <div className="col-span-4">
            <div className="flex items-center gap-4 px-4 py-2 border-b">
              {(['notes','agenda','actions'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} className={`text-sm pb-2 ${tab===t?'border-b-2 border-black text-black':'text-neutral-600 hover:text-black'}`}>{t[0].toUpperCase()+t.slice(1)}</button>
              ))}
              <div className="ml-auto flex items-center gap-2">
                <label className="text-sm px-3 py-1 border rounded cursor-pointer bg-white">
                  Upload Recording
                  <input type="file" accept="video/*,audio/*" className="hidden" onChange={(e)=>{ const f=e.target.files?.[0]; if (f) uploadRecording(f); }} />
                </label>
                <button onClick={transcribeAndAnalyze} className="text-sm px-3 py-1 bg-black text-white rounded" disabled={processing}>
                  {processing? 'Processing…':'Analyze'}
                </button>
              </div>
            </div>
          <div className="flex items-center gap-4 px-4 py-2 border-b">
            {(['notes','agenda','actions'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`text-sm pb-2 ${tab===t?'border-b-2 border-black text-black':'text-neutral-600 hover:text-black'}`}>{t[0].toUpperCase()+t.slice(1)}</button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <label className="text-sm px-3 py-1 border rounded cursor-pointer bg-white">
                Upload Recording
                <input type="file" accept="video/*,audio/*" className="hidden" onChange={(e)=>{ const f=e.target.files?.[0]; if (f) uploadRecording(f); }} />
              </label>
              <button onClick={transcribeAndAnalyze} className="text-sm px-3 py-1 bg-black text-white rounded" disabled={processing}>
                {processing? 'Processing…':'Transcribe & Analyze'}
              </button>
            </div>
          </div>

            <div className="p-4 space-y-4">
            {tab === 'notes' && (
              <div className="space-y-4">
                {/* Summary card */}
                {meeting.insights?.summary && (
                  <div className="border rounded p-3">
                    <div className="text-sm font-medium mb-1">Summary</div>
                    <div className="text-sm text-neutral-700">{meeting.insights.summary}</div>
                  </div>
                )}
                <div className="flex gap-2">
                  <input value={noteText} onChange={(e)=>setNoteText(e.target.value)} placeholder="Add a note…" className="flex-1 border rounded px-3 py-2 text-sm" />
                  <button onClick={addNote} className="px-3 py-2 bg-black text-white rounded text-sm">Add</button>
                </div>
                <div className="space-y-2">
                  {(meeting.notes || []).map((n:any)=> (
                    <div key={n.id} className="p-3 border rounded">{n.text}</div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'agenda' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input value={agendaItem} onChange={(e)=>setAgendaItem(e.target.value)} placeholder="Agenda item…" className="flex-1 border rounded px-3 py-2 text-sm" />
                  <button onClick={addAgenda} className="px-3 py-2 bg-black text-white rounded text-sm">Add</button>
                </div>
                <div className="space-y-2">
                  {(meeting.agenda || []).map((a:any)=> (
                    <div key={a.id} className="p-3 border rounded">{a.item}</div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'actions' && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <input value={actionTitle} onChange={(e)=>setActionTitle(e.target.value)} placeholder="Action title…" className="border rounded px-3 py-2 text-sm" />
                  <input value={actionAssignee} onChange={(e)=>setActionAssignee(e.target.value)} placeholder="Assignee" className="border rounded px-3 py-2 text-sm" />
                  <input value={actionDue} onChange={(e)=>setActionDue(e.target.value)} placeholder="Due (optional)" className="border rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <button onClick={addAction} className="px-3 py-2 bg-black text-white rounded text-sm">Add Action</button>
                </div>
                <div className="space-y-2">
                  {(meeting.actions || []).map((a:any)=> (
                    <div key={a.id} className="p-3 border rounded flex items-center justify-between">
                      <div>
                        <div className="font-medium">{a.title}</div>
                        <div className="text-xs text-neutral-600">{a.assignee || 'Unassigned'} {a.due ? `• Due ${a.due}`: ''}</div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded ${a.done? 'bg-green-100 text-green-700':'bg-neutral-100 text-neutral-700'}`}>{a.done? 'Done':'Open'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


