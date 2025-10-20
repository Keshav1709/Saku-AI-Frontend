import {PrismaAdapter} from '@next-auth/prisma-adapter'
import {PrismaClient} from '@prisma/client'
import {NextAuthOptions} from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient|undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Custom Prisma adapter that maps image to avatar
const customPrismaAdapter = {
  ...PrismaAdapter(prisma),
  async createUser(user) {
    // Map image to avatar for our custom schema
    const userData = {
      ...user,
      avatar: user.image,
    };
    delete userData.image  // Remove the image field

    return await prisma.user.create({
      data: userData,
    })
  },
}

export const authOptions: NextAuthOptions = {
  adapter: customPrismaAdapter,
  providers: [GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  })],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({user, account, profile}) {
      // Allow all sign-ins - let custom adapter handle user creation
      console.log(
          'SignIn callback called:', {email: user.email, name: user.name})
      return true
    },
    async session({session, token}) {
      console.log(
          'Session callback called:', {session: !!session, token: !!token})
      if (session.user && token) {
        session.user.id = token.sub as string
        // Map avatar back to image for the session
        session.user.image = (token as any).avatar || session.user.image
      }
      return session
    },
    async jwt({token, user, account, profile}) {
      console.log('JWT callback called:', {token: !!token, user: !!user})
      if (user) {
        token.id = user.id
        // Map image to avatar for our custom schema
        token.avatar = user.image
      }
      return token
    },
    async redirect({url, baseUrl}) {
      console.log('Redirect callback called:', {url, baseUrl})
      // If redirecting to onboarding, ensure it's the full URL
      if (url.includes('/onboarding')) {
        return `${baseUrl}/onboarding`
      }
      return url.startsWith(baseUrl) ? url : baseUrl
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
    newUser: '/onboarding',
  },
  events: {
    async linkAccount({user, account, profile}) {
      console.log(
          'Account linked:', {user: user.email, provider: account.provider})
    },
    async createUser({user}) {
      console.log('User created:', {email: user.email, name: user.name})
    },
  },
}
