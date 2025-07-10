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
  if (session) {
    return redirect(callbackUrl)
  }

  return (
<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 via-yellow-50 to-white px-2 py-2 sm:py-4 md:py-6">
  <div className="w-full max-w-md space-y-4">
    <Card className="shadow-xl rounded-2xl border border-yellow-400">
      <CardHeader className="text-center px-4 pt-3 sm:pt-4 md:pt-6">
        <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-600 flex items-center justify-center gap-2">
          {t('title')}
          <LogIn className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          مرحبًا بك في <strong>{site.name}</strong> 👑
        </p>
      </CardHeader>
      <CardContent className="space-y-4 px-4 pb-4 sm:pb-5">
        <CredentialsSignInForm />
        <SeparatorWithOr />
        <GoogleSignInForm />
      </CardContent>
    </Card>

    <div className="text-center space-y-3 px-4">
      <SeparatorWithOr>{t('newToSite', { siteName: site.name })}</SeparatorWithOr>
      <Link href={`/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`}>
        <Button
          className="w-full flex items-center justify-center gap-2 bg-black text-white hover:bg-yellow-600 transition-colors rounded-xl"
          variant="default"
        >
          <UserPlus className="w-5 h-5 text-yellow-400" />
          {t('createAccount', { siteName: site.name })}
        </Button>
      </Link>
    </div>
  </div>
</div>

  )
}
