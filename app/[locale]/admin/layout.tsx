import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import Menu from '@/components/shared/header/menu'
import { getSetting } from '@/lib/actions/setting.actions'
import AdminSidebar from '@/components/shared/admin/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { site } = await getSetting()

  return (
    <div>
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className='flex-1 flex flex-col'>
        {/* Header */}
        <header className='h-16 border-b shadow-sm flex items-center justify-between px-4'>
          <div className='flex items-center gap-4'>
            <Link href='/'>
              <Image
                src='/icons/logo.svg'
                width={40}
                height={40}
                alt={`${site.name} logo`}
              />
            </Link>
            <span className='font-semibold text-lg hidden md:inline text-muted-foreground'>
              لوحة التحكم
            </span>
          </div>
          <div className='flex items-center space-x-4'>
            <Menu forAdmin />
          </div>
        </header>

        {/* Main Page Content */}
        <main className='p-4'>{children}</main>
      </div>
    </div>
  )
}
