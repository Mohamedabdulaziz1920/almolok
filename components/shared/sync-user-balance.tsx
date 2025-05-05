'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import useCartStore from '@/hooks/use-cart-store'

export default function SyncUserBalance() {
  const { data: session } = useSession()
  const setBalance = useCartStore((state) => state.setBalance)

  useEffect(() => {
    if (session?.user?.balance !== undefined) {
      setBalance(session.user.balance)
    }
  }, [session?.user?.balance, setBalance])

  return null
}
