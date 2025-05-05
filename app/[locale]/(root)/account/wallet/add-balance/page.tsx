'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
export default function RechargePage() {
  const [amount, setAmount] = useState(0)
  const [reason, setReason] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleRecharge = async () => {
    if (amount <= 0 || !paymentMethod) {
      alert('يرجى إدخال مبلغ صالح واختيار وسيلة الدفع')
      return
    }

    setIsProcessing(true)

    try {
      // إرسال طلب شحن الرصيد إلى السيرفر مع تفاصيل المبلغ والسبب ووسيلة الدفع
      const res = await fetch('/api/recharge', {
        method: 'POST',
        body: JSON.stringify({ amount, reason, paymentMethod }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await res.json()

      if (data.success) {
        alert('تم تقديم طلب شحن الرصيد بنجاح!')
        // توجيه المستخدم للانتقال إلى صفحة الشراء أو تأكيد الطلب
        window.location.href = '/checkout'
      } else {
        alert('فشل في تقديم الطلب، حاول مرة أخرى')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('حدث خطأ أثناء تقديم الطلب')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className='p-4'>
      <h1 className='text-2xl font-bold mb-4'>شحن رصيدك</h1>

      {/* إدخال المبلغ */}
      <div className='mb-4'>
        <label className='block mb-2'>أدخل المبلغ الذي تريد شحنه:</label>
        <input
          type='number'
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className='border p-2 w-full'
        />
      </div>

      {/* إدخال السبب */}
      <div className='mb-4'>
        <label className='block mb-2'>السبب (ملاحظة):</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className='border p-2 w-full'
        />
      </div>

      {/* اختيار وسيلة الدفع */}
      <div className='mb-4'>
        <label className='block mb-2'>اختر وسيلة الدفع:</label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className='border p-2 w-full'
        >
          <option value=''>اختر وسيلة الدفع</option>
          <option value='paypal'>PayPal</option>
          <option value='credit_card'>بطاقة ائتمان</option>
          {/* يمكنك إضافة المزيد من وسائل الدفع هنا */}
        </select>
      </div>
      <div>
        <Button
          onClick={handleRecharge}
          disabled={isProcessing}
          className='bg-yellow-500 text-white px-4 py-2 rounded'
        >
          {isProcessing ? 'جاري تقديم الطلب...' : 'تقديم طلب شحن الرصيد'}
        </Button>
      </div>
    </div>
  )
}
