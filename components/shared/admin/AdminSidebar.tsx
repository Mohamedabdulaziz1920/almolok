'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
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
import { useEffect, useState } from 'react'

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
  const [collapsed, setCollapsed] = useState(false)

  // Listen to toggle from header
  useEffect(() => {
    const toggleHandler = () => setCollapsed((prev) => !prev)
    window.addEventListener('toggleSidebar', toggleHandler)
    return () => window.removeEventListener('toggleSidebar', toggleHandler)
  }, [])

  const SidebarLinksContent = () => (
    <nav className='space-y-2'>
      {sidebarLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'flex items-center px-3 py-2 rounded-md transition-all hover:bg-gray-100 dark:hover:bg-gray-800',
            pathname.includes(link.href)
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-muted-foreground'
          )}
        >
          <div className='w-6'>{link.icon}</div>
          {!collapsed && <span className='ml-2'>{t(`links.${link.key}`)}</span>}
        </Link>
      ))}
    </nav>
  )

  const SidebarHeader = () => (
    <div className='flex items-center gap-2 mb-6 px-2'>
      <Link href='/'>
        <Image src='/icons/logo.svg' width={32} height={32} alt='Logo' />
      </Link>
      {!collapsed && (
        <h1 className='text-xl font-bold text-primary'>{t('Dashboard')}</h1>
      )}
    </div>
  )

  const UserInfo = () =>
    user ? (
      <div className='flex items-center gap-2 px-2 py-3 border dark:border-gray-700 rounded-lg'>
        <Image src='/icons/logo.svg' width={32} height={32} alt='User' />
        {!collapsed && (
          <div className='text-sm'>
            <p className='font-medium'>مرحباً {user.name}</p>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className='text-xs text-red-500 hover:underline flex items-center gap-1'
            >
              <LogOut size={14} /> {t('Logout')}
            </button>
          </div>
        )}
      </div>
    ) : null

  return (
    <>
      {/* Sidebar Desktop */}
      <aside
        id='admin-sidebar'
        className={cn(
          'hidden lg:flex flex-col shadow-md p-4 overflow-y-auto bg-white dark:bg-gray-900 transition-all duration-300',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        <SidebarHeader />
        <UserInfo />
        <SidebarLinksContent />
        <div className='mt-6 space-y-4 px-2'>
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </aside>

      {/* Sidebar Mobile */}
      <div className='lg:hidden px-4 py-2'>
        <Sheet>
          <SheetTrigger className='flex items-center gap-2 text-primary'>
            <MenuIcon className='h-6 w-6' />
          </SheetTrigger>
          <SheetContent
            side='right'
            className='p-4 w-64 max-w-full bg-white dark:bg-gray-900 flex flex-col'
          >
            <SheetHeader className='mb-4'>
              <div className='flex items-center justify-between'>
                <SheetTitle>{t('Dashboard')}</SheetTitle>
                <X className='h-5 w-5 cursor-pointer' />
              </div>
            </SheetHeader>
            <SidebarHeader />
            <UserInfo />
            <SidebarLinksContent />
            <div className='mt-6 space-y-4'>
              <LanguageSwitcher />
              <ThemeSwitcher />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
