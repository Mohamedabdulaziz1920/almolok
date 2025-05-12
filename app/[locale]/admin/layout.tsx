
import React from 'react'
import AdminSidebar from '@/components/shared/admin/AdminSidebar'
import { Toaster } from '@/components/ui/toaster'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='flex min-h-screen'>
      {/* Sidebar */}
      <AdminSidebar />
      <main className='flex-1 p-4'>
        <Toaster />
        {children}
      </main>
    </div>
  )
}
