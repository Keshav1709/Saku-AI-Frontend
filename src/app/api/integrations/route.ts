import {NextRequest, NextResponse} from 'next/server';

export async function GET(request: NextRequest) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backend) {
    return NextResponse.json({error: 'Backend not configured'}, {status: 500});
  }

  const {searchParams} = new URL(request.url);
  const service = searchParams.get('service');
  const type = searchParams.get('type');
  const maxResults = searchParams.get('maxResults') || '10';
  const query = searchParams.get('query') || undefined;

  if (!service || !type) {
    return NextResponse.json(
        {error: 'Service and type parameters are required'}, {status: 400});
  }

  try {
    let endpoint = '';
    let params = new URLSearchParams();

    params.append('max_results', maxResults);
    if (query) {
      params.append('query', query);
    }

    switch (service) {
      case 'gmail':
        endpoint = `/integrations/gmail/messages`;
        break;
      case 'drive':
        endpoint = `/integrations/drive/files`;
        break;
      case 'calendar':
        endpoint = `/integrations/calendar/events`;
        const timeMin = searchParams.get('timeMin');
        if (timeMin) {
          params.append('time_min', timeMin);
        }
        break;
      default:
        return NextResponse.json({error: 'Unknown service'}, {status: 400});
    }

    const url = `${backend.replace(/\/$/, '')}${endpoint}?${params.toString()}`;
    const resp = await fetch(url);

    if (!resp.ok) {
      throw new Error(`HTTP error! status: ${resp.status}`);
    }

    const json = await resp.json();
    return NextResponse.json(json);
  } catch (error) {
    console.error(`Failed to fetch ${service} ${type}:`, error);
    return NextResponse.json(
        {error: `Failed to fetch ${service} ${type}`}, {status: 500});
  }
}

export async function POST(request: NextRequest) {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backend) {
    return NextResponse.json({error: 'Backend not configured'}, {status: 500});
  }

  try {
    const body = await request.json();
    const {action, ...payload} = body;

    let endpoint = '';
    switch (action) {
      case 'disconnect':
        endpoint = '/integrations/disconnect';
        break;
      case 'download':
        endpoint = `/integrations/drive/download/${payload.file_id}`;
        break;
      default:
        return NextResponse.json({error: 'Unknown action'}, {status: 400});
    }

    const resp = await fetch(`${backend.replace(/\/$/, '')}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      throw new Error(`HTTP error! status: ${resp.status}`);
    }

    const json = await resp.json();
    return NextResponse.json(json);
  } catch (error) {
    console.error('Failed to perform integration action:', error);
    return NextResponse.json(
        {error: 'Failed to perform action'}, {status: 500});
  }
}
