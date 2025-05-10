'use client'

import AdminSidebar from '@/components/shared/admin/AdminSidebar'
import AdminHeader from '@/components/shared/admin/AdminHeader'

interface Props {
  children: React.ReactNode
}

export default function AdminLayout({ children }: Props) {
  return (
    <div className='flex min-h-screen bg-gray-50 dark:bg-gray-950'>
      <AdminSidebar />

      <div className='flex flex-col flex-1'>
        <AdminHeader />
        <main className='flex-1 p-4 overflow-y-auto'>{children}</main>
      </div>
    </div>
  )
}
