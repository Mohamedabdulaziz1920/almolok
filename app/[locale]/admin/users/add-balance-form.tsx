'use client'

import { useFormState } from 'react-dom'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { addUserBalance } from '@/lib/actions/user.actions'
import { useToast } from '@/hooks/use-toast'

type FormState = {
  success?: boolean
  error?: string
}

function AddBalanceForm({ userId }: { userId: string }) {
  const router = useRouter()
  const { toast } = useToast()

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
      toast({
        description: 'تمت إضافة الرصيد بنجاح',
      })
      router.push('/admin/users')
    } else if (state?.error) {
      toast({
        variant: 'destructive',
        description: state.error,
      })
    }
  }, [state, toast, router])

  return (
    <form action={formAction} className='space-y-4'>
      <div>
        <label htmlFor='amount' className='block mb-1'>
          القيمة (بالدولار)
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
          السبب (اختياري)
        </label>
        <Textarea
          id='reason'
          name='reason'
          placeholder='أدخل السبب للتوثيق (غير مطلوب)'
          rows={3}
        />
      </div>
      <Button type='submit' className='w-full'>
        حفظ
      </Button>
    </form>
  )
}

export default AddBalanceForm
