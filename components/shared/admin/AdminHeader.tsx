'use client'

import { Bell, Search, User, Menu } from 'lucide-react'
import { useTranslations } from 'next-intl'
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

export default function AdminHeader() {
  const t = useTranslations('AdminHeader')
  const user = useCurrentUser()
  const pathname = usePathname()
  const { toggle } = useSidebar()
  const isDashboard = pathname.startsWith('/admin')

  if (!isDashboard) return null

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4',
      'lg:right-64' // يتناسب مع عرض السايدبار
    )}>
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

      {/* Search Bar */}
      <div className="relative flex-1 md:grow-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder={t('searchPlaceholder')}
            className={cn(
              'w-full rounded-lg bg-background pl-8 pr-4 py-2 text-sm',
              'border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary',
              'dark:border-gray-700 dark:bg-gray-800 dark:focus:border-yellow-400'
            )}
          />
        </div>
      </div>

      {/* Right Side Controls */}
      <div className="flex items-center gap-2 md:gap-4">
        <Button variant="ghost" size="icon" className="text-gray-600 hover:text-primary">
          <Bell className="h-5 w-5" />
          <span className="sr-only">{t('toggleNotifications')}</span>
        </Button>

        <ThemeSwitcher className="hidden md:flex" />
        <LanguageSwitcher className="hidden md:flex" />

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              {user?.image ? (
                <Image
                  src={user.image}
                  width={32}
                  height={32}
                  alt="User"
                  className="rounded-full"
                />
              ) : (
                <User className="h-5 w-5" />
              )}
              <span className="sr-only">{t('toggleUserMenu')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
              <div className="text-sm font-medium">{user?.name}</div>
              <div className="text-xs text-muted-foreground">{user?.email}</div>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/settings" className="w-full">
                {t('settings')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <button 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full text-left text-red-500"
              >
                {t('logout')}
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
