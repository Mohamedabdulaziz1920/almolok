'use client'

import { useEffect, useState } from 'react'
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

  const {
    _id,
    items,
    itemsPrice,
    taxPrice,
    totalPrice,
    paymentMethod,
    user,
    isPaid,
  } = order

  const orderId: string = _id.toString()
  const clientId = user._id.toString()

  useEffect(() => {
    if (isPaid) {
      router.push(`/account/orders/${orderId}`)
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
      await createOrderFromCart(
        {
          items: items.map((item) => ({
            image: item.image,
            product: item.product.toString(),
            name: item.name,
            slug: item.slug,
            category: item.category,
            playerId: item.playerId,
            quantity: item.quantity,
            countInStock: item.countInStock,
            price: item.price,
            // 🚫 لا تضع clientId هنا
          })),
          itemsPrice,
          taxPrice,
          totalPrice,
          paymentMethod,
          balance: userBalance,
          clientId: clientId, // ✅ فقط هنا
        },
        clientId // ✅ إذا كان مطلوبًا كوسيط ثانٍ في الدالة
      )

      toast({ description: 'تم الدفع بنجاح!' })
      router.push(`/account/orders/${orderId}`)
    } catch (error) {
      console.error('Payment Error:', error)
      toast({
        description: 'حدث خطأ أثناء الدفع. حاول مرة أخرى.',
        variant: 'destructive',
      })
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
              <li key={item.product.toString()}>
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
              رصيدك الحالي: <b>{userBalance}</b>
            </p>
          </div>

          <Button
            className='w-full mt-4'
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
