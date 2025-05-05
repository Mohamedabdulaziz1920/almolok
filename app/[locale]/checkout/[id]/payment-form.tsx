'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { IOrder, IOrderItem } from '@/lib/db/models/order.model' // تأكد من استيراد النوع المناسب هنا
import { createOrderFromCart } from '@/lib/actions/order.actions'
import { Button } from '@/components/ui/button'
import ProductPrice from '@/components/shared/product/product-price'
import { Card, CardContent } from '@/components/ui/card'

type Props = {
  order: IOrder // تأكد من أن order هو من نوع IOrder وليس IOrderItem[]
  userBalance: number
}

export default function OrderDetailsForm({ order, userBalance }: Props) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // تفكيك العناصر المطلوبة من الكائن `order`
  const { _id, items, itemsPrice, taxPrice, totalPrice, isPaid, user } = order // استخدام `user` بدلاً من `userId`

  // تصحيح نوع `_id` إذا لزم الأمر
  const orderId: string = _id.toString()

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
      // تمرير المعاملات المعدلة مع userId (استخدم `user._id` بدلاً من `userId`)
      await createOrderFromCart({
        items,
        itemsPrice,
        taxPrice,
        totalPrice,
        isPaid,
        userId: user._id, // تأكد من تمرير `userId` بدلاً من `userId` مباشرة
        balance: userBalance,
      })
      toast({ description: 'تم الدفع بنجاح!' })
      router.push(`/account/orders/${orderId}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // إذا كان الطلب مدفوعًا بالفعل، قم بإعادة التوجيه مباشرة
  if (isPaid) {
    router.push(`/account/orders/${orderId}`)
  }

  return (
    <main className='max-w-4xl mx-auto mt-8 space-y-6'>
      <Card>
        <CardContent className='p-6 space-y-4'>
          <h2 className='text-xl font-semibold'>ملخص الطلب</h2>

          <ul className='space-y-1'>
            {items.map(
              (
                item: IOrderItem // إضافة النوع هنا
              ) => (
                <li key={item.product}>
                  {item.name} × {item.quantity} ={' '}
                  <ProductPrice price={item.price * item.quantity} plain />
                </li>
              )
            )}
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
