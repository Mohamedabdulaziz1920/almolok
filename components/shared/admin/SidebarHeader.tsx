'use client'

import Image from 'next/image'

export default function SidebarHeader() {
  return (
    <div className='flex items-center gap-2 mb-4'>
      <Image src='/icons/logo.svg' alt='Logo' width={32} height={32} />
      <span className='text-lg font-bold text-gray-800 dark:text-gray-100'>لوحة التحكم</span>
    </div>
  )
}
