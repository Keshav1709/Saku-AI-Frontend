import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { username, password } = body as { username?: string; password?: string };
  if (username === "test" && password === "test123") {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("saku_auth", "ok", { httpOnly: false, path: "/" });
    return res;
  }
  return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("saku_auth");
  return res;
}


