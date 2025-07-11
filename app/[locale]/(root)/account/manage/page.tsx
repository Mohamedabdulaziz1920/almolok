import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { deleteCurrentUser } from '@/lib/actions/user.actions'
import { auth } from '@/auth'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

const PAGE_TITLE = 'Login & Security'
export const metadata: Metadata = {
  title: PAGE_TITLE,
}

export default async function ProfilePage() {
  const t = await getTranslations('AccountPage')
  const session = await auth()
  const user = session?.user

  if (!user) {
    return <div>لا يوجد مستخدم مسجل الدخول</div>
  }

  return (
    <div className='max-w-5xl mx-auto space-y-4'>
      <div className='flex gap-2'>
        <Link href='/account'>{t('BreadcrumbAccount')}</Link>
        <span>›</span>
        <span>{t('LoginSecurity')}</span>
      </div>

      <h1 className='h1-bold py-4'>{t('LoginSecurity')}</h1>

      <Card className='max-w-2xl'>
        <CardContent className='p-4 flex justify-between flex-wrap'>
          <div>
            <h3 className='font-bold'>{t('Name')}</h3>
            <p>{user.name}</p>
          </div>
          <Link href='/account/manage/name'>
            <Button className='rounded-full w-32' variant='outline'>
              {t('Edit')}
            </Button>
          </Link>
        </CardContent>

        <Separator />

        <CardContent className='p-4 flex justify-between flex-wrap'>
          <div>
            <h3 className='font-bold'>{t('Email')}</h3>
            <p>{user.email}</p>
            <p>{t('ComingSoon')}</p>
          </div>
          <Button disabled className='rounded-full w-32' variant='outline'>
            {t('Edit')}
          </Button>
        </CardContent>

        <Separator />

        <CardContent className='p-4 flex justify-between flex-wrap'>
          <div>
            <h3 className='font-bold'>{t('Password')}</h3>
            <p>{t('HiddenPassword')}</p>
            <p>{t('ComingSoon')}</p>
          </div>
          <Button disabled className='rounded-full w-32' variant='outline'>
            {t('Edit')}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* زر حذف الحساب */}
      <Card className='max-w-2xl bg-red-50'>
        <CardContent className='p-4 flex justify-between flex-wrap items-center'>
          <div className='space-y-1'>
            <h3 className='font-bold text-red-600'>حذف الحساب</h3>
            <p className='text-sm text-red-700 max-w-md'>
              عند الضغط على هذا الزر، سيتم حذف حسابك وجميع بياناتك بشكل نهائي، ولن تتمكن من استعادته.
            </p>
          </div>
          <form action={deleteCurrentUser}>
            <Button
              type='submit'
              variant='destructive'
              className='rounded-full mt-2 w-full sm:w-auto'
            >
              حذف الحساب نهائيًا
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
