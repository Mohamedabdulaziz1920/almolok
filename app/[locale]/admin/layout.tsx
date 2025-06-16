'use client'

import AdminSidebar from '@/components/shared/admin/AdminSidebar'
import AdminHeader from '@/components/shared/admin/AdminHeader'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1">
          <AdminHeader />
          <main className="p-4 lg:p-6">{children}</main>
        </div>
      </div>
  )
}
