import { Cairo, Roboto } from 'next/font/google'
import '../globals.css'
import ClientProviders from '@/components/shared/client-providers'
import { getDirection } from '@/i18n-config'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { notFound } from 'next/navigation'
import { getSetting } from '@/lib/actions/setting.actions'
import { cookies } from 'next/headers'
import { SessionProvider } from 'next-auth/react'
import { auth } from '@/auth'
import type { Locale } from '@/i18n/routing'
// إعداد خط Cairo للعربية
const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700'],
  variable: '--font-cairo',
})

// إعداد خط Roboto للإنجليزية
const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
})

export async function generateMetadata() {
  const {
    site: { slogan, name, description, url },
  } = await getSetting()
  return {
    title: {
      template: `%s | ${name}`,
      default: `${name}. ${slogan}`,
    },
    description: description,
    metadataBase: new URL(url),
  }
}
export default async function RootLayout({
  params,
  children,
}: {
  params: { locale: Locale }
  children: React.ReactNode
}) {
  const { locale } = params // ✅
  const setting = await getSetting()
  const cookieStore = await cookies()
  const currencyCookie = cookieStore.get('currency')
  const currency = currencyCookie ? currencyCookie.value : 'USD'

  const session = await auth()

  // التحقق من صحة اللغة
  if (!routing.locales.includes(locale)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale} dir={getDirection(locale)} suppressHydrationWarning>
      <body
        className={`${locale === 'ar' ? cairo.variable : roboto.variable} ${
          locale === 'ar' ? 'font-sans-ar' : 'font-sans-en'
        }`}
        dir={getDirection(locale)}
        suppressHydrationWarning
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SessionProvider session={session}>
            <ClientProviders setting={{ ...setting, currency }}>
              {children}
            </ClientProviders>
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
