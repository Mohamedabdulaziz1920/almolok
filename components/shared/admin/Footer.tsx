'use client'

import { ChevronUp, ShoppingCart, Home, User, SearchIcon } from 'lucide-react'
import Link from 'next/link'
import useCartStore from '@/hooks/use-cart-store'
import { Button } from '@/components/ui/button'
import useSettingStore from '@/hooks/use-setting-store'
import { useTranslations } from 'next-intl'


export default function Footer() {
  const pathname = usePathname()
  const { cart } = useCartStore()

  const t = useTranslations()

  return (
    <footer className='bg-black text-white underline-link'>
      <div className='w-full'>
          <div className='mt-8 flex justify-center text-sm text-gray-400'>
            <Link href='https://mohammed-almalgami.com/'>
              {t('Footer.Designed and developed by')} |{' '}
              {t('Footer.Mohammed Almalgami')}
            </Link>
          </div>
        </div>
    
      {/* Mobile Bottom Navigation */}
      <nav className='md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex justify-around py-2 shadow-lg z-50'>
        <Link
          href='/'
          className='flex flex-col items-center text-gray-300 hover:text-yellow-400 transition-colors'
        >
          <Home className='w-5 h-5 text-yellow-400' />
          <span className='text-xs mt-1'>{t('Footer.Home')}</span>
        </Link>

        <Link
          href='/account'
          className='flex flex-col items-center text-gray-300 hover:text-yellow-400 transition-colors'
        >
          <User className='w-5 h-5 text-yellow-400' />
          <span className='text-xs mt-1'>{t('Footer.Account')}</span>
        </Link>

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className='flex flex-col items-center justify-center gap-1 text-sm text-muted-foreground'
        >
          <SearchIcon className='w-5 h-5 text-yellow-400' />
          <span>{t('Footer.Search')}</span>
        </button>

        <Link
          href='/cart'
          className='relative flex flex-col items-center text-gray-300 hover:text-yellow-400 transition-colors'
        >
          <ShoppingCart className='w-5 h-5 text-yellow-400' />
          {cart.items.length > 0 && (
            <span className='absolute -top-1 right-0 bg-red-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full'>
              {cart.items.length}
            </span>
          )}
          <span className='text-xs mt-1'>{t('Footer.Cart')}</span>
        </Link>
      </nav>
    </footer>
  )
}
