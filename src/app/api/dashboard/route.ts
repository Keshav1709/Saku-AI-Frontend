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

    // Fetch all data in parallel
    const [gmailResponse, calendarResponse, tasksResponse] = await Promise.allSettled([
      // Gmail messages
      fetch(
          'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5',
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }),

      // Calendar events for today
      (() => {
        const now = new Date();
        const startOfDay =
            new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay =
            new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        return fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${
                startOfDay.toISOString()}&timeMax=${
                endOfDay
                    .toISOString()}&maxResults=10&singleEvents=true&orderBy=startTime`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            });
      })(),

      // Tasks
      fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })
    ]);

    // Process Gmail messages
    let gmailMessages: any[] = [];
    if (gmailResponse.status === 'fulfilled' && gmailResponse.value.ok) {
      const messagesData = await gmailResponse.value.json();

      if (messagesData.messages?.length > 0) {
        const messageDetails = await Promise.allSettled(
            messagesData.messages.slice(0, 5).map(async (message: any) => {
              const messageResponse = await fetch(
                  `https://gmail.googleapis.com/gmail/v1/users/me/messages/${
                      message.id}`,
                  {
                    headers: {
                      'Authorization': `Bearer ${accessToken}`,
                      'Content-Type': 'application/json',
                    },
                  });

              if (messageResponse.ok) {
                const messageData = await messageResponse.json();
                const headers = messageData.payload?.headers || [];

                return {
                  id: message.id,
                  subject:
                      headers.find((h: any) => h.name === 'Subject')?.value ||
                      'No Subject',
                  from: headers.find((h: any) => h.name === 'From')?.value ||
                      'Unknown Sender',
                  date: headers.find((h: any) => h.name === 'Date')?.value ||
                      'Unknown Date',
                  snippet: messageData.snippet || 'No preview available'
                };
              }
              return null;
            }));

        gmailMessages =
            messageDetails
                .filter(
                    (result): result is PromiseFulfilledResult<any> =>
                        result.status === 'fulfilled' && result.value !== null)
                .map(result => result.value);
      }
    }

    // Process Calendar events
    let calendarEvents: any[] = [];
    if (calendarResponse.status === 'fulfilled' && calendarResponse.value.ok) {
      const calendarData = await calendarResponse.value.json();
      calendarEvents =
          calendarData.items?.map((event: any) => ({
                                    id: event.id,
                                    summary: event.summary || 'No Title',
                                    description: event.description || '',
                                    start: event.start,
                                    end: event.end,
                                    location: event.location || '',
                                    status: event.status,
                                    htmlLink: event.htmlLink,
                                    attendees: event.attendees || []
                                  })) ||
          [];
    }

    // Process Tasks
    let tasks: any[] = [];
    if (tasksResponse.status === 'fulfilled' && tasksResponse.value.ok) {
      const taskListsData = await tasksResponse.value.json();
      const taskLists = taskListsData.items || [];

      if (taskLists.length > 0) {
        const defaultListId = taskLists[0].id;

        const tasksFetch = await fetch(
            `https://tasks.googleapis.com/tasks/v1/lists/${
                defaultListId}/tasks?showCompleted=false&maxResults=20`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
            });

        if (tasksFetch.ok) {
          const tasksData = await tasksFetch.json();
          tasks = tasksData.items?.map((task: any) => ({
                                         id: task.id,
                                         title: task.title,
                                         notes: task.notes || '',
                                         due: task.due,
                                         status: task.status,
                                         completed: task.completed,
                                         position: task.position,
                                         updated: task.updated
                                       })) ||
              [];
        }
      }
    }

    return NextResponse.json(
        {success: true, data: {gmailMessages, calendarEvents, tasks}});

  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json(
        {
          error: 'Failed to fetch dashboard data',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        {status: 500});
  }
}
