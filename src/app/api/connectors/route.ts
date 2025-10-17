import { NextResponse } from "next/server";

export async function GET() {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (backend) {
    const resp = await fetch(`${backend.replace(/\/$/, "")}/connectors`);
    const json = await resp.json().catch(() => ({ connectors: [] }));
    return NextResponse.json(json);
  }
  // Fallback mock
  return NextResponse.json({
    connectors: [
      { key: "gmail", name: "Gmail", connected: true },
      { key: "slack", name: "Slack", connected: false },
      { key: "drive", name: "Google Drive", connected: false },
      { key: "notion", name: "Notion", connected: false },
      { key: "calendar", name: "Google Calendar", connected: false },
      { key: "discord", name: "Discord", connected: false },
    ],
  });
}


