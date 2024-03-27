import NextAuth, { NextAuthConfig, Session, User } from 'next-auth'
import Github from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import { ExtendedJWT } from './next-auth'
import { dbClient } from '@js-monorepo/db'
import { logger } from '@js-monorepo/logger'

export const authProviders = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Github({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
} satisfies NextAuthConfig

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authProviders,
  trustHost: true,
  pages: {
    error: '/',
    signIn: '/auth/login',
  },
  events: {
    async signIn({ user }) {
      logger.info(`User: ${user.name} has been signed in`)
    },
  },
  callbacks: {
    async signIn({ user }) {
      try {
        const userEmail = user.email as string

        await dbClient.authUser
          .findFirstOrThrow({
            where: { email: userEmail },
          })
          .catch(async () => {
            // create new user
            // TODO check if there is already an existing user with the same username
            const newUser = await dbClient.authUser.create({
              data: {
                email: userEmail,
                username: user.name
                  ? user.name
                  : `guest-${Math.floor(Math.random() * 1000)}`,
              },
            })
            logger.info(`New User: '${newUser.username}' created successfully`)
          })
      } catch (err) {
        logger.error(err, `There was an error with user: ${user.email}`)
        return false
      }
      return true
    },
    async jwt({ token, user }: { token: ExtendedJWT; user: User }) {
      if (!user?.email) return token

      const authUser = await dbClient.authUser.findFirstOrThrow({
        where: { email: user.email },
      })

      if (authUser.roles) {
        token.roles = authUser.roles
      }
      if (authUser.createdAt) {
        token.createdAt = authUser.createdAt
      }

      return token
    },
    async session({
      session,
      token,
    }: {
      session: Session
      token?: ExtendedJWT
    }) {
      if (!session.user) return session

      if (token.roles) {
        session.user.roles = token.roles
      }

      if (token.createdAt) {
        session.user.createdAt = token.createdAt
      }

      return session
    },
  },
  session: { strategy: 'jwt' },
})
