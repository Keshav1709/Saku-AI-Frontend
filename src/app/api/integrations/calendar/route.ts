import {auth} from '@/lib/auth';
import {NextRequest, NextResponse} from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.email) {
      return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    // Get access token from session
    const accessToken = (session as any).accessToken;

    if (!accessToken) {
      return NextResponse.json(
          {
            error: 'No access token available. Please re-authenticate.',
            needsReauth: true
          },
          {status: 401});
    }

    // Get current date range for events (next 7 days)
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const timeMin = now.toISOString();
    const timeMax = nextWeek.toISOString();

    // Fetch Google Calendar events
    const calendarResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${
            timeMin}&timeMax=${
            timeMax}&maxResults=10&singleEvents=true&orderBy=startTime`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

    if (!calendarResponse.ok) {
      throw new Error(`Calendar API error: ${calendarResponse.status}`);
    }

    const calendarData = await calendarResponse.json();

    const events =
        calendarData.items?.map((event: any) => ({
                                  id: event.id,
                                  summary: event.summary || 'No Title',
                                  description: event.description || '',
                                  start: event.start,
                                  end: event.end,
                                  location: event.location || '',
                                  status: event.status,
                                  htmlLink: event.htmlLink
                                })) ||
        [];

    return NextResponse.json(
        {success: true, events: events, totalCount: events.length});

  } catch (error) {
    console.error('Calendar API Error:', error);
    return NextResponse.json(
        {
          error: 'Failed to fetch Calendar events',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        {status: 500});
  }
}
