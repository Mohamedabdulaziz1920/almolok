import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user?: {
      _id: string
      name: string
      email: string
      image?: string
      role: string
      balance?: number
    }
  }
}
