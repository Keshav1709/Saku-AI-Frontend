import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ ok: false, error: "No file" }, { status: 400 });
  }
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (backend) {
    const upstream = new FormData();
    upstream.append("file", file);
    const resp = await fetch(`${backend.replace(/\/$/, "")}/ingest/upload`, { method: "POST", body: upstream });
    const json = await resp.json().catch(() => ({ ok: false }));
    return NextResponse.json(json, { status: resp.ok ? 200 : resp.status });
  }
  return NextResponse.json({ ok: true, name: (file as File).name });
}


