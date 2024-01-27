import NextAuth, { NextAuthConfig, Session, User } from 'next-auth'
import Github from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import { ExtendedJWT } from './next-auth'

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
  pages: {
    error: '/',
    signIn: '/auth/login',
  },
  callbacks: {
    async signIn({ account, user, email, profile }) {
      // throw new Error('ERROR_USER_NOT_REGISTERED')
      return true
    },
    async jwt({ token }) {
      token.roles = ['user']
      return token
    },
    async session({
      session,
      token,
    }: {
      session: Session
      token?: ExtendedJWT
    }) {
      if (token.roles && session.user) {
        session.user.roles = token.roles
      }
      return session
    },
  },
  session: { strategy: 'jwt' },
})
