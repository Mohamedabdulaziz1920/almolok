import { type DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    role: string
    balance: number
    image?: string
  }

  interface Session {
    user: {
      id: string
      role: string
      balance: number
    } & DefaultSession['user']
  }
}
