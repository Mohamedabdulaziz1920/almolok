import { MongoDBAdapter } from '@auth/mongodb-adapter'
import Google from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import CredentialsProvider from 'next-auth/providers/credentials'
import { connectToDatabase } from './lib/db'
import client from './lib/db/client'
import User from './lib/db/models/user.model'

import NextAuth from 'next-auth'
import authConfig from './auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  pages: {
    signIn: '/sign-in',
    newUser: '/sign-up',
    error: '/sign-in',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  adapter: MongoDBAdapter(client),
  providers: [
    Google({
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      credentials: {
        email: {
          type: 'email',
        },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        await connectToDatabase()
        if (credentials == null) return null

        const user = await User.findOne({ email: credentials.email })

        if (user && user.password) {
          const isMatch = await bcrypt.compare(
            credentials.password as string,
            user.password
          )
          if (isMatch) {
            return {
              id: user._id.toString(), // بدل _id بـ id ليستخدمه jwt callback
              name: user.name,
              email: user.email,
              role: user.role,
              balance: user.balance,
              image: user.image,
            }
          }
        }
        return null
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, trigger, session }) => {
      if (user) {
        const userName = user.name ?? user.email?.split('@')[0] ?? 'User'

        if (!user.name) {
          await connectToDatabase()
          await User.findByIdAndUpdate(user.id, {
            name: userName,
            role: 'user',
          })
        }

        token.name = userName
        token.role = (user as { role: string }).role
        token.balance = (user as { balance: number }).balance
      }

      if (session?.user?.name && trigger === 'update') {
        token.name = session.user.name
      }

      return token
    },

    session: async ({ session, user, trigger, token }) => {
      session.user.id = token.sub ?? '' // تأكد من وجود قيمة
      session.user.role = token.role as string
      session.user.name = token.name ?? ''
      session.user.balance = token.balance as number

      if (trigger === 'update' && user?.name) {
        session.user.name = user.name
      }

      return session
    },
  },
})
