import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backend) return NextResponse.json({ error: "Backend not configured" }, { status: 500 });

  const body = await request.json().catch(() => ({} as any));
  const form = new FormData();
  form.set("query", String(body.query || ""));
  form.set("k", String(body.k || 5));

  const resp = await fetch(`${backend.replace(/\/$/, "")}/search`, { method: "POST", body: form as any });
  const json = await resp.json().catch(() => ({ results: [] }));
  return NextResponse.json(json, { status: resp.status });
}


