'use client'

import { useFormState } from 'react-dom'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { addUserBalance } from '@/lib/actions/user.actions'

type FormState = {
  success?: boolean
  error?: string
}

function AddBalanceForm({ userId }: { userId: string }) {
  const router = useRouter()

  const addBalance = async (
    _prevState: FormState,
    formData: FormData
  ): Promise<FormState> => {
    const amount = Number(formData.get('amount'))

    if (!amount || amount <= 0) {
      return { error: 'القيمة يجب أن تكون أكبر من 0' }
    }

    try {
      await addUserBalance(userId, amount)
      return { success: true }
    } catch (error) {
      console.error('Add Balance Error:', error)
      return { error: 'حدث خطأ أثناء إضافة الرصيد' }
    }
  }

  const [state, formAction] = useFormState<FormState, FormData>(addBalance, {
    success: false,
  })

  useEffect(() => {
    if (state?.success) {
      toast.success('تمت إضافة الرصيد بنجاح')
      router.refresh()
    } else if (state?.error) {
      toast.error(state.error)
    }
  }, [state, router])

  return (
    <form action={formAction} className='space-y-4'>
      <div>
        <label htmlFor='amount' className='block mb-1'>
          القيمة
        </label>
        <Input
          id='amount'
          name='amount'
          type='number'
          placeholder='أدخل المبلغ'
          required
        />
      </div>
      <div>
        <label htmlFor='reason' className='block mb-1'>
          السبب (للتذكير)
        </label>
        <Textarea
          id='reason'
          name='reason'
          placeholder='أدخل السبب'
          rows={3}
          required
        />
      </div>
      <Button type='submit' className='w-full'>
        حفظ
      </Button>
    </form>
  )
}

export default AddBalanceForm
