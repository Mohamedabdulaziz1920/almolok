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

// خطوط Google
const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700'],
  variable: '--font-cairo',
})

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-roboto',
})

// تعريف الميتا
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

// Layout الأساسي
export default async function RootLayout({
  params,
  children,
}: {
  params: { locale: Locale }
  children: React.ReactNode
}) {
  const { locale } = params
  const setting = await getSetting()
  const cookieStore = await cookies()
  const currencyCookie = cookieStore.get('currency')
  const currency = currencyCookie ? currencyCookie.value : 'USD'
  const session = await auth()

  if (!routing.locales.includes(locale)) {
    notFound()
  }

  const messages = await getMessages({ locale })
  const direction = getDirection(locale)
  const fontVariable = locale === 'ar' ? cairo.variable : roboto.variable
  const fontClass = locale === 'ar' ? 'font-sans-ar' : 'font-sans-en'

  return (
    <html
      lang={locale}
      dir={direction}
      className='dark'
      style={{ colorScheme: 'dark' }}
    >
      <body className={`${fontVariable} ${fontClass}`} dir={direction}>
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
