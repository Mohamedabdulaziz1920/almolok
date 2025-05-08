import { auth } from '@/auth'
import createMiddleware from 'next-intl/middleware'
import { NextResponse } from 'next/server'
import { routing } from './i18n/routing'

const publicPages = [
  '/',
  '/search',
  '/sign-in',
  '/sign-up',
  '/cart',
  '/cart/(.*)',
  '/product/(.*)',
  '/page/(.*)',
]

const intlMiddleware = createMiddleware(routing)

export default async function middleware(req) {
  const isPublicPage = publicPages.some((page) =>
    new RegExp(`^(/(${routing.locales.join('|')}))?${page}`).test(req.nextUrl.pathname)
  )

  if (isPublicPage) {
    return intlMiddleware(req)
  }

  // ليس ضرورياً هنا التحقق من الجلسة لأن `authorized()` في auth.config.ts يتكفل بذلك
  return intlMiddleware(req)
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
