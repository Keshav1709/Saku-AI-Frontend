import {NextResponse} from 'next/server';

export async function GET() {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (backend) {
    try {
      const resp = await fetch(`${backend.replace(/\/$/, '')}/connectors`);
      const json = await resp.json().catch(() => ({connectors: []}));
      return NextResponse.json(json);
    } catch (error) {
      console.error('Failed to fetch connectors:', error);
    }
  }
  // Fallback mock
  return NextResponse.json({
    connectors: [
      {key: 'gmail', name: 'Gmail', connected: false},
      {key: 'google-drive', name: 'Google Drive', connected: false},
      {key: 'google-calendar', name: 'Google Calendar', connected: false},
      {key: 'slack', name: 'Slack', connected: false},
      {key: 'notion', name: 'Notion', connected: false},
      {key: 'discord', name: 'Discord', connected: false},
    ],
  });
}

export async function POST(request: Request) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backend) {
    return NextResponse.json({error: 'Backend not configured'}, {status: 500});
  }

  try {
    const body = await request.json();
    const resp =
        await fetch(`${backend.replace(/\/$/, '')}/connectors/toggle`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

    if (!resp.ok) {
      throw new Error(`HTTP error! status: ${resp.status}`);
    }

    const json = await resp.json();
    return NextResponse.json(json);
  } catch (error) {
    console.error('Failed to toggle connector:', error);
    return NextResponse.json(
        {error: 'Failed to toggle connector'}, {status: 500});
  }
}
