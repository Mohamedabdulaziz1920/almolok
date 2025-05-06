'use client'

import { useState } from 'react'

export default function RechargePage() {
  const [amount, setAmount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleRecharge = async () => {
    if (amount <= 0) {
      alert('يرجى إدخال مبلغ صالح')
      return
    }

    setIsProcessing(true)

    try {
      // إرسال طلب شحن الرصيد إلى السيرفر
      const res = await fetch('/api/recharge', {
        method: 'POST',
        body: JSON.stringify({ amount }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await res.json()

      if (data.success) {
        alert('تم شحن الرصيد بنجاح!')
        // توجيه المستخدم للعودة إلى صفحة الشراء
        window.location.href = '/checkout'
      } else {
        alert('فشل في شحن الرصيد، حاول مرة أخرى')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('حدث خطأ أثناء الشحن')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className='p-4'>
      <h1 className='text-2xl font-bold mb-4'>شحن رصيدك</h1>
      <div className='mb-4'>
        <label className='block mb-2'>أدخل المبلغ الذي تريد شحنه:</label>
        <input
          type='number'
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className='border p-2 w-full'
        />
      </div>
      <button
        onClick={handleRecharge}
        disabled={isProcessing}
        className='bg-blue-500 text-white px-4 py-2 rounded'
      >
        {isProcessing ? 'جاري الشحن...' : 'شحن الرصيد'}
      </button>
    </div>
  )
}
