"use client";

import { useState } from "react";

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files ? Array.from(e.target.files) : [];
    setFiles((f) => [...f, ...selected]);
  }

  function removeAt(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function onUpload() {
    if (files.length === 0) return;
    setStatus("Uploading…");
    for (const f of files) {
      const form = new FormData();
      form.append("file", f);
      try {
        const res = await fetch("/api/docs/upload", { method: "POST", body: form });
        if (!res.ok) throw new Error();
      } catch {
        setStatus(`Failed uploading ${f.name}`);
        return;
      }
    }
    setFiles([]);
    setStatus("Uploaded");
  }

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold mb-4">Upload</h1>
      <div className="border rounded p-4">
        <input type="file" multiple onChange={onPick} />
        {files.length > 0 && (
          <ul className="mt-3 space-y-2">
            {files.map((f, i) => (
              <li key={i} className="flex items-center justify-between">
                <span className="truncate max-w-[70%]">{f.name}</span>
                <button className="text-sm underline" onClick={() => removeAt(i)}>
                  remove
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex gap-2">
          <button className="px-4 py-2 bg-black text-white rounded" onClick={onUpload}>
            Upload {files.length ? `(${files.length})` : ""}
          </button>
          {status && <span className="text-sm opacity-70">{status}</span>}
        </div>
      </div>
    </main>
  );
}


