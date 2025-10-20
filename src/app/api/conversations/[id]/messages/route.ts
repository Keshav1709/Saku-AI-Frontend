import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backend) return NextResponse.json({ error: "Backend not configured" }, { status: 500 });

  const body = await request.formData().catch(() => new FormData());
  const role = String(body.get("role") || "user");
  const content = String(body.get("content") || "");
  const citations = String(body.get("citations") || "");
  const docIds = String(body.get("docIds") || "");

  const form = new FormData();
  form.set("role", role);
  form.set("content", content);
  if (citations) form.set("citations", citations);
  if (docIds) form.set("docIds", docIds);

  const resp = await fetch(`${backend.replace(/\/$/, "")}/conversations/${params.id}/messages`, {
    method: "POST",
    body: form as any,
  });
  const json = await resp.json().catch(() => ({ ok: false }));
  return NextResponse.json(json, { status: resp.status });
}


