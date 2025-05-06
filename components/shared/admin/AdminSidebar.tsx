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

import LanguageSwitcher from '../header/language-switcher'
import ThemeSwitcher from '../header/theme-switcher'
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

  const SidebarLinksContent = () => (
    <nav className='space-y-2'>
      {sidebarLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-md transition-all hover:bg-gray-100',
            pathname.includes(link.href)
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-muted-foreground'
          )}
        >
          {link.icon}
          <span>{t(`links.${link.key}`)}</span>
        </Link>
      ))}
    </nav>
  )

  const UserInfo = () =>
    user ? (
      <div className='flex items-center gap-3 px-2 py-3 border rounded-lg'>
        <div className='bg-primary text-white rounded-full h-9 w-9 flex items-center justify-center font-semibold uppercase'>
          <Image src='/icons/logo.svg' width={40} height={40} alt='Logo' />
        </div>
        <div className='text-sm'>
          <p className='font-medium'>مرحـباً {user.name}</p>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className='text-xs text-red-500 hover:underline flex items-center gap-1'
          >
            <LogOut size={14} /> {t('Logout')}
          </button>
        </div>
      </div>
    ) : null

  return (
    <>
      {/* 🌐 Sidebar for Desktop */}
      <aside className='h-full w-64 flex-col bg-gray-800 shadow-md p-4 overflow-y-auto hidden md:flex'>
        <UserInfo />
        <SidebarLinksContent />
        <div className='mt-6 space-y-4 px-2'>
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </aside>

      {/* 📱 Sidebar for Mobile */}
      <div className='md:hidden px-4 py-2'>
        <Sheet>
          <SheetTrigger className='flex items-center gap-2 text-primary'>
            <MenuIcon className='h-6 w-6' />
          </SheetTrigger>
          <SheetContent side='right' className='p-4'>
            <SheetHeader className='mb-4'>
              <div className='flex items-center justify-between'>
                <SheetTitle>{t('Dashboard')}</SheetTitle>
                <X className='h-5 w-5 cursor-pointer' />
              </div>
            </SheetHeader>

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
