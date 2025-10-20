import {authOptions} from '@/lib/auth';
import {getServerSession} from 'next-auth';
import {NextRequest, NextResponse} from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

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

    // Fetch Google Drive files
    const driveResponse = await fetch(
        'https://www.googleapis.com/drive/v3/files?pageSize=10&fields=files(id,name,mimeType,createdTime,modifiedTime,size,webViewLink)',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

    if (!driveResponse.ok) {
      throw new Error(`Drive API error: ${driveResponse.status}`);
    }

    const driveData = await driveResponse.json();

    const files =
        driveData.files?.map((file: any) => ({
                               id: file.id,
                               name: file.name,
                               mimeType: file.mimeType,
                               createdTime: file.createdTime,
                               modifiedTime: file.modifiedTime,
                               size: file.size ? parseInt(file.size) : 0,
                               webViewLink: file.webViewLink
                             })) ||
        [];

    return NextResponse.json(
        {success: true, files: files, totalCount: files.length});

  } catch (error) {
    console.error('Drive API Error:', error);
    return NextResponse.json(
        {
          error: 'Failed to fetch Drive files',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        {status: 500});
  }
}
