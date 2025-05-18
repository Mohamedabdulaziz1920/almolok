'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { CategoryInputSchema } from '@/lib/validator'
import { z } from 'zod'
import { createCategory, updateCategory } from '@/lib/actions/category.actions'
import { Input } from '@/components/ui/input'
import { UploadButton } from '@/lib/uploadthing'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { toSlug } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { useState } from 'react'

type Inputs = z.infer<typeof CategoryInputSchema>

export enum CategoryFormType {
  Create = 'Create',
  Update = 'Update',
}

const categoryDefaultValues: Inputs = {
  name: '',
  slug: '',
  image: '',
}

type Props = {
  type: CategoryFormType
  initialData?: Inputs
  categoryId?: string
}

const CategoryForm = ({ type, initialData, categoryId }: Props) => {
  const router = useRouter()
  const t = useTranslations('CategoryForm')
  const { toast } = useToast()
  const [isPending, setIsPending] = useState(false)

  const form = useForm<Inputs>({
    resolver: zodResolver(CategoryInputSchema),
    defaultValues: initialData ?? categoryDefaultValues,
  })

  const image = form.watch('image')

  async function onSubmit(values: Inputs) {
    setIsPending(true)
    try {
      if (type === CategoryFormType.Create) {
        const res = await createCategory(values)
        if (!res.success) {
          toast({
            variant: 'destructive',
            description: res.message,
          })
        } else {
          toast({ description: res.message })
          router.push(`/admin/categories`)
        }
      }

      if (type === CategoryFormType.Update) {
        if (!categoryId) {
          router.push(`/admin/categories`)
          return
        }
        const res = await updateCategory(categoryId, values)
        if (!res.success) {
          toast({
            variant: 'destructive',
            description: res.message,
          })
        } else {
          toast({ description: res.message })
          router.push(`/admin/categories`)
        }
      }
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Form {...form}>
      <form
        method='post'
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-8'
      >
        {/* الاسم */}
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('name')}</FormLabel>
              <FormControl>
                <Input placeholder={t('namePlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* السُّلَغ */}
        <FormField
          control={form.control}
          name='slug'
          render={() => (
            <FormItem>
              <FormLabel>{t('slug')}</FormLabel>
              <FormControl>
                <div className='space-y-2'>
                  <div className='relative'>
                    <Input
                      {...form.register('slug')}
                      placeholder={t('slugPlaceholder')}
                      className='pr-24 input'
                    />
                    <Button
                      type='button'
                      onClick={() =>
                        form.setValue('slug', toSlug(form.getValues('name')))
                      }
                      className='absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 h-auto text-sm'
                    >
                      {t('generate')}
                    </Button>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* الصورة */}
        <FormField
          control={form.control}
          name='image'
          render={() => (
            <FormItem>
              <FormLabel>{t('image')}</FormLabel>
              <Card>
                <CardContent className='space-y-2 mt-2 min-h-48'>
                  {image && (
                    <div className='flex items-center gap-4'>
                      <Image
                        src={image}
                        alt={t('category image')}
                        className='w-20 h-20 object-cover rounded-sm'
                        width={100}
                        height={100}
                      />
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => form.setValue('image', '')}
                      >
                        {t('removeImage')}
                      </Button>
                    </div>
                  )}
                  <FormControl>
                    <UploadButton
                      endpoint='imageUploader'
                      onClientUploadComplete={(res: { url: string }[]) => {
                        if (res && res[0]?.url) {
                          form.setValue('image', res[0].url)
                        }
                      }}
                      onUploadError={(error: Error) => {
                        toast({
                          variant: 'destructive',
                          description: `ERROR! ${error.message}`,
                        })
                      }}
                    />
                  </FormControl>
                </CardContent>
              </Card>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* زر الحفظ */}
        <Button type='submit' disabled={isPending}>
          {isPending
            ? t('saving')
            : type === CategoryFormType.Update
            ? t('update')
            : t('Create')}
        </Button>
      </form>
    </Form>
  )
}

export default CategoryForm
