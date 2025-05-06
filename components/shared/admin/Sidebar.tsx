'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import clsx from 'clsx'
import { HiOutlineMenu, HiX } from 'react-icons/hi'

import LanguageSwitcher from '@/components/shared/header/language-switcher'
import ThemeSwitcher from '@/components/shared/header/theme-switcher'
import UserButton from '@/components/shared/header/user-button'

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ListOrdered,
  Settings,
  Tag,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const navLinks = [
  { href: '/admin/dashboard', label: 'dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'products', icon: Tag },
  { href: '/admin/packages', label: 'packages', icon: Package },
  { href: '/admin/orders', label: 'orders', icon: ShoppingCart },
  { href: '/admin/categories', label: 'categories', icon: ListOrdered },
  { href: '/admin/settings', label: 'settings', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const t = useTranslations('Sidebar')
  const locale = useLocale()
  const isRTL = locale === 'ar'

  const [open, setOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <>
      {/* Toggle Button (mobile) */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden p-3 fixed top-4 z-50"
        style={isRTL ? { right: 10 } : { left: 10 }}
      >
        {open ? <HiX size={26} /> : <HiOutlineMenu size={26} />}
      </button>

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 h-full bg-white shadow-lg z-40 transition-all duration-300 flex flex-col justify-between',
          isRTL ? 'right-0' : 'left-0',
          open ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full',
          'md:translate-x-0 md:relative',
          isCollapsed ? 'w-20' : 'w-64'
        )}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Top: Navigation */}
        <div>
          <div className="p-6 text-xl font-bold border-b whitespace-nowrap overflow-hidden text-ellipsis">
            {!isCollapsed && t('title')}
          </div>
          <nav className="flex flex-col gap-1 p-4">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex items-center gap-3 px-4 py-2 rounded-md hover:bg-gray-100 transition',
                  pathname === href ? 'bg-gray-200 font-semibold' : ''
                )}
              >
                <Icon className="w-5 h-5" />
                {!isCollapsed && <span>{t(label)}</span>}
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom: Collapse Button & Menu Items */}
        <div className="flex flex-col gap-3 px-4 py-4 border-t">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex items-center gap-2 text-sm px-3 py-2 rounded hover:bg-gray-100 transition"
          >
            {isCollapsed
              ? isRTL
                ? <ChevronRight className="w-4 h-4" />
                : <ChevronLeft className="w-4 h-4" />
              : isRTL
                ? <ChevronLeft className="w-4 h-4" />
                : <ChevronRight className="w-4 h-4" />}
            {!isCollapsed && t('collapse')}
          </button>

          <LanguageSwitcher />
          <ThemeSwitcher />
          <UserButton />
        </div>
      </aside>
    </>
  )
}
