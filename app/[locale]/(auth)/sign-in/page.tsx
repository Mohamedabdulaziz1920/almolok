import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import SeparatorWithOr from '@/components/shared/separator-or'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CredentialsSignInForm from './credentials-signin-form'
import { GoogleSignInForm } from './google-signin-form'
import { Button } from '@/components/ui/button'
import { getSetting } from '@/lib/actions/setting.actions'
import { getTranslations } from 'next-intl/server'
import { LogIn, UserPlus } from 'lucide-react'

export const metadata: Metadata = {
  title: 'تسجيل الدخول - الملوك أون لاين',
}

export default async function SignInPage(props: {
  searchParams: Promise<{
    callbackUrl: string
  }>
}) {
  const t = await getTranslations('SignIn')
  const searchParams = await props.searchParams
  const { site } = await getSetting()
  const { callbackUrl = '/' } = searchParams

  const session = await auth()
  if (session) return redirect(callbackUrl)

  return (
   
      <div className="w-full max-w-md">
        <Card className="bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl border border-yellow-300">
          <CardHeader className="text-center pt-8 pb-4 px-6">
            <CardTitle className="text-3xl font-extrabold text-yellow-600 flex items-center justify-center gap-2">
              {t('title')}
              <LogIn className="w-6 h-6 text-yellow-500" />
            </CardTitle>
            <p className="text-sm text-gray-700 mt-2">
              مرحبًا بك في <strong className="text-black">{site.name}</strong> 👑
            </p>
          </CardHeader>
          <CardContent className="space-y-6 px-6 pb-8">
            <CredentialsSignInForm />
            <SeparatorWithOr />
            <GoogleSignInForm />
          </CardContent>
        </Card>

        <div className="text-center mt-6 space-y-3 px-4">
          <SeparatorWithOr>
            <span className="text-sm text-gray-600">
              {t('newToSite', { siteName: site.name })}
            </span>
          </SeparatorWithOr>
          <Link href={`/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`}>
            <Button
              className="w-full py-2 text-base font-medium rounded-2xl bg-black text-white hover:bg-yellow-500 hover:text-black transition-all duration-200 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5 text-yellow-300" />
              {t('createAccount', { siteName: site.name })}
            </Button>
          </Link>
        </div>
      </div>
  
  )
}
