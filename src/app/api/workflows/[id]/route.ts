import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backend) return NextResponse.json({ error: "Backend not configured" }, { status: 500 });
  const resp = await fetch(`${backend.replace(/\/$/, "")}/workflows/${params.id}`);
  const json = await resp.json().catch(() => ({ ok: false }));
  return NextResponse.json(json, { status: resp.status });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backend) return NextResponse.json({ error: "Backend not configured" }, { status: 500 });
  const body = await request.json().catch(() => ({} as any));
  const form = new FormData();
  if (body.name !== undefined) form.set("name", String(body.name));
  if (body.description !== undefined) form.set("description", String(body.description));
  if (body.status !== undefined) form.set("status", String(body.status));
  if (body.nodes !== undefined) form.set("nodes", JSON.stringify(body.nodes));
  if (body.connections !== undefined) form.set("connections", JSON.stringify(body.connections));
  const resp = await fetch(`${backend.replace(/\/$/, "")}/workflows/${params.id}`, { method: "PUT", body: form as any });
  const json = await resp.json().catch(() => ({ ok: false }));
  return NextResponse.json(json, { status: resp.status });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backend) return NextResponse.json({ error: "Backend not configured" }, { status: 500 });
  const resp = await fetch(`${backend.replace(/\/$/, "")}/workflows/${params.id}`, { method: "DELETE" });
  const json = await resp.json().catch(() => ({ ok: false }));
  return NextResponse.json(json, { status: resp.status });
}


