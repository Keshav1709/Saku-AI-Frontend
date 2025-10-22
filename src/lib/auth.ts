import prisma from '@/lib/db';
import {betterAuth} from 'better-auth';
import {prismaAdapter} from 'better-auth/adapters/prisma';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000',
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000',
  ],
});
