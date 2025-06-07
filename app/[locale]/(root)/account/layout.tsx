import React from 'react'
import { auth } from '@/auth'
import Image from 'next/image'
import {
  Home,
  CreditCard,
  PackageCheckIcon,
  History,
  User,
  Shield,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const links = [
  { href: '/account', label: 'الرئيسية', icon: Home },
  {
    href: '/account/wallet/add-balance',
    label: 'إضافة رصيد',
    icon: CreditCard,
  },
  { href: '/account/orders', label: 'طلباتي', icon: PackageCheckIcon },
  { href: '/account/wallet/history', label: 'معاملاتي', icon: History },
  { href: '/account/manage', label: 'بياناتي', icon: User },
  { href: '/account/security', label: 'الحماية', icon: Shield },
]

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const user = session?.user

  return (
    <div className='flex flex-col md:flex-row min-h-screen'>
      {/* سايدبار على الشاشات الكبيرة */}
      <aside className='hidden md:flex sticky top-0 h-screen w-64 flex-shrink-0 bg-gray-900 border-l border-gray-900 flex-col p-4 overflow-y-auto z-30'>
        {/* صورة المستخدم */}
        <div className='flex items-center gap-3 pb-6 border-b border-gray-900 mb-4'>
          <div className='relative w-10 h-10 rounded-full overflow-hidden'>
            <Image
              src={user?.image || '/images/default-avatar.png'}
              alt={user?.name || 'User'}
              fill
              className='object-cover'
            />
          </div>
          <div>
            <p className='text-sm text-gray-400'>مرحباً</p>
            <p className='text-white font-semibold'>{user?.name}</p>
          </div>
        </div>

        {/* الروابط */}
        <nav className='space-y-1'>
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-4 py-2 rounded-md transition-colors hover:bg-gray-800 text-gray-300 hover:text-yellow-400',
                href ===
                  `/account${typeof window !== 'undefined' && location.pathname !== '/account' && location.pathname.startsWith(href) ? '' : ''}`
              )}
            >
              <Icon className='w-5 h-5 text-yellow-400' />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      
      {/* المحتوى الرئيسي */}
      <main className='flex-1 w-full p-4'>
        <div className='max-w-5xl mx-auto space-y-6 pb-8'>{children}</div>
      </main>
    </div>
  )
}
