'use client'

import { Home, ShoppingCart, User, Search } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import useCartStore from '@/hooks/use-cart-store'
// ⬅️ أزلنا ChevronUp و Button و usePathname لأنها غير مستخدمة

export default function Footer() {
  const { cart } = useCartStore()
  const t = useTranslations('Footer') // يفترض أن مفاتيحك تحت "Footer"

  return (
    <footer className="underline-link bg-black text-white">
      {/* حقوق التصميم */}
      <div className="mt-8 flex justify-center text-sm text-gray-400">
        <Link
          href="https://mohammed-almalgami.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('designedBy')} | Mohammed Almalgami
        </Link>
      </div>

      {/* تنقّل الموبايل السفلي */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-gray-800 bg-gray-900 py-2 shadow-lg md:hidden">
        <Link
          href="/"
          className="flex flex-col items-center text-gray-300 transition-colors hover:text-yellow-400"
        >
          <Home className="h-5 w-5 text-yellow-400" />
          <span className="mt-1 text-xs">{t('home')}</span>
        </Link>

        <Link
          href="/account"
          className="flex flex-col items-center text-gray-300 transition-colors hover:text-yellow-400"
        >
          <User className="h-5 w-5 text-yellow-400" />
          <span className="mt-1 text-xs">{t('account')}</span>
        </Link>

        <button
          aria-label="Scroll to top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex flex-col items-center text-gray-300 transition-colors hover:text-yellow-400"
        >
          <Search className="h-5 w-5 text-yellow-400" />
          <span className="mt-1 text-xs">{t('search')}</span>
        </button>

        <Link
          href="/cart"
          className="relative flex flex-col items-center text-gray-300 transition-colors hover:text-yellow-400"
        >
          <ShoppingCart className="h-5 w-5 text-yellow-400" />
          {cart.items.length > 0 && (
            <span className="absolute -top-1 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
              {cart.items.length}
            </span>
          )}
          <span className="mt-1 text-xs">{t('cart')}</span>
        </Link>
      </nav>
    </footer>
  )
}
