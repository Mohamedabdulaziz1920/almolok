import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface User {
    _id: string
    role: string
    balance: number
    image?: string
  }

  interface Session {
    user: {
      _id: string
      role: string
      balance: number
    } & DefaultSession['user']
  }
}
