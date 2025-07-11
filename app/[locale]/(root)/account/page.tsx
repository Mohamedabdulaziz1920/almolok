import PageReloader from '@/components/shared/PageReloader'
import BrowsingHistoryList from '@/components/shared/browsing-history-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Home,
  PackageCheckIcon,
  User,
  Wallet,
  CreditCard,
  History,
  Shield,
} from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { auth } from '@/auth'
import { getUserById } from '@/lib/actions/user.actions' // المسار حسب تنظيم مشروعك
const PAGE_TITLE = 'حسابك'

export const metadata: Metadata = {
  title: PAGE_TITLE,
}

export default async function AccountPage() {
  const t = await getTranslations('AccountPage')
  const session = await auth()
  const userId = session?.user.id

  if (!userId) {
    return <div>لا يوجد مستخدم مسجل الدخول</div>
  }

  const user = await getUserById(userId)

  if (!user) {
    return <div>المستخدم غير موجود</div>
  }

  return (
      <>
     <PageReloader />
    <div className='container mx-auto px-1 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
          {PAGE_TITLE}
        </h1>
        <div className='grid md:grid-cols-3 gap-4 items-stretch'>
          {/* بطاقة المحفظة */}
          <Card className='border-sidebar-border'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-lg flex items-center gap-2'>
                <Wallet className='w-5 h-5 text-wallet' />
                {t('Wallet')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div>
                  <p className='text-sidebar-text-light text-sm'>
                    {t('CurrentBalance')}
                  </p>
                  <p className='text-2xl font-bold text-sidebar-text'>
                    {(user as { balance?: number })?.balance ?? 0} $
                  </p>
                </div>

                <Link
                  href='/account/wallet/add-balance'
                  className='inline-flex items-center gap-2 px-4 py-2 bg-wallet text-wallet-text rounded hover:bg-wallet/90 transition-colors'
                >
                  <CreditCard className='w-4 h-4' />
                  {t('AddBalance')}
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* بطاقة الطلبات */}
          <Card>
            <Link href='/account/orders'>
              <CardContent className='flex items-start gap-4 p-6'>
                <div>
                  <PackageCheckIcon className='w-12 h-12 text-primary' />
                </div>
                <div>
                  <h2 className='text-xl font-bold text-sidebar-text'>
                    {t('Orders')}
                  </h2>
                  <p className='text-sidebar-text-light'>
                    {t('OrdersDescription')}
                  </p>
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* بطاقة البيانات الشخصية */}
          <Card>
            <Link href='/account/manage'>
              <CardContent className='flex items-start gap-4 p-6'>
                <div>
                  <User className='w-12 h-12 text-primary' />
                </div>
                <div>
                  <h2 className='text-xl font-bold text-sidebar-text'>
                    {t('LoginSecurity')}
                  </h2>
                  <p className='text-sidebar-text-light'>
                    {t('LoginSecurityDescription')}
                  </p>
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* بطاقة العناوين */}
          <Card>
            <Link href='/account/addresses'>
              <CardContent className='flex items-start gap-4 p-6'>
                <div>
                  <Home className='w-12 h-12 text-primary' />
                </div>
                <div>
                  <h2 className='text-xl font-bold text-sidebar-text'>
                    {t('Addresses')}
                  </h2>
                  <p className='text-sidebar-text-light'>
                    {t('AddressesDescription')}
                  </p>
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* بطاقة المعاملات */}
          <Card>
            <Link href='/account/wallet/history'>
              <CardContent className='flex items-start gap-4 p-6'>
                <div>
                  <History className='w-12 h-12 text-primary' />
                </div>
                <div>
                  <h2 className='text-xl font-bold text-sidebar-text'>
                    {t('Transactions')}
                  </h2>
                  <p className='text-sidebar-text-light'>
                    {t('TransactionsDescription')}
                  </p>
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* بطاقة الحماية */}
          <Card>
            <Link href='/account/security'>
              <CardContent className='flex items-start gap-4 p-6'>
                <div>
                  <Shield className='w-12 h-12 text-primary' />
                </div>
                <div>
                  <h2 className='text-xl font-bold text-sidebar-text'>
                    {t('Security')}
                  </h2>
                  <p className='text-sidebar-text-light'>
                    {t('SecurityDescription')}
                  </p>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        <BrowsingHistoryList className='mt-16' />
      </div>
    </div>
    </>
  )
}
