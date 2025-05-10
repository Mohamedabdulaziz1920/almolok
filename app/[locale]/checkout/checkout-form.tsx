'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import ProductPrice from '@/components/shared/product/product-price'
import CheckoutFooter from './checkout-footer'

import useCartStore from '@/hooks/use-cart-store'
import useSettingStore from '@/hooks/use-setting-store'
import useIsMounted from '@/hooks/use-is-mounted'
import { useToast } from '@/hooks/use-toast'
import { createOrder } from '@/lib/actions/order.actions'
import { useTranslations } from 'next-intl'
import { Checkbox } from '@/components/ui/checkbox'
import { useSession } from 'next-auth/react'  // استيراد useSession

const CheckoutForm = () => {
  const t = useTranslations('Checkout')

  const { toast } = useToast()
  const router = useRouter()
  const isMounted = useIsMounted()

  const {
    setting: { site },
  } = useSettingStore()

  const {
    cart: { items, itemsPrice, taxPrice = 0, totalPrice },
    clearCart,
  } = useCartStore()

  const [useBalance, setUseBalance] = useState(false)

  // جلب الرصيد من الجلسة بدلاً من المتجر
  const { data: session } = useSession()
  const availableBalance = session?.user?.balance ?? 0  // هنا نستخدم balance من الجلسة

  useEffect(() => {
    if (!isMounted) return
  }, [isMounted])

  const handlePlaceOrder = async () => {
    // التحقق من الرصيد إذا كان سيتم استخدامه
    if (useBalance && availableBalance < totalPrice) {
      toast({
        description: t('insufficientBalance'),
        variant: 'destructive',
      })
      return
    }

    const res = await createOrder({
      items,
      paymentMethod: useBalance ? 'Balance' : 'Card',
      itemsPrice,
      taxPrice,
      totalPrice, // السعر الكامل دائمًا
    })

    if (!res.success) {
      toast({
        description: res.message,
        variant: 'destructive',
      })
    } else {
      toast({
        description: res.message,
      })
      clearCart()
      router.push(`/checkout/${res.data?.orderId}`)
    }
  }

  const CheckoutSummary = () => (
    <Card>
      <CardContent className='p-4 space-y-4'>
        <div>
          <div className='text-lg font-bold'>{t('orderSummary')}</div>
          <div className='space-y-2'>
            <div className='flex justify-between'>
              <span>{t('items')}</span>
              <ProductPrice price={itemsPrice} plain />
            </div>
            <div className='flex justify-between'>
              <span>{t('tax')}</span>
              <ProductPrice price={taxPrice} plain />
            </div>
            <div className='flex justify-between pt-4 font-bold text-lg'>
              <span>{t('orderTotal')}</span>
              <ProductPrice price={totalPrice} plain />
            </div>
          </div>
        </div>

        <Button onClick={handlePlaceOrder} className='rounded-full w-full'>
          {t('placeYourOrder')}
        </Button>

        <p className='text-xs text-center'>
          {t.rich('privacyAgreement', {
            siteName: site.name,
            privacyLink: (chunks) => (
              <Link href='/page/privacy-policy'>{chunks}</Link>
            ),
            conditionsLink: (chunks) => (
              <Link href='/page/conditions-of-use'>{chunks}</Link>
            ),
          })}
        </p>
      </CardContent>
    </Card>
  )

  return (
    <main className='max-w-6xl mx-auto p-4 space-y-6'>
      <section>
        <div className='text-primary text-lg font-bold'>{t('orderItems')}</div>
        <ul className='mt-2 list-disc list-inside'>
          {items.map((item, index) => (
            <li key={index}>
              {item.name} (Player ID: {item.playerId}) × {item.quantity} ={' '}
              {item.price}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <div className='flex items-center space-x-2'>
          <Checkbox
            id='use-balance'
            checked={useBalance}
            onCheckedChange={(checked) => setUseBalance(checked === true)} // تأكد من أن checked هو true أو false
          />
          <label htmlFor='use-balance' className='text-sm cursor-pointer'>
            استخدم رصيدي للدفع
          </label>
        </div>
      </section>

      <section>
        <CheckoutSummary />
      </section>

      <CheckoutFooter />
    </main>
  )
}

export default CheckoutForm
