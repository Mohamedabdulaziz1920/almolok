import React from 'react'
import AdminSidebar from '@/components/shared/admin/AdminSidebar'
import AdminHeader from '@/components/shared/admin/AdminHeader' // 👈 الهيدر الجديد

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='flex min-h-screen'>
      {/* Sidebar */}
      <AdminSidebar />

      {/* Content */}
      <div className='flex flex-col flex-1'>
        {/* Header */}
        <AdminHeader /> {/* 👈 الهيدر الجديد */}

        {/* Main Page Content */}
        <main className='flex-1 p-4'>{children}</main>
      </div>
    </div>
  )
}
