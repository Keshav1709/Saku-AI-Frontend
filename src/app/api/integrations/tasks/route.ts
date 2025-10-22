import {auth, authOptions} from '@/lib/auth';
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

    // First, get the task lists
    const taskListsResponse =
        await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

    if (!taskListsResponse.ok) {
      throw new Error(`Tasks API error: ${taskListsResponse.status}`);
    }

    const taskListsData = await taskListsResponse.json();
    const taskLists = taskListsData.items || [];

    // Get tasks from the first task list (usually the default one)
    let allTasks: any[] = [];

    if (taskLists.length > 0) {
      const defaultListId = taskLists[0].id;

      const tasksResponse = await fetch(
          `https://tasks.googleapis.com/tasks/v1/lists/${
              defaultListId}/tasks?showCompleted=false&maxResults=50`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });

      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        allTasks = tasksData.items || [];
      }
    }

    const tasks = allTasks.map((task: any) => ({
                                 id: task.id,
                                 title: task.title,
                                 notes: task.notes || '',
                                 due: task.due,
                                 status: task.status,
                                 completed: task.completed,
                                 position: task.position,
                                 updated: task.updated,
                                 selfLink: task.selfLink
                               }));

    return NextResponse.json(
        {success: true, tasks: tasks, totalCount: tasks.length});

  } catch (error) {
    console.error('Tasks API Error:', error);
    return NextResponse.json(
        {
          error: 'Failed to fetch tasks',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        {status: 500});
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {title, notes, due} = body;

    if (!title) {
      return NextResponse.json({error: 'Title is required'}, {status: 400});
    }

    // First, get the task lists to find the default one
    const taskListsResponse =
        await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

    if (!taskListsResponse.ok) {
      throw new Error(`Tasks API error: ${taskListsResponse.status}`);
    }

    const taskListsData = await taskListsResponse.json();
    const taskLists = taskListsData.items || [];

    if (taskLists.length === 0) {
      return NextResponse.json({error: 'No task lists found'}, {status: 400});
    }

    const defaultListId = taskLists[0].id;

    // Create the new task
    const newTask = {title: title, notes: notes || '', due: due || null};

    const createResponse = await fetch(
        `https://tasks.googleapis.com/tasks/v1/lists/${defaultListId}/tasks`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newTask)
        });

    if (!createResponse.ok) {
      throw new Error(`Failed to create task: ${createResponse.status}`);
    }

    const createdTask = await createResponse.json();

    return NextResponse.json({
      success: true,
      task: {
        id: createdTask.id,
        title: createdTask.title,
        notes: createdTask.notes || '',
        due: createdTask.due,
        status: createdTask.status,
        completed: createdTask.completed,
        position: createdTask.position,
        updated: createdTask.updated,
        selfLink: createdTask.selfLink
      }
    });

  } catch (error) {
    console.error('Create Task Error:', error);
    return NextResponse.json(
        {
          error: 'Failed to create task',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        {status: 500});
  }
}

export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const {taskId, status} = body;

    if (!taskId || !status) {
      return NextResponse.json(
          {error: 'Task ID and status are required'}, {status: 400});
    }

    // Get the task lists to find the default one
    const taskListsResponse =
        await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

    if (!taskListsResponse.ok) {
      throw new Error(`Tasks API error: ${taskListsResponse.status}`);
    }

    const taskListsData = await taskListsResponse.json();
    const taskLists = taskListsData.items || [];

    if (taskLists.length === 0) {
      return NextResponse.json({error: 'No task lists found'}, {status: 400});
    }

    const defaultListId = taskLists[0].id;

    // Update the task status
    const updateData = {
      status: status,
      completed: status === 'completed' ? new Date().toISOString() : null
    };

    const updateResponse = await fetch(
        `https://tasks.googleapis.com/tasks/v1/lists/${defaultListId}/tasks/${
            taskId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData)
        });

    if (!updateResponse.ok) {
      throw new Error(`Failed to update task: ${updateResponse.status}`);
    }

    const updatedTask = await updateResponse.json();

    return NextResponse.json({
      success: true,
      task: {
        id: updatedTask.id,
        title: updatedTask.title,
        notes: updatedTask.notes || '',
        due: updatedTask.due,
        status: updatedTask.status,
        completed: updatedTask.completed,
        position: updatedTask.position,
        updated: updatedTask.updated,
        selfLink: updatedTask.selfLink
      }
    });

  } catch (error) {
    console.error('Update Task Error:', error);
    return NextResponse.json(
        {
          error: 'Failed to update task',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        {status: 500});
  }
}
