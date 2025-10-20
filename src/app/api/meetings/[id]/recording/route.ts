import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backend) return NextResponse.json({ error: "Backend not configured" }, { status: 500 });
  const body = await request.json().catch(() => ({} as any));
  const form = new FormData();
  form.set("objectUri", String(body.objectUri || ""));
  const resp = await fetch(`${backend.replace(/\/$/, "")}/meetings/${params.id}/recording`, { method: 'POST', body: form as any });
  const json = await resp.json().catch(() => ({ ok: false }));
  return NextResponse.json(json, { status: resp.status });
}


