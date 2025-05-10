'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ChevronDownIcon } from 'lucide-react'
import { signOut } from 'next-auth/react'

import { buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { cn } from '@/lib/utils'
import { useCurrentUser } from '@/hooks/useCurrentUser'

export default function UserButton() {
  const t = useTranslations('Header')
  const user = useCurrentUser()

  return (
    <div className='flex gap-2 items-center'>
      <DropdownMenu>
        <DropdownMenuTrigger className='header-button' asChild>
          <div className='flex items-center cursor-pointer'>
            <div className='flex flex-col text-xs text-left'>
              <span>
                {t('Hello')},{' '}
                {user ? user.name : t('sign in')}
              </span>
              <span className='font-bold'>{t('Account & Orders')}</span>
            </div>
            <ChevronDownIcon />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent className='w-56' align='end' forceMount>
          {user ? (
            <>
              <DropdownMenuLabel className='font-normal'>
                <div className='flex flex-col space-y-1'>
                  <p className='text-sm font-medium leading-none'>
                    {user.name}
                  </p>
                  <p className='text-xs leading-none text-muted-foreground'>
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuGroup>
                <Link className='w-full' href='/account'>
                  <DropdownMenuItem>{t('Your account')}</DropdownMenuItem>
                </Link>
                <Link className='w-full' href='/account/orders'>
                  <DropdownMenuItem>{t('Your orders')}</DropdownMenuItem>
                </Link>

                {user.role === 'Admin' && (
                  <Link className='w-full' href='/admin/overview'>
                    <DropdownMenuItem>{t('Admin')}</DropdownMenuItem>
                  </Link>
                )}
              </DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: '/' })}
                className='text-red-500 cursor-pointer'
              >
                {t('Sign out')}
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Link
                    className={cn(buttonVariants({ variant: 'default' }), 'w-full')}
                    href='/sign-in'
                  >
                    {t('Sign in')}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuLabel>
                <div className='font-normal'>
                  {t('New Customer')}?{' '}
                  <Link href='/sign-up' className='text-primary hover:underline'>
                    {t('Sign up')}
                  </Link>
                </div>
              </DropdownMenuLabel>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
