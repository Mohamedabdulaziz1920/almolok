import { Metadata } from 'next'
import { SessionProvider } from 'next-auth/react'
import { getTranslations } from 'next-intl/server'
import { auth } from '@/auth'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { deleteUser } from '@/lib/actions/user.actions' // تم استيراد دالة الحذف
import { redirect } from 'next/navigation'

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
      <SessionProvider session={session}>
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
            <div>
              <Link href='/account/manage/name'>
                <Button className='rounded-full w-32' variant='outline'>
                  {t('Edit')}
                </Button>
              </Link>
            </div>
          </CardContent>

          <Separator />

          <CardContent className='p-4 flex justify-between flex-wrap'>
            <div>
              <h3 className='font-bold'>{t('Email')}</h3>
              <p>{user.email}</p>
              <p>{t('ComingSoon')}</p>
            </div>
            <div>
              <Button disabled className='rounded-full w-32' variant='outline'>
                {t('Edit')}
              </Button>
            </div>
          </CardContent>

          <Separator />

          <CardContent className='p-4 flex justify-between flex-wrap'>
            <div>
              <h3 className='font-bold'>{t('Password')}</h3>
              <p>{t('HiddenPassword')}</p>
              <p>{t('ComingSoon')}</p>
            </div>
            <div>
              <Button disabled className='rounded-full w-32' variant='outline'>
                {t('Edit')}
              </Button>
            </div>
          </CardContent>

          <Separator />

          {/* زر حذف الحساب */}
          <CardContent className='p-4 flex justify-between flex-wrap bg-red-50'>
            <div>
              <h3 className='font-bold text-red-600'>حذف الحساب</h3>
              <p className='text-sm text-red-700'>
                عند الضغط على هذا الزر، سيتم حذف حسابك وجميع بياناتك نهائيًا.
              </p>
            </div>

            <form
              action={async () => {
                'use server'
                if (!user?.id) return
                await deleteUser(user.id)
                redirect('/')
              }}
            >
              <Button type='submit' variant='destructive' className='rounded-full mt-2'>
                حذف الحساب نهائيًا
              </Button>
            </form>
          </CardContent>
        </Card>
      </SessionProvider>
    </div>
  )
}
