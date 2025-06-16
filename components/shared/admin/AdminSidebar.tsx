'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
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
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useSidebar } from '@/context/sidebar-context'
import { useCurrentUser } from '@/hooks/useCurrentUser'

const sidebarLinks = [
  { key: 'overview', href: '/admin/overview', icon: <Home size={18} /> },
  { key: 'categories', href: '/admin/categories', icon: <Boxes size={18} /> },
  { key: 'products', href: '/admin/products', icon: <Package size={18} /> },
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
  const { isOpen, toggle } = useSidebar()

  const SidebarLinksContent = () => (
    <nav className='space-y-1 mt-4'>
      {sidebarLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={pathname.includes(link.href) ? 'page' : undefined}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
            'hover:bg-gray-800 hover:text-yellow-400',
            pathname.includes(link.href)
              ? 'bg-gray-950 text-yellow-400 font-medium'
              : 'text-gray-300'
          )}
          onClick={() => {
            if (window.innerWidth < 1024) toggle()
          }}
        >
          <span className='text-yellow-400'>{link.icon}</span>
          <span className='text-sm'>{t(`links.${link.key}`)}</span>
        </Link>
      ))}
    </nav>
  )

  const UserInfo = () =>
    user && (
      <div className='flex flex-col gap-3 p-3 border border-black rounded-lg mb-4 bg-gray-950'>
        <div className='flex items-center gap-3'>
          <div className='bg-yellow-400 text-black rounded-full h-9 w-9 flex items-center justify-center'>
            {user.name?.charAt(0).toUpperCase() || (
              <Image src='/icons/logo.svg' width={20} height={20} alt='User' />
            )}
          </div>
          <div className='flex-1 min-w-0'>
            <p className='font-medium text-white truncate'>
              {t('welcome')} {user.name}
            </p>
          </div>
        </div>
      </div>
    )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        dir={isRTL ? 'rtl' : 'ltr'}
        className={cn(
          'fixed top-0 h-screen z-30 hidden lg:flex flex-col',
          'w-64 p-4 overflow-y-auto bg-gray-950 border-r border-gray-950',
          isRTL ? 'right-0' : 'left-0',
          'pt-5'
        )}
      >
        <div className='flex items-center gap-3 mb-6 px-2'>
          <Link href='/' className='shrink-0'>
            <Image
              src='/icons/logo.svg'
              width={32}
              height={32}
              alt='Logo'
              className='w-8 h-8'
            />
          </Link>
          <h1 className='text-lg font-bold text-yellow-400 truncate'>
            {t('Dashboard')}
          </h1>
        </div>

        <UserInfo />
        <SidebarLinksContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={toggle}>
        <SheetTrigger asChild>
          <button
            className={cn(
              'lg:hidden fixed z-50 p-2 rounded-lg bg-gray-950 text-yellow-400',
              'focus:outline-none focus:ring-2 focus:ring-yellow-400',
              'top-4 right-4'
            )}
            aria-label='Toggle sidebar'
          >
            <MenuIcon className='h-6 w-6' />
          </button>
        </SheetTrigger>

<SheetContent
  dir={isRTL ? 'rtl' : 'ltr'}
  side={isRTL ? 'right' : 'left'}
  className={cn(
    'w-72 max-w-full bg-gray-950/90 backdrop-blur text-yellow flex flex-col p-0',
    'border-l border-gray-950',
    !isOpen && 'pointer-events-none invisible'
  )}
>
  <SheetHeader className='px-4 py-3 border-b border-gray-950'>
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-3'>
        <Image
          src='/icons/logo.svg'
          width={28}
          height={28}
          alt='Logo'
          className='w-7 h-7'
        />
        <SheetTitle className='text-lg text-yellow-400'>
          {t('Dashboard')}
        </SheetTitle>
      </div>
      <SheetTrigger className='p-1 rounded-full hover:bg-gray-400'>
        <X className='h-5 w-5 text-gray-950' />
      </SheetTrigger>
    </div>
  </SheetHeader>

  <div className='p-4 overflow-y-auto flex-1'>
    <UserInfo />
    <SidebarLinksContent />
  </div>
</SheetContent>
      </Sheet>

      {/* Spacer */}
      <div className='hidden lg:block w-64 flex-shrink-0' />
    </>
  )
}
