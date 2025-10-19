"use client";

import { useState } from "react";
import Link from "next/link";

export default function Onboarding() {
  const [step, setStep] = useState(1);

  function onNext() {
    if (step >= 4) {
      window.location.href = "/connect"; // move to tools page after last step
      return;
    }
    setStep((s) => Math.min(4, s + 1));
  }

  return (
    <main className="min-h-screen bg-[#f7f8f9] py-6 px-4">
      <div className="mx-auto w-full max-w-6xl bg-white rounded-2xl shadow-sm p-6 sm:p-8 grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6">Here&apos;s what Saku AI can Do for you !</h2>
          <div className="space-y-3">
            <ButtonItem index={1} active={step === 1} title="Launcher" subtitle="Converse naturally and ask Saku to take actions." onClick={() => setStep(1)} />
            <ButtonItem index={2} active={step === 2} title="Chat" subtitle="Connect all chats & tools with integration" onClick={() => setStep(2)} />
            <ButtonItem index={3} active={step === 3} title="Workflow automation" subtitle="Find anything across Gmail, Slack, Docs, Notion." onClick={() => setStep(3)} />
            <ButtonItem index={4} active={step === 4} title="Integration & Agent functionality" subtitle="Create workflows that run automatically." onClick={() => setStep(4)} />
          </div>
          <div className="flex flex-wrap gap-2 mt-6 items-center">
            <button className="border rounded px-3 py-2 disabled:opacity-50" disabled={step === 1} onClick={() => setStep((s) => Math.max(1, s - 1))}>Previous</button>
            <button className="bg-[#0b1220] text-white rounded px-4 py-2" onClick={onNext}>{step >= 4 ? "Finish" : "Next"}</button>
            <Link href="/connect" className="ml-auto underline text-sm">Skip</Link>
          </div>
        </div>
        <div className="rounded-xl bg-[#f7f8f9] border min-h-[220px] sm:min-h-[360px] flex items-center justify-center p-3">
          {/* Placeholder visual per Figma mock */}
          <div className="w-full h-full max-w-[520px] aspect-[4/3] bg-white border rounded-xl flex items-center justify-center text-neutral-400">
            Visual
          </div>
        </div>
      </div>
    </main>
  );
}

function ButtonItem({ active, title, subtitle, onClick, index }: { active?: boolean; title: string; subtitle: string; onClick?: () => void; index: number }) {
  return (
    <button onClick={onClick} className={`w-full text-left rounded-xl border px-4 py-3 transition-colors ${active ? "ring-1 ring-[#0b1220] border-[#0b1220] bg-[#f9fafb]" : "hover:bg-black/5"}`}>
      <div className="flex items-center gap-3">
        <span className={`h-6 w-6 flex items-center justify-center rounded-full text-xs ${active ? "bg-[#0b1220] text-white" : "bg-black/5"}`}>{index}</span>
        <div>
          <div className="font-medium">{title}</div>
          <div className="text-sm text-neutral-600">{subtitle}</div>
        </div>
      </div>
    </button>
  );
}


