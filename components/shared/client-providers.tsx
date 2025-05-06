'use client'

import { ThemeProvider } from 'next-themes'
import { CurrencyProvider } from '@/context/currency-context'
import { ClientSetting } from '@/types'
import useCartSidebar from '@/hooks/use-cart-sidebar'
import CartSidebar from './cart-sidebar'
import { Toaster } from '../ui/toaster'
import AppInitializer from './app-initializer'

interface ClientProvidersProps {
  children: React.ReactNode
  setting: ClientSetting
}

export default function ClientProviders({
  children,
  setting,
}: ClientProvidersProps) {
  const visible = useCartSidebar()

  return (
    <CurrencyProvider currency={setting.currency}>
      <AppInitializer setting={setting}>
        <ThemeProvider
          attribute='class'
          defaultTheme={setting.common.defaultTheme.toLocaleLowerCase()}
        >
          {visible ? (
            <div className='flex min-h-screen'>
              <div className='flex-1 overflow-hidden'>{children}</div>
              <CartSidebar />
            </div>
          ) : (
            <div>{children}</div>
          )}
          <Toaster />
        </ThemeProvider>
      </AppInitializer>
    </CurrencyProvider>
  )
}
