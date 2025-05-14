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
        'fixed top-0 z-40 flex h-16 items-center gap-4 border-b px-4',
        'w-full bg-gray-950 border-gray-950',
        isRTL ? 'right-0' : 'left-0' // مساحة للسايدبار حسب الاتجاه
      )}
      style={{ direction: isRTL ? 'rtl' : 'ltr' }}
    >
      {/* زر القائمة الجانبية - يظهر في جميع الحالات */}
      <Button
        variant='ghost'
        size='icon'
        className='lg:hidden text-black hover:text-yellow-400 hover:bg-gray-950'
        onClick={toggle}
      >
        <Menu className='h-5 w-5' />
        <span className='sr-only'>{t('toggleMenu')}</span>
      </Button>

      {/* الشعار والعنوان - يظهران في الشاشات الكبيرة */}
      <div className='hidden lg:flex items-center gap-3'>
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

      {/* عناصر التحكم في الجانب الأيمن */}
      <div className='flex flex-1 justify-end items-center gap-4'>
        {/* زر الإشعارات */}
        <Button
          variant='ghost'
          size='icon'
          className='text-gray-300 hover:text-yellow-400 hover:bg-gray-950'
        >
          <Bell className='h-5 w-5' />
          <span className='sr-only'>{t('toggleNotifications')}</span>
        </Button>

        {/* تبديل السمة */}
        <ThemeSwitcher />

        {/* تبديل اللغة */}
        <LanguageSwitcher />

        {/* قائمة حساب المستخدم */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='rounded-full hover:bg-gray-950'
            >
              {user?.image ? (
                <Image
                  src={user.image}
                  width={32}
                  height={32}
                  alt={user.name || 'User profile'}
                  className='rounded-full'
                  priority
                />
              ) : (
                <User className='h-5 w-5 border-black text-gray-300' />
              )}
              <span className='sr-only'>{t('toggleUserMenu')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align={isRTL ? 'start' : 'end'}
            className='w-56 bg-gray-950 border-gray-950 text-gray-300'
          >
            <DropdownMenuItem className='flex flex-col items-start gap-1 p-3 bg-gray-950 hover:bg-gray-950'>
              <div className='text-sm font-medium truncate max-w-[200px] text-white'>
                {user?.name}
              </div>
              <div className='text-xs text-white truncate max-w-[200px]'>
                {user?.email}
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className='hover:bg-gray-950'>
              <Link href='/account' className='w-full p-2'>
                {t('Your account')}
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem className='p-0 hover:bg-gray-950'>
              <form action={SignOut} className='w-full'>
                <button
                  type='submit'
                  className='w-full text-left p-2 text-sm hover:text-yellow-400'
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
