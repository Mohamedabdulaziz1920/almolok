import React from 'react'
import AdminSidebar from '@/components/shared/admin/AdminSidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='flex min-h-screen'>
      <AdminSidebar />
      <main className='flex-1 p-4'>{children}</main>
    </div>
  )
}
