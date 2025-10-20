import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backend) return NextResponse.json({ error: "Backend not configured" }, { status: 500 });

    let blob: Blob | null = null;
    let filename = request.headers.get('x-file-name') || 'recording';
    let contentType = request.headers.get('x-file-type') || 'application/octet-stream';

    const ct = request.headers.get('content-type') || '';
    if (ct.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');
      if (file instanceof Blob) {
        blob = file as Blob;
        // @ts-ignore
        filename = (file as any).name || filename;
        // @ts-ignore
        contentType = (file as any).type || contentType;
      }
    } else {
      const buf = Buffer.from(await request.arrayBuffer());
      blob = new Blob([buf], { type: contentType });
    }
    if (!blob) return NextResponse.json({ error: "No file" }, { status: 400 });

    // 1) Request signed URL from backend
    const signForm = new FormData();
    signForm.set("filename", filename);
    signForm.set("contentType", contentType);
    const signResp = await fetch(`${backend.replace(/\/$/, "")}/meetings/${params.id}/upload-url`, {
      method: "POST",
      body: signForm as any,
    });
    if (!signResp.ok) {
      const t = await signResp.text();
      return NextResponse.json({ error: `sign_failed: ${signResp.status} ${t}` }, { status: 500 });
    }
    const meta = await signResp.json();
    if (!meta?.uploadUrl || !meta?.objectUri) {
      return NextResponse.json({ error: "invalid_sign_response" }, { status: 500 });
    }

    // 2) PUT file to GCS from the server to avoid CORS
    const buf = Buffer.from(await blob.arrayBuffer());
    const putResp = await fetch(meta.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: buf,
    });
    if (!putResp.ok) {
      const t = await putResp.text().catch(() => "");
      return NextResponse.json({ error: `upload_failed: ${putResp.status} ${t}` }, { status: 500 });
    }

    // 3) Save recording URI & kick off analysis
    const recForm = new FormData();
    recForm.set("objectUri", meta.objectUri);
    await fetch(`${backend.replace(/\/$/, "")}/meetings/${params.id}/recording`, { method: "POST", body: recForm as any });
    await fetch(`${backend.replace(/\/$/, "")}/meetings/${params.id}/transcribe`, { method: "POST" });
    await fetch(`${backend.replace(/\/$/, "")}/meetings/${params.id}/insights/run`, { method: "POST" });

    return NextResponse.json({ ok: true, objectUri: meta.objectUri });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}


