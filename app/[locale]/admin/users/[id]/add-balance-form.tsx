'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { addUserBalance } from '@/lib/actions/user.actions'
import { IUser } from '@/lib/db/models/user.model'

const AddBalanceSchema = z.object({
  amount: z
    .coerce.number({ invalid_type_error: 'الرجاء إدخال رقم' })
    .min(1, 'المبلغ يجب أن يكون أكبر من 0'),
  reason: z.string().optional(),
})

type AddBalanceValues = z.infer<typeof AddBalanceSchema>

export default function AddBalanceForm({ user }: { user: IUser }) {
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<AddBalanceValues>({
    resolver: zodResolver(AddBalanceSchema),
    defaultValues: {
      amount: 0,
      reason: '',
    },
  })
const onSubmit = async (values: AddBalanceValues) => {
  try {
    await addUserBalance(user._id, values.amount)
    toast({ description: `تمت إضافة ${values.amount}$ للمستخدم ${user.name}` })
    router.push('/admin/users')
  } catch {
  toast({
    variant: 'destructive',
    description: 'حدث خطأ أثناء إضافة الرصيد',
    })
  }
}

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-2xl mx-auto bg-gray-800 p-8 rounded-xl shadow-2xl"
      >
        <div className="space-y-2 text-center">
          <h5 className="text-2xl font-semibold text-white">إضافة رصيد للمستخدم: {user.name}</h5>
          <div className="text-sm text-gray-400">{user.email}</div>
        </div>

        <div className="flex flex-col gap-6 md:flex-row">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-gray-100">المبلغ (بالدولار)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="أدخل المبلغ"
                    {...field}
                    className="bg-white border-gray-700 text-black placeholder-gray-400 focus:ring-2 focus:ring-blue-600 rounded-md"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-gray-100">السبب (اختياري)</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="أدخل السبب للتوثيق"
                    {...field}
                    className="bg-white border-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-600 rounded-md"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4 justify-center md:justify-between">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
           
          >
            {form.formState.isSubmitting ? 'جارٍ الحفظ...' : 'حفظ'}
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={() => router.push(`/admin/users`)}
            className="bg-blue-600 w-full md:w-auto text-white border-gray-900 hover:border-gray-500 hover:bg-gray-800"
          >
            رجوع
          </Button>
        </div>
      </form>
    </Form>
  )
}
