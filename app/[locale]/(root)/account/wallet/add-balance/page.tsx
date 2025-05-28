'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { useToast } from '@/hooks/use-toast'
import { useSession } from 'next-auth/react'

export default function WalletRechargePage() {
  const [amount, setAmount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [showPaypalButtons, setShowPaypalButtons] = useState(false)
  const { data: session } = useSession()
  const { toast } = useToast()

  const handleRecharge = () => {
    if (!session?.user?.id) {
      toast({ description: 'يجب تسجيل الدخول أولاً', variant: 'destructive' })
      return
    }

    if (amount <= 0) {
      toast({ description: 'الرجاء إدخال مبلغ صحيح', variant: 'destructive' })
      return
    }

    if (paymentMethod === 'paypal') {
      setShowPaypalButtons(true)
    }
  }

  const createPayPalOrder = async (): Promise<string> => {
    try {
      const response = await fetch('/api/wallet/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          userId: session?.user?.id,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || result.message || 'فشل في إنشاء طلب الدفع'
        )
      }

      return result.orderID // تم التعديل هنا لاستخدام orderID بدلاً من data.orderID
    } catch (error) {
      console.error('Error creating PayPal order:', error)
      throw error
    }
  }
  const onApprovePayPalOrder = async (data: { orderID: string }) => {
    try {
      const response = await fetch('/api/wallet/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderID: data.orderID,
          amount,
          userId: session?.user?.id,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'فشل في عملية الدفع')
      }

      toast({
        description: `تم الشحن بنجاح! الرصيد الجديد: ${result.newBalance}`,
        variant: 'default',
      })
      window.location.href = '/account/wallet?success=true'
    } catch (error) {
      toast({
        description:
          error instanceof Error ? error.message : 'حدث خطأ في النظام',
        variant: 'destructive',
      })
    }
  }

  if (!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
    return <div className='text-center p-4'>نظام الدفع غير متاح حالياً</div>
  }

  return (
    <div className='max-w-md mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-6 text-right'>شحن الرصيد</h1>

      <div className='space-y-4'>
        <div>
          <label className='block mb-2 font-medium text-right'>المبلغ</label>
          <input
            type='number'
            min='1'
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className='w-full p-2 border rounded text-left'
            placeholder='أدخل المبلغ'
            dir='ltr'
          />
        </div>

        <div>
          <label className='block mb-2 font-medium text-right'>
            طريقة الدفع
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => {
              setPaymentMethod(e.target.value)
              setShowPaypalButtons(false)
            }}
            className='w-full p-2 border rounded text-right'
          >
            <option value=''>اختر طريقة الدفع</option>
            <option value='paypal'>PayPal</option>
          </select>
        </div>

        {!showPaypalButtons && (
          <Button
            onClick={handleRecharge}
            className='w-full bg-primary text-white py-2 rounded'
          >
            المتابعة إلى الدفع
          </Button>
        )}

        {showPaypalButtons && (
          <div className='mt-4'>
            <PayPalScriptProvider
              options={{
                clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
                currency: 'USD',
                intent: 'capture',
              }}
            >
              <PayPalButtons
                createOrder={createPayPalOrder}
                onApprove={onApprovePayPalOrder}
                onError={() =>
                  toast({
                    description: 'حدث خطأ في PayPal',
                    variant: 'destructive',
                  })
                }
              />
            </PayPalScriptProvider>

            <Button
              onClick={() => setShowPaypalButtons(false)}
              className='w-full mt-4 bg-gray-500 text-white py-2 rounded'
              variant='outline'
            >
              إلغاء
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
