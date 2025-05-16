'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { IOrder, IOrderItem } from '@/lib/db/models/order.model'
import { createOrderFromCart } from '@/lib/actions/order.actions'
import { Button } from '@/components/ui/button'
import ProductPrice from '@/components/shared/product/product-price'
import { Card, CardContent } from '@/components/ui/card'

type Props = {
  order: IOrder
  userBalance: number
}

export default function OrderDetailsForm({ order, userBalance }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { _id, items, itemsPrice, taxPrice, totalPrice, isPaid, user } = order
  const orderId = _id.toString()

  // إعادة التوجيه إذا كان الطلب مدفوع
  useEffect(() => {
    if (isPaid) {
      router.replace(`/account/orders/${orderId}`)
    }
  }, [isPaid, orderId, router])

  const handlePayment = async () => {
    if (userBalance < totalPrice) {
      toast({
        description: 'رصيدك غير كافٍ لإتمام هذا الطلب',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      await createOrderFromCart({
        items,
        itemsPrice,
        taxPrice,
        totalPrice,
        isPaid,
        userId: user._id,
        balance: userBalance,
      })

      toast({ description: 'تم الدفع بنجاح!' })

      // إعادة التوجيه بعد نجاح الدفع
      router.replace(`/account/orders/${orderId}`)
    } catch (error) {
      toast({
        description: 'حدث خطأ أثناء معالجة الدفع',
        variant: 'destructive',
      })
      console.error('Payment error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className='max-w-4xl mx-auto mt-8 space-y-6'>
      <Card>
        <CardContent className='p-6 space-y-4'>
          <h2 className='text-xl font-semibold'>ملخص الطلب</h2>

          <ul className='space-y-1'>
            {items.map((item: IOrderItem) => (
              <li key={item.product}>
                {item.name} × {item.quantity} ={' '}
                <ProductPrice price={item.price * item.quantity} plain />
              </li>
            ))}
          </ul>

          <div className='flex justify-between pt-4 border-t'>
            <span>سعر المنتجات:</span>
            <ProductPrice price={itemsPrice} plain />
          </div>

          <div className='flex justify-between'>
            <span>الضريبة:</span>
            <ProductPrice price={taxPrice} plain />
          </div>

          <div className='flex justify-between font-bold text-lg'>
            <span>الإجمالي:</span>
            <ProductPrice price={totalPrice} plain />
          </div>

          <div className='pt-4'>
            <p>
              رصيدك الحالي: <b>{userBalance} ريال</b>
            </p>
          </div>

          <Button
            className='w-full mt-4 bg-yellow-400 text-black hover:bg-yellow-500'
            onClick={handlePayment}
            disabled={isSubmitting || userBalance < totalPrice}
          >
            {isSubmitting ? 'جاري المعالجة...' : 'تأكيد الطلب والدفع من الرصيد'}
          </Button>
        </CardContent>
      </Card>
    </main>
  )
    }
