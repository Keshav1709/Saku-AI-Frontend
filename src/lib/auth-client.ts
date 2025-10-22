import {createAuthClient} from 'better-auth/react';

export const authClient = createAuthClient({
  // In development the Next.js dev server typically runs on
  // http://localhost:3000.
  // Using https://localhost:3000 will fail unless you have a local TLS
  // certificate.
  // Consider replacing this with an environment variable like
  // process.env.NEXT_PUBLIC_API_URL for different environments.
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000',
})