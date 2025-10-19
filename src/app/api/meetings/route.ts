import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backend) return NextResponse.json({ error: "Backend not configured" }, { status: 500 });
  const resp = await fetch(`${backend.replace(/\/$/, "")}/meetings`);
  const json = await resp.json().catch(() => ({ meetings: [] }));
  return NextResponse.json(json, { status: resp.status });
}

export async function POST(request: NextRequest) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backend) return NextResponse.json({ error: "Backend not configured" }, { status: 500 });
  const body = await request.json().catch(() => ({} as any));
  const form = new FormData();
  form.set("title", String(body.title || ""));
  form.set("provider", String(body.provider || "Zoom"));
  if (body.date) form.set("date", String(body.date));
  form.set("tags", JSON.stringify(body.tags || []));
  const resp = await fetch(`${backend.replace(/\/$/, "")}/meetings`, { method: "POST", body: form as any });
  const json = await resp.json().catch(() => ({ ok: false }));
  return NextResponse.json(json, { status: resp.status });
}


