import {NextRequest, NextResponse} from 'next/server';

export async function GET(request: NextRequest) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backend) {
    return NextResponse.json({error: 'Backend not configured'}, {status: 500});
  }

  const {searchParams} = new URL(request.url);
  const key = searchParams.get('key');

  if (!key) {
    return NextResponse.json(
        {error: 'Key parameter is required'}, {status: 400});
  }

  try {
    const resp =
        await fetch(`${backend.replace(/\/$/, '')}/connectors/${key}/auth-url`);

    if (!resp.ok) {
      throw new Error(`HTTP error! status: ${resp.status}`);
    }

    const json = await resp.json();
    return NextResponse.json(json);
  } catch (error) {
    console.error('Failed to get auth URL:', error);
    return NextResponse.json({error: 'Failed to get auth URL'}, {status: 500});
  }
}
