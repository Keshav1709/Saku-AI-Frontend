"use client";

import { useState, useEffect } from "react";
import { MainSidebar } from "@/components/MainSidebar";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    if (isPending) return;
    
    if (!session) {
      router.replace("/auth/login");
      return;
    }
  }, [session, isPending, router]);

  // Show loading while checking authentication
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!session) {
    return null;
  }

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
    <div className="min-h-screen bg-[#f7f8f9] flex">
      <MainSidebar />
      <main className="flex-1 p-6">
        <div className="bg-white rounded-2xl border p-6">
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
        </div>
      </main>
    </div>
  );
}


