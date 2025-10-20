import {authOptions} from '@/lib/auth';
import {PrismaClient} from '@prisma/client';
import {getServerSession} from 'next-auth';
import {NextRequest, NextResponse} from 'next/server';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient|undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

            const {email, name, avatar} = await request.json();

            // Verify the user is updating their own profile
            if (email !== session.user.email) {
              return NextResponse.json({error: 'Forbidden'}, {status: 403});
            }

            // Update user profile in database
            const updatedUser = await prisma.user.update({
              where: {email},
              data: {
                name,
                avatar,
                updatedAt: new Date(),
              },
            });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
        {error: 'Failed to update profile'}, {status: 500});
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

            const user = await prisma.user.findUnique({
              where: {email: session.user.email},
              select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                createdAt: true,
                updatedAt: true,
              },
            });

    if (!user) {
      return NextResponse.json({error: 'User not found'}, {status: 404});
    }

    return NextResponse.json({user});
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({error: 'Failed to fetch profile'}, {status: 500});
  }
}
