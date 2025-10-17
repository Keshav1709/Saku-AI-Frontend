import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (backend) {
    const resp = await fetch(`${backend.replace(/\/$/, "")}/connectors/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await resp.json().catch(() => ({ ok: false }));
    return NextResponse.json(json, { status: resp.ok ? 200 : resp.status });
  }
  return NextResponse.json({ ok: true });
}


