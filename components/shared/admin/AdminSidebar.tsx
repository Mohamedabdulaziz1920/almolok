'use client'

import Link from 'next/link'
import Image from 'next/image'
import { signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { LogOut } from 'lucide-react'

import LanguageSwitcher from '@/components/shared/header/language-switcher'
import ThemeSwitcher from '@/components/shared/header/theme-switcher'
import { useCurrentUser } from '@/hooks/useCurrentUser'

export default function AdminSidebar() {
  const t = useTranslations('AdminNav')
  const user = useCurrentUser()

  return (
    <aside className='h-full w-64 shadow-md p-4 overflow-y-auto hidden md:flex flex-col bg-white dark:bg-gray-900'>
      {/* Logo and Dashboard Title */}
      <div className='flex items-center gap-4 mb-6 px-2'>
        <Link href='/'>
          <Image src='/icons/logo.svg' width={40} height={40} alt='Logo icon' />
        </Link>
        <h1 className='text-xl font-bold text-primary hidden md:inline'>
          {t('Dashboard')}
        </h1>
      </div>

      {/* User Info */}
      {user && (
        <div className='flex items-center gap-3 px-2 py-3 border rounded-lg'>
          <div className='rounded-full h-9 w-9 overflow-hidden bg-primary flex items-center justify-center'>
            <Image src='/icons/logo.svg' width={36} height={36} alt='User avatar' />
          </div>
          <div className='text-sm'>
            <p className='font-medium truncate'>{user.name}</p>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className='text-xs text-red-500 hover:underline flex items-center gap-1'
            >
              <LogOut size={14} />
              {t('Logout')}
            </button>
          </div>
        </div>
      )}

      {/* Language and Theme Switchers */}
      <div className='mt-6 space-y-4 px-2'>
        <LanguageSwitcher />
        <ThemeSwitcher />
      </div>
    </aside>
  )
}
