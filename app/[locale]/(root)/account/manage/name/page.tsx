import { SessionProvider } from 'next-auth/react'
import { getTranslations } from 'next-intl/server'

import { auth } from '@/auth'
import { ProfileForm } from './profile-form'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { getSetting } from '@/lib/actions/setting.actions'

export async function generateMetadata() {
  const t = await getTranslations('AccountPage')
  return {
    title: t('ChangeName'),
  }
}

export default async function ProfilePage() {
  const t = await getTranslations('AccountPage')
  const session = await auth()
  const { site } = await getSetting()

  return (
    <div className='mb-24'>
      <SessionProvider session={session}>
        <div className='flex gap-2'>
          <Link href='/account'>{t('BreadcrumbAccount')}</Link>
          <span>›</span>
          <Link href='/account/manage'>{t('BreadcrumbLoginSecurity')}</Link>
          <span>›</span>
          <span>{t('ChangeName')}</span>
        </div>
        <h1 className='h1-bold py-4'>{t('ChangeName')}</h1>
        <Card className='max-w-2xl'>
          <CardContent className='p-4 flex justify-between flex-wrap'>
            <p className='text-sm py-2'>
              {t('NameChangeDescription', { siteName: site.name })}
            </p>
            <ProfileForm />
          </CardContent>
        </Card>
      </SessionProvider>
    </div>
  )
}
