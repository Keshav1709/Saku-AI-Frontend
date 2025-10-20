import {authOptions} from '@/lib/auth';
import {getServerSession} from 'next-auth';
import {NextRequest, NextResponse} from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    const {searchParams} = new URL(request.url);
    const query = searchParams.get('q');
    const source = searchParams.get('source') || 'all';

    if (!query) {
      return NextResponse.json(
          {error: 'Query parameter is required'}, {status: 400});
    }

    const accessToken = (session as any).accessToken;
    if (!accessToken) {
      return NextResponse.json(
          {error: 'No access token available'}, {status: 401});
    }

    const results: any[] = [];
    const searchPromises: Promise<any>[] = [];

    // Search Gmail if source is "all" or "gmail"
    if (source === 'all' || source === 'gmail') {
      searchPromises.push(searchGmail(accessToken, query).catch(err => {
        console.error('Gmail search error:', err);
        return {source: 'gmail', results: [], error: 'Gmail search failed'};
      }));
    }

    // Search Google Drive if source is "all" or "drive"
    if (source === 'all' || source === 'drive') {
      searchPromises.push(searchDrive(accessToken, query).catch(err => {
        console.error('Drive search error:', err);
        return {source: 'drive', results: [], error: 'Drive search failed'};
      }));
    }

    // Search Google Calendar if source is "all" or "calendar"
    if (source === 'all' || source === 'calendar') {
      searchPromises.push(searchCalendar(accessToken, query).catch(err => {
        console.error('Calendar search error:', err);
        return {
          source: 'calendar',
          results: [],
          error: 'Calendar search failed'
        };
      }));
    }

    // Search Google Tasks if source is "all" or "tasks"
    if (source === 'all' || source === 'tasks') {
      searchPromises.push(searchTasks(accessToken, query).catch(err => {
        console.error('Tasks search error:', err);
        return {source: 'tasks', results: [], error: 'Tasks search failed'};
      }));
    }

    const searchResults = await Promise.all(searchPromises);

    // Combine all results
    searchResults.forEach(result => {
      if (result.results && result.results.length > 0) {
        results.push(...result.results.map(
            (item: any) => ({...item, source: result.source})));
      }
    });

    // Sort by relevance (you can implement more sophisticated ranking)
    results.sort((a, b) => {
      const aScore = calculateRelevanceScore(a, query);
      const bScore = calculateRelevanceScore(b, query);
      return bScore - aScore;
    });

    return NextResponse.json({
      query,
      totalResults: results.length,
      results: results.slice(0, 50),  // Limit to top 50 results
      sources: {
        gmail:
            searchResults.find(r => r.source === 'gmail')?.results?.length || 0,
        drive:
            searchResults.find(r => r.source === 'drive')?.results?.length || 0,
        calendar:
            searchResults.find(r => r.source === 'calendar')?.results?.length ||
            0,
        tasks:
            searchResults.find(r => r.source === 'tasks')?.results?.length || 0
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}

async function searchGmail(accessToken: string, query: string) {
  const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/messages?q=${
          encodeURIComponent(query)}&maxResults=20`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

  if (!response.ok) {
    throw new Error(`Gmail API error: ${response.status}`);
  }

  const data = await response.json();
  const messages = data.messages || [];

  // Fetch detailed message data
  const detailedMessages =
      await Promise.all(messages.map(async (message: any) => {
        const detailResponse = await fetch(
            `https://gmail.googleapis.com/gmail/v1/messages/${message.id}`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });

        if (!detailResponse.ok) return null;

        const detailData = await detailResponse.json();
        const headers = detailData.payload?.headers || [];

        const getHeader = (name: string) =>
            headers
                .find((h: any) => h.name.toLowerCase() === name.toLowerCase())
                ?.value ||
            '';

        return {
          id: message.id,
          subject: getHeader('Subject'),
          from: getHeader('From'),
          date: getHeader('Date'),
          snippet: detailData.snippet || '',
          type: 'email',
          url: `https://mail.google.com/mail/u/0/#inbox/${message.id}`
        };
      }));

  return {source: 'gmail', results: detailedMessages.filter(Boolean)};
}

async function searchDrive(accessToken: string, query: string) {
  const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name contains '${
          encodeURIComponent(query)}' or fullText contains '${
          encodeURIComponent(
              query)}'&fields=files(id,name,mimeType,modifiedTime,size,webViewLink,thumbnailLink)`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

  if (!response.ok) {
    throw new Error(`Drive API error: ${response.status}`);
  }

  const data = await response.json();
  const files = data.files || [];

  return {
    source: 'drive',
    results: files.map((file: any) => ({
                         id: file.id,
                         title: file.name,
                         type: getFileType(file.mimeType),
                         date: file.modifiedTime,
                         size: file.size,
                         url: file.webViewLink,
                         thumbnail: file.thumbnailLink,
                         mimeType: file.mimeType
                       }))
  };
}

async function searchCalendar(accessToken: string, query: string) {
  const response = await fetch(
      `https://www.googleapis.com/calendar/v3/events?q=${
          encodeURIComponent(
              query)}&maxResults=20&singleEvents=true&orderBy=startTime`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

  if (!response.ok) {
    throw new Error(`Calendar API error: ${response.status}`);
  }

  const data = await response.json();
  const events = data.items || [];

  return {
    source: 'calendar',
    results: events.map((event: any) => ({
                          id: event.id,
                          title: event.summary || 'No Title',
                          description: event.description || '',
                          start: event.start?.dateTime || event.start?.date,
                          end: event.end?.dateTime || event.end?.date,
                          location: event.location || '',
                          type: 'event',
                          url: event.htmlLink
                        }))
  };
}

async function searchTasks(accessToken: string, query: string) {
  // First get task lists
  const listsResponse =
      await fetch('https://www.googleapis.com/tasks/v1/users/@me/lists', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

  if (!listsResponse.ok) {
    throw new Error(`Tasks API error: ${listsResponse.status}`);
  }

  const listsData = await listsResponse.json();
  const taskLists = listsData.items || [];

  // Search tasks in each list
  const allTasks: any[] = [];

  for (const list of taskLists) {
    const tasksResponse = await fetch(
        `https://www.googleapis.com/tasks/v1/lists/${list.id}/tasks?q=${
            encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

    if (tasksResponse.ok) {
      const tasksData = await tasksResponse.json();
      const tasks = tasksData.items || [];

      allTasks.push(
          ...tasks.map((task: any) => ({
                         id: task.id,
                         title: task.title,
                         notes: task.notes || '',
                         due: task.due,
                         status: task.status,
                         type: 'task',
                         listTitle: list.title,
                         url: `https://tasks.google.com/embed/${list.id}`
                       })));
    }
  }

  return {source: 'tasks', results: allTasks};
}

function getFileType(mimeType: string): string {
  if (mimeType.includes('pdf')) return 'PDF';
  if (mimeType.includes('word') || mimeType.includes('document'))
    return 'Document';
  if (mimeType.includes('sheet') || mimeType.includes('spreadsheet'))
    return 'Spreadsheet';
  if (mimeType.includes('presentation') || mimeType.includes('slides'))
    return 'Presentation';
  if (mimeType.includes('image')) return 'Image';
  if (mimeType.includes('video')) return 'Video';
  if (mimeType.includes('audio')) return 'Audio';
  return 'File';
}

function calculateRelevanceScore(item: any, query: string): number {
  const queryLower = query.toLowerCase();
  let score = 0;

  // Title matches get highest score
  if (item.title && item.title.toLowerCase().includes(queryLower)) {
    score += 10;
  }

  // Subject matches (for emails)
  if (item.subject && item.subject.toLowerCase().includes(queryLower)) {
    score += 8;
  }

  // Description/snippet matches
  if (item.description && item.description.toLowerCase().includes(queryLower)) {
    score += 5;
  }
  if (item.snippet && item.snippet.toLowerCase().includes(queryLower)) {
    score += 5;
  }

  // Notes matches (for tasks)
  if (item.notes && item.notes.toLowerCase().includes(queryLower)) {
    score += 3;
  }

  // Exact matches get bonus
  if (item.title && item.title.toLowerCase() === queryLower) {
    score += 5;
  }

  return score;
}