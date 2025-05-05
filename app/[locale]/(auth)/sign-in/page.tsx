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
  title: 'Sign In',
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
    <div className='w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12'>
      <div className='max-w-md w-full space-y-6'>
        <Card className='shadow-xl rounded-2xl border border-gray-200'>
          <CardHeader className='text-center'>
            <CardTitle className='text-3xl font-semibold text-gray-800 flex items-center justify-center gap-2'>
              {t('title')}
              <LogIn className='w-6 h-6 text-blue-500 transform rotate-180' />
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <CredentialsSignInForm />
            <SeparatorWithOr />
            <div className='mt-4'>
              <GoogleSignInForm />
            </div>
          </CardContent>
        </Card>

        <div className='text-center space-y-4'>
          <SeparatorWithOr>
            {t('newToSite', { siteName: site.name })}
          </SeparatorWithOr>
          <Link
            href={`/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          >
            <Button
              className='w-full flex items-center justify-center gap-2'
              variant='outline'
            >
              <UserPlus className='w-5 h-5 text-green-600' />
              {t('createAccount', { siteName: site.name })}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
