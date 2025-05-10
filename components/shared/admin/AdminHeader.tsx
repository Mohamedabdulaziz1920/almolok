'use client'

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  Settings,
  FileText,
  Boxes,
  LogOut,
  Menu as MenuIcon,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { cn } from '@/lib/utils'

import Image from 'next/image'
import Link from 'next/link'

import { useState } from 'react'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

const sidebarLinks = [
  { key: 'overview', href: '/admin/overview', icon: <Home size={18} /> },
  { key: 'products', href: '/admin/products', icon: <Package size={18} /> },
  { key: 'categories', href: '/admin/categories', icon: <Boxes size={18} /> },
  { key: 'orders', href: '/admin/orders', icon: <ShoppingCart size={18} /> },
  { key: 'users', href: '/admin/users', icon: <Users size={18} /> },
  { key: 'pages', href: '/admin/web-pages', icon: <FileText size={18} /> },
  { key: 'settings', href: '/admin/settings', icon: <Settings size={18} /> },
]

export default function AdminHeader() {
  const t = useTranslations('AdminNav')
  const locale = useLocale()
  const pathname = usePathname()
  const user = useCurrentUser()
  const isRTL = locale === 'ar'
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className='w-full border-b bg-white dark:bg-gray-900 dark:border-gray-800 px-4 py-3 flex items-center justify-between shadow-sm'>
      {/* Mobile Menu Trigger */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button className='md:hidden text-muted-foreground'>
            <MenuIcon className='w-6 h-6' />
          </button>
        </DialogTrigger>

        <DialogContent className='p-4'>
          <VisuallyHidden>
            <DialogTitle>عنوان مخفي للنافذة</DialogTitle>
          </VisuallyHidden>
          <div className='flex flex-col gap-4'>
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all hover:bg-muted',
                  pathname.includes(link.href)
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground'
                )}
                onClick={() => setIsOpen(false)}
              >
                {link.icon}
                <span>{t(`links.${link.key}`)}</span>
              </Link>
            ))}

            {user && (
              <div className='mt-4 border-t pt-4 flex items-center gap-3'>
                <Image
                  src='/icons/logo.svg'
                  alt='User'
                  width={32}
                  height={32}
                  className='rounded-full'
                />
                <div className='flex flex-col text-sm'>
                  <span className='font-medium'>{user.name}</span>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className='text-xs text-red-500 hover:underline flex items-center gap-1'
                  >
                    <LogOut size={14} /> {t('Logout')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Language + Theme + User Info (Desktop & Mobile) */}
      <div className={`flex items-center gap-4 ${isRTL ? 'ml-auto' : 'mr-auto'}`}>
        <h1 className='text-xl font-bold text-primary hidden md:inline'>
          {t('Dashboard')}
        </h1>
        {user && (
          <div className='hidden md:flex items-center gap-3'>
            <Image
              src='/icons/logo.svg'
              alt='User'
              width={32}
              height={32}
              className='rounded-full'
            />
            <span className='text-sm font-medium text-muted-foreground'>
              {user.name}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className='flex items-center gap-1 text-xs text-red-500 hover:underline'
            >
              <LogOut size={14} />
              {t('Logout')}
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
