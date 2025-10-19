import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backend) return NextResponse.json({ error: "Backend not configured" }, { status: 500 });
  const body = await request.json().catch(() => ({} as any));
  const form = new FormData();
  form.set("title", String(body.title || ""));
  if (body.assignee) form.set("assignee", String(body.assignee));
  if (body.due) form.set("due", String(body.due));
  const resp = await fetch(`${backend.replace(/\/$/, "")}/meetings/${params.id}/actions`, { method: "POST", body: form as any });
  const json = await resp.json().catch(() => ({ ok: false }));
  return NextResponse.json(json, { status: resp.status });
}


