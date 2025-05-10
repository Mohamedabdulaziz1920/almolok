'use client'

import { LogOut, Menu } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import LanguageSwitcher from '@/components/shared/header/language-switcher'
import ThemeSwitcher from '@/components/shared/header/theme-switcher'
import { useLocale } from 'next-intl'

export default function AdminHeader() {
  const t = useTranslations('AdminNav')
  const user = useCurrentUser()
  const locale = useLocale()
  const isRTL = locale === 'ar'

  const toggleSidebar = () => {
    const sidebar = document.getElementById('admin-sidebar')
    if (sidebar) {
      sidebar.classList.toggle('sidebar-collapsed')
      sidebar.classList.toggle('sidebar-expanded')
    }
  }

  return (
    <header className='w-full border-b bg-white dark:bg-gray-900 dark:border-gray-800 px-4 py-3 flex items-center justify-between shadow-sm'>
      {/* Menu button - always visible */}
      <button onClick={toggleSidebar} className='text-muted-foreground'>
        <Menu className='w-6 h-6' />
      </button>

      {/* Right section in LTR / Left in RTL */}
      <div
        className={`flex items-center gap-4 ${isRTL ? 'ml-auto' : 'mr-auto'}`}
      >
        <LanguageSwitcher />
        <ThemeSwitcher />

        {user && (
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2'>
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
            </div>
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
