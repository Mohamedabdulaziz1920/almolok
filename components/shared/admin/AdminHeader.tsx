'use client'

import { Bell, User, Menu } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSidebar } from '@/context/sidebar-context'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import ThemeSwitcher from '@/components/shared/header/theme-switcher'
import LanguageSwitcher from '@/components/shared/header/language-switcher'
import Image from 'next/image'
import { SignOut } from '@/lib/actions/user.actions'

export default function AdminHeader() {
  const t        = useTranslations('AdminHeader')
  const user     = useCurrentUser()
  const pathname = usePathname()
  const { toggle } = useSidebar()
  const locale   = useLocale()
  const isRTL    = locale === 'ar'

  if (!pathname.startsWith('/admin')) return null

  return (
    <header
      className={cn(
        'fixed top-0 flex h-16 w-full items-center border-b bg-gray-950 px-4 shadow-sm md:px-6',
        isRTL ? 'right-0' : 'left-0',
        'z-50' // أقل من الزر (z‑60) لكنه أعلى من معظم العناصر
      )}
      style={{ direction: isRTL ? 'rtl' : 'ltr' }}
    >
      {/* زر القائمة الجانبية للموبايل */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggle}
        className="lg:hidden text-white hover:bg-gray-900 hover:text-yellow-400 transition"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">{t('toggleMenu')}</span>
      </Button>

      {/* الشعار (يظهر على الديسكتوب) */}
      <div className="hidden items-center gap-3 lg:flex">
        <Link href="/">
          <Image
            src="/icons/logo.svg"
            width={32}
            height={32}
            alt="Logo"
            priority
          />
        </Link>
        <h1 className="truncate text-lg font-bold text-yellow-400">
          {t('Dashboard')}
        </h1>
      </div>

      {/* عناصر الهيدر اليمنى */}
      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-gray-900 hover:text-yellow-400 transition"
        >
          <Bell className="h-5 w-5" />
          <span className="sr-only">{t('toggleNotifications')}</span>
        </Button>

        <ThemeSwitcher />
        <LanguageSwitcher />

        {/* قائمة المستخدم */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-white hover:bg-gray-900 transition"
            >
              {user?.image ? (
                <Image
                  src={user.image}
                  width={32}
                  height={32}
                  alt={user.name || 'User profile'}
                  className="rounded-full object-cover"
                  priority
                />
              ) : (
                <User className="h-5 w-5" />
              )}
              <span className="sr-only">{t('toggleUserMenu')}</span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align={isRTL ? 'start' : 'end'}
            className="w-56 bg-gray-950 text-white"
          >
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
              <span className="w-full truncate text-sm font-medium">
                {user?.name}
              </span>
              <span className="w-full truncate text-xs">{user?.email}</span>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/account" className="w-full p-2 hover:bg-gray-800">
                {t('Your account')}
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem className="p-0 hover:bg-gray-800">
              <form action={SignOut} className="w-full">
                <button
                  type="submit"
                  className="w-full p-2 text-left text-sm hover:text-yellow-400"
                >
                  {t('logout')}
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
