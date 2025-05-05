import { Metadata } from 'next'
import OverviewReport from './overview-report'
import { auth } from '@/auth'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('DashboardPage')
  return {
    title: t('metadata.title'),
  }
}

const DashboardPage = async () => {
  const session = await auth()
  const t = await getTranslations('DashboardPage')

  if (session?.user.role !== 'Admin') {
    throw new Error(t('errors.adminPermissionRequired'))
  }

  return <OverviewReport />
}

export default DashboardPage
