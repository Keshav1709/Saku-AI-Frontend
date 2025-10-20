import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backend) return NextResponse.json({ error: "Backend not configured" }, { status: 500 });
  const resp = await fetch(`${backend.replace(/\/$/, "")}/workflows`);
  const json = await resp.json().catch(() => ({ workflows: [] }));
  return NextResponse.json(json, { status: resp.status });
}

export async function POST(request: NextRequest) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backend) return NextResponse.json({ error: "Backend not configured" }, { status: 500 });
  const body = await request.json().catch(() => ({} as any));
  const form = new FormData();
  form.set("name", String(body.name || ""));
  form.set("description", String(body.description || ""));
  const resp = await fetch(`${backend.replace(/\/$/, "")}/workflows`, { method: "POST", body: form as any });
  const json = await resp.json().catch(() => ({ ok: false }));
  return NextResponse.json(json, { status: resp.status });
}


