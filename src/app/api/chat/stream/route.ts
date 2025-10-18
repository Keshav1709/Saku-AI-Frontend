import { NextResponse } from "next/server";

export const runtime = "nodejs";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const prompt = searchParams.get("prompt") || "";

  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (backend) {
    // Proxy to FastAPI backend SSE
    const target = `${backend.replace(/\/$/, "")}/chat/stream?prompt=${encodeURIComponent(prompt)}`;
    const resp = await fetch(target, { headers: { Accept: "text/event-stream" } });
    if (!resp.body) return new NextResponse("", { status: 502 });
    return new NextResponse(resp.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (obj: unknown) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

      // Initial thought event (optional)
      send({ type: "meta", prompt });

      const tokens = (
        `Thanks for your message: ${prompt}. This is a streamed response from the SSE mock. ` +
        `We will replace this with the FastAPI backend soon.\n\n`
      ).split(/(\s+)/);

      for (const t of tokens) {
        send({ type: "token", value: t });
        // small delay to simulate streaming
        await sleep(25);
      }

      send({ type: "done" });
      controller.close();
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}


