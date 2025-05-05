'use client'

import { createContext, useContext, useState, useEffect } from 'react'

type CurrencyContextType = {
  currency: string
  setCurrency: (currency: string) => void
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
)

interface CurrencyProviderProps {
  children: React.ReactNode
  currency: string
}

export const CurrencyProvider = ({
  children,
  currency: defaultCurrency,
}: CurrencyProviderProps) => {
  const [currency, setCurrency] = useState(defaultCurrency)

  // في حال تغيّر الإعدادات من الـ props لاحقًا
  useEffect(() => {
    setCurrency(defaultCurrency)
  }, [defaultCurrency])

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrency = () => {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
