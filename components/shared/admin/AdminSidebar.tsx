'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { useTranslations, useLocale } from 'next-intl'
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  Settings,
  FileText,
  Boxes,
  X,
  Menu as MenuIcon,
  LogOut,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

import LanguageSwitcher from '@/components/shared/header/language-switcher'
import ThemeSwitcher from '@/components/shared/header/theme-switcher'
import { useCurrentUser } from '@/hooks/useCurrentUser'

const sidebarLinks = [
  { key: 'overview', href: '/admin/overview', icon: <Home size={18} /> },
  { key: 'products', href: '/admin/products', icon: <Package size={18} /> },
  { key: 'categories', href: '/admin/categories', icon: <Boxes size={18} /> },
  { key: 'orders', href: '/admin/orders', icon: <ShoppingCart size={18} /> },
  { key: 'users', href: '/admin/users', icon: <Users size={18} /> },
  { key: 'pages', href: '/admin/web-pages', icon: <FileText size={18} /> },
  { key: 'settings', href: '/admin/settings', icon: <Settings size={18} /> },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const t = useTranslations('AdminNav')
  const user = useCurrentUser()
  const locale = useLocale()
  const isRTL = locale === 'ar'

  const SidebarLinksContent = () => (
    <nav className='space-y-2'>
      {sidebarLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-md transition-all hover:bg-transparent hover:text-yellow-400',
            pathname.includes(link.href)
              ? 'text-yellow-400 font-semibold'
              : 'text-white'
          )}
        >
          <span className='text-yellow-400'>{link.icon}</span>
          <span>{t(`links.${link.key}`)}</span>
        </Link>
      ))}
    </nav>
  )

  const UserInfo = () =>
    user ? (
      <div className='flex flex-col gap-3 px-4 py-3 border border-gray-700 rounded-lg'>
        <div className='flex items-center gap-3'>
          <div className='bg-yellow-400 text-white rounded-full h-9 w-9 flex items-center justify-center font-semibold uppercase'>
            <Image src='/icons/logo.svg' width={24} height={24} alt='Logo' />
          </div>
          <div className='text-sm'>
            <p className='font-medium text-white'>مرحباً {user.name}</p>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className='text-xs text-red-500 hover:underline flex items-center gap-1'
            >
              <LogOut size={14} /> {t('Logout')}
            </button>
          </div>
        </div>
        <div className='space-y-2'>
          <LanguageSwitcher className='text-white' />
          <ThemeSwitcher className='text-white' />
        </div>
      </div>
    ) : null

  return (
    <>
      {/* Sidebar Desktop */}
      <aside
        className={cn(
          'w-64 lg:flex flex-col shadow-md p-4 overflow-y-auto hidden bg-gray-900 text-white',
          isRTL ? 'right-0' : 'left-0'
        )}
        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
      >
        <div className='flex items-center gap-4 mb-6 px-4'>
          <Link href='/'>
            <Image src='/icons/logo.svg' width={32} height={32} alt='Logo' />
          </Link>
          <h1 className='text-xl font-bold text-yellow-400 hidden md:inline'>
            {t('Dashboard')}
          </h1>
        </div>
        <UserInfo />
        <SidebarLinksContent />
      </aside>

      {/* Sidebar Mobile */}
      <div className='lg:hidden px-4 py-2'>
        <Sheet>
          <SheetTrigger className='flex items-center gap-2 text-yellow-400'>
            <MenuIcon className='h-6 w-6' />
          </SheetTrigger>
          <SheetContent
            side={isRTL ? 'right' : 'left'}
            className='p-4 w-64 max-w-full bg-gray-900 text-white flex flex-col'
            style={{ direction: isRTL ? 'rtl' : 'ltr' }}
          >
            <SheetHeader className='mb-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <Image src='/icons/logo.svg' width={28} height={28} alt='Logo' />
                  <SheetTitle className='text-lg text-yellow-400'>{t('Dashboard')}</SheetTitle>
                </div>
                <X className='h-5 w-5 cursor-pointer' />
              </div>
            </SheetHeader>
            <UserInfo />
            <SidebarLinksContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
