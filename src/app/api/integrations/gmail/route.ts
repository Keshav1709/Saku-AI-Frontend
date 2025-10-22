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

    // Fetch Gmail messages
    const gmailResponse = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

    if (!gmailResponse.ok) {
      throw new Error(`Gmail API error: ${gmailResponse.status}`);
    }

    const messagesData = await gmailResponse.json();

    // Fetch detailed message information
    const messages = await Promise.all(
        messagesData.messages?.slice(0, 5).map(async (message: any) => {
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
              subject: headers.find((h: any) => h.name === 'Subject')?.value ||
                  'No Subject',
              from: headers.find((h: any) => h.name === 'From')?.value ||
                  'Unknown Sender',
              date: headers.find((h: any) => h.name === 'Date')?.value ||
                  'Unknown Date',
              snippet: messageData.snippet || 'No preview available'
            };
          }
          return null;
        }) ||
        []);

    const validMessages = messages.filter(Boolean);

    return NextResponse.json({
      success: true,
      messages: validMessages,
      totalCount: messagesData.resultSizeEstimate || 0
    });

  } catch (error) {
    console.error('Gmail API Error:', error);
    return NextResponse.json(
        {
          error: 'Failed to fetch Gmail messages',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        {status: 500});
  }
}
