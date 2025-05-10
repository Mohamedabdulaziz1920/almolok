'use client'

import { useCurrentUser } from '@/hooks/useCurrentUser'
import Image from 'next/image'
import { LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'

export default function SidebarUserInfo() {
  const user = useCurrentUser()
  const t = useTranslations('AdminNav')

  if (!user) return null

  return (
    <div className='mt-auto pt-4 border-t dark:border-gray-700'>
      <div className='flex items-center gap-2 mb-2'>
        <Image
          src='/icons/logo.svg'
          alt='User'
          width={32}
          height={32}
          className='rounded-full'
        />
        <div>
          <p className='text-sm font-medium'>{user.name}</p>
          <p className='text-xs text-muted-foreground'>{user.email}</p>
        </div>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className='flex items-center gap-1 text-xs text-red-500 hover:underline'
      >
        <LogOut size={14} />
        {t('Logout')}
      </button>
    </div>
  )
}
