import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backend) return NextResponse.json({ error: "Backend not configured" }, { status: 500 });
  const resp = await fetch(`${backend.replace(/\/$/, "")}/meetings/${params.id}`);
  const json = await resp.json().catch(() => ({ ok: false }));
  return NextResponse.json(json, { status: resp.status });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backend) return NextResponse.json({ error: "Backend not configured" }, { status: 500 });
  const body = await request.json().catch(() => ({} as any));
  const form = new FormData();
  if (body.title !== undefined) form.set("title", String(body.title));
  if (body.provider !== undefined) form.set("provider", String(body.provider));
  if (body.date !== undefined) form.set("date", String(body.date));
  if (body.tags !== undefined) form.set("tags", JSON.stringify(body.tags));
  const resp = await fetch(`${backend.replace(/\/$/, "")}/meetings/${params.id}`, { method: "PUT", body: form as any });
  const json = await resp.json().catch(() => ({ ok: false }));
  return NextResponse.json(json, { status: resp.status });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backend) return NextResponse.json({ error: "Backend not configured" }, { status: 500 });
  const resp = await fetch(`${backend.replace(/\/$/, "")}/meetings/${params.id}`, { method: "DELETE" });
  const json = await resp.json().catch(() => ({ ok: false }));
  return NextResponse.json(json, { status: resp.status });
}


