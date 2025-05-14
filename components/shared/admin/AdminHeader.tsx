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
  const t = useTranslations('AdminHeader')
  const user = useCurrentUser()
  const pathname = usePathname()
  const { toggle } = useSidebar()
  const isDashboard = pathname.startsWith('/admin')
  const locale = useLocale()
  const isRTL = locale === 'ar'

  if (!isDashboard) return null

  return (
    <header
      className={cn(
        'fixed top-0 z-40 flex h-16 w-full items-center gap-4 border-b bg-background px-4',
        'right-0',
        'lg:right-64', // Default sidebar width
        isRTL ? 'lg:left-0 lg:right-auto' : 'lg:left-64 lg:right-auto',
        'pt-5'
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden text-gray-600 hover:text-primary"
        onClick={toggle}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">{t('toggleMenu')}</span>
      </Button>

      <div className="flex flex-1 justify-end items-center gap-2 md:gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-600 hover:text-primary"
        >
          <Bell className="h-5 w-5" />
          <span className="sr-only">{t('toggleNotifications')}</span>
        </Button>

        <ThemeSwitcher />
        <LanguageSwitcher />

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              {user?.image ? (
                <Image
                  src={user.image}
                  width={32}
                  height={32}
                  alt={user.name || 'User profile'}
                  className="rounded-full"
                  priority
                />
              ) : (
                <User className="h-5 w-5" />
              )}
              <span className="sr-only">{t('toggleUserMenu')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
              <div className="text-sm font-medium truncate max-w-[200px]">
                {user?.name}
              </div>
              <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                {user?.email}
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild>
              <Link href="/account" className="w-full p-2">
                {t('Your account')}
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem className="p-0">
              <form action={SignOut} className="w-full">
                <button
                  type="submit"
                  className="w-full text-left p-2 text-sm"
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
