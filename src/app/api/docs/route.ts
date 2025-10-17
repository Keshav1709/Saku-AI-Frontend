import { NextResponse } from "next/server";

export async function GET() {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (backend) {
    const resp = await fetch(`${backend.replace(/\/$/, "")}/docs`);
    const json = await resp.json().catch(() => ({ docs: [] }));
    return NextResponse.json(json);
  }
  const docs = [
    { id: "1", title: "Welcome.pdf", createdAt: new Date().toISOString() },
    { id: "2", title: "Spec.txt", createdAt: new Date(Date.now() - 86400000).toISOString() },
  ];
  return NextResponse.json({ docs });
}


