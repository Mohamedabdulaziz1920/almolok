'use client'

import { useEffect, useTransition } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { CategoryInputSchema } from '@/lib/validator'
import { z } from 'zod'
import { createCategory } from '@/lib/actions/category.actions'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { UploadButton } from '@/lib/uploadthing'
import { Button } from '@/components/ui/button'

// تعريف نوع البيانات المستخدمة
type Inputs = z.infer<typeof CategoryInputSchema>

// نتيجة إنشاء الفئة
type CreateCategoryResult = {
  error?: string
  category?: {
    _id: string
    name: string
    slug: string
    image: string
  }
}

type Props = {
  type: 'Create' | 'Edit'
  initialData?: Inputs
  onSubmit?: (data: Inputs) => void
}

export function CategoryForm({ type, initialData, onSubmit }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(CategoryInputSchema),
    defaultValues: {
      name: '',
      slug: '',
      image: '',
      ...initialData,
    },
  })

  const watchName = watch('name')

  // توليد slug تلقائيًا عند الإنشاء فقط
  useEffect(() => {
    if (type === 'Create' && watchName) {
      const generatedSlug = watchName.trim().toLowerCase().replace(/\s+/g, '-')
      setValue('slug', generatedSlug)
    }
  }, [watchName, setValue, type])

  const handleFormSubmit = (data: Inputs) => {
    startTransition(async () => {
      try {
        if (type === 'Edit' && onSubmit) {
          await onSubmit(data)
          toast.success('تم تعديل الفئة بنجاح')
        } else {
          const result: CreateCategoryResult = await createCategory(data)

          if (result.error) {
            toast.error(result.error)
            return
          }

          toast.success('تم إنشاء الفئة بنجاح')
          router.push('/admin/categories')
        }
      } catch {
        toast.error('حدث خطأ أثناء حفظ البيانات')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-4'>
      <Input {...register('name')} placeholder='اسم الفئة' className='input' />
      {errors.name && (
        <p className='text-sm text-red-500'>{errors.name.message}</p>
      )}

      <Input
        {...register('slug')}
        placeholder='الرابط (Slug)'
        disabled={type === 'Create'}
        className='input'
      />
      {errors.slug && (
        <p className='text-sm text-red-500'>{errors.slug.message}</p>
      )}

      <UploadButton
        endpoint='imageUploader'
        onClientUploadComplete={(res: { url: string }[]) => {
          if (res[0]?.url) {
            setValue('image', res[0].url, { shouldValidate: true })
            toast.success('تم رفع الصورة بنجاح')
          }
        }}
        onUploadError={(error: Error) => {
          toast.error(`فشل رفع الصورة: ${error.message}`)
        }}
      />

      {errors.image?.message && (
        <p className='text-sm text-red-500'>{errors.image.message}</p>
      )}

      <Button type='submit' disabled={isPending}>
        {isPending
          ? 'جاري الحفظ...'
          : type === 'Edit'
            ? 'تحديث الفئة'
            : 'إنشاء الفئة'}
      </Button>
    </form>
  )
}
