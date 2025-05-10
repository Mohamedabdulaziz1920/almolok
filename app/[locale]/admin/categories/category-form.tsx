'use client'

import { useTransition } from 'react'
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
import { useTranslations } from 'next-intl'

type Inputs = z.infer<typeof CategoryInputSchema>

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

// دالة لتحويل الاسم إلى رابط Slug
const toSlug = (text: string) => {
  return text.trim().toLowerCase().replace(/\s+/g, '-')
}

export function CategoryForm({ type, initialData, onSubmit }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const t = useTranslations('CategoryForm')

  const form = useForm<Inputs>({
    resolver: zodResolver(CategoryInputSchema),
    defaultValues: {
      name: '',
      slug: '',
      image: '',
      ...initialData,
    },
  })

  const handleFormSubmit = (data: Inputs) => {
    startTransition(async () => {
      try {
        if (type === 'Edit' && onSubmit) {
          await onSubmit(data)
          toast.success(t('editSuccess'))
        } else {
          const result: CreateCategoryResult = await createCategory(data)

          if (result.error) {
            toast.error(result.error)
            return
          }

          toast.success(t('createSuccess'))
          router.push('/admin/categories')
        }
      } catch {
        toast.error(t('saveError'))
      }
    })
  }

  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit)} className='space-y-4'>
      {/* Name */}
      <div className='space-y-2'>
        <label className='block font-medium'>{t('name')}</label>
        <Input
          {...form.register('name')}
          placeholder={t('namePlaceholder')}
          className='input'
        />
        {form.formState.errors.name && (
          <p className='text-sm text-red-500'>
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      {/* Slug */}
      <div className='space-y-2'>
        <label className='block font-medium'>{t('slug')}</label>
        <div className='relative'>
          <Input
            {...form.register('slug')}
            placeholder={t('slugPlaceholder')}
            className='pr-24 input'
          />
          <Button
            type='button'
            onClick={() => {
              form.setValue('slug', toSlug(form.getValues('name')))
            }}
            className='absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 h-auto text-sm'
          >
            {t('generate')}
          </Button>
        </div>
        {form.formState.errors.slug && (
          <p className='text-sm text-red-500'>
            {form.formState.errors.slug.message}
          </p>
        )}
      </div>

      {/* Image Upload */}
      <div className='space-y-2'>
        <label className='block font-medium'>{t('image')}</label>
        <UploadButton
          endpoint='imageUploader'
          onClientUploadComplete={(res: { url: string }[]) => {
            if (res[0]?.url) {
              form.setValue('image', res[0].url, { shouldValidate: true })
              toast.success(t('uploadSuccess'))
            }
          }}
          onUploadError={(error: Error) => {
            toast.error(String(t('uploadError', { message: error.message })))
          }}
        />
        {form.formState.errors.image?.message && (
          <p className='text-sm text-red-500'>
            {form.formState.errors.image.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button type='submit' disabled={isPending}>
        {isPending ? t('saving') : type === 'Edit' ? t('update') : t('create')}
      </Button>
    </form>
  )
}
