import { Metadata } from 'next'

import OverviewReport from './overview-report'

import { auth } from '@/auth'
import { useEffect } from 'react';
export const metadata: Metadata = {
  title: 'Admin Dashboard',
}
const DashboardPage = async () => {
  const session = await auth()
  if (session?.user.role !== 'Admin')
    throw new Error('Admin permission required')

  return <OverviewReport />
}
const DashboardPage: React.FC = () => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const alreadyRefreshed = sessionStorage.getItem('dashboardRefreshed');
      if (!alreadyRefreshed) {
        sessionStorage.setItem('dashboardRefreshed', 'true');
        window.location.reload();
      }
    }
  }, []);
export default DashboardPage
