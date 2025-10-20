import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backend) return NextResponse.json({ error: "Backend not configured" }, { status: 500 });

  const form = new FormData();
  const body = await request.formData().catch(() => new FormData());
  const userId = String(body.get("userId") || "default");
  form.set("user_id", userId);

  const resp = await fetch(`${backend.replace(/\/$/, "")}/conversations`, { method: "POST", body: form as any });
  const json = await resp.json().catch(() => ({ ok: false }));
  return NextResponse.json(json, { status: resp.status });
}


