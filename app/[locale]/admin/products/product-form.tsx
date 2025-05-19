'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { createProduct, updateProduct } from '@/lib/actions/product.actions'
import { IProduct } from '@/lib/db/models/product.model'
import { UploadButton } from '@/lib/uploadthing'
import { ProductInputSchema, ProductUpdateSchema } from '@/lib/validator'
import { Checkbox } from '@/components/ui/checkbox'
import { toSlug } from '@/lib/utils'
import { IProductInput } from '@/types'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { getCategories } from '@/lib/actions/category.actions'
import { Loader2 } from 'lucide-react'

interface Category {
  _id: string
  slug: string
  name: string
}

const productDefaultValues: IProductInput = {
  name: '',
  slug: '',
  category: '',
  images: [],
  brand: '',
  description: '',
  price: 0,
  listPrice: 0,
  countInStock: 0,
  numReviews: 0,
  avgRating: 0,
  numSales: 0,
  isPublished: false,
  tags: [],
  ratingDistribution: [],
  reviews: [],
}

const ProductForm = ({
  type,
  product,
  productId,
}: {
  type: 'Create' | 'Update'
  product?: IProduct
  productId?: string
}) => {
  const [categories, setCategories] = useState<Category[]>([])
  const router = useRouter()
  const t = useTranslations('ProductForm')
  const { toast } = useToast()

  const form = useForm<IProductInput>({
    resolver:
      type === 'Update'
        ? zodResolver(ProductUpdateSchema)
        : zodResolver(ProductInputSchema),
    defaultValues:
      product && type === 'Update' ? product : productDefaultValues,
  })

  useEffect(() => {
    async function fetchCategories() {
      const res = await getCategories()
      if (res.success) {
        setCategories(res.data)
      }
    }

    fetchCategories()
  }, [])

  async function onSubmit(values: IProductInput) {
    try {
      if (values.images.length === 0) {
        toast({
          variant: 'destructive',
          description: 'يجب إضافة صورة واحدة على الأقل',
        })
        return
      }

      const processedValues = {
        ...values,
        price: Number(values.price),
        listPrice: Number(values.listPrice),
        countInStock: Number(values.countInStock),
        slug: values.slug || toSlug(values.name),
      }

      if (type === 'Create') {
        const res = await createProduct(processedValues)
        if (!res.success) throw new Error(res.message)
        
        toast({ description: res.message })
        router.push(`/admin/products`)
      } else if (type === 'Update') {
        if (!productId) {
          router.push(`/admin/products`)
          return
        }
        
        const res = await updateProduct({ ...processedValues, _id: productId })
        if (!res.success) throw new Error(res.message)
        
        toast({ description: res.message })
        router.push(`/admin/products`)
      }
    } catch (error) {
      console.error('Error submitting product:', error)
      toast({
        variant: 'destructive',
        description: error instanceof Error 
          ? (error.message || 'حدث خطأ أثناء حفظ المنتج') 
          : 'حدث خطأ غير متوقع',
      })
    }
  }

  const images = form.watch('images')

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-8'
      >
        <div className='flex flex-col gap-5 md:flex-row'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>{t('Name')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('Enter product name')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='slug'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>{t('Slug')}</FormLabel>
                <FormControl>
                  <div className='relative'>
                    <Input
                      placeholder={t('Enter product slug')}
                      className='pl-8'
                      {...field}
                    />
                    <button
                      type='button'
                      onClick={() => {
                        form.setValue('slug', toSlug(form.getValues('name')))
                      }}
                      className='absolute right-2 top-2.5'
                    >
                      {t('Generate')}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='flex flex-col gap-5 md:flex-row'>
          <FormField
            control={form.control}
            name='category'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>{t('Category')}</FormLabel>
                <FormControl>
                  <select
                    value={field.value}
                    onChange={field.onChange}
                    className='w-full border border-input bg-background px-3 py-2 text-sm rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary'
                  >
                    <option value=''>{t('Select category')}</option>
                    {categories.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='countInStock'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>{t('Count In Stock')}</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder={t('Enter product count in stock')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='flex flex-col gap-5 md:flex-row'>
          <FormField
            control={form.control}
            name='listPrice'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>{t('List Price')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('Enter product list price')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='price'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>{t('Net Price')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('Enter product price')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='flex flex-col gap-5 md:flex-row'>
          <FormField
            control={form.control}
            name='images'
            render={() => (
              <FormItem className='w-full'>
                <FormLabel>{t('Images')}</FormLabel>
                <Card>
                  <CardContent className='space-y-2 mt-2 min-h-48'>
                    <div className='flex justify-start items-center space-x-2'>
                      {images.map((image: string) => (
                        <Image
                          key={image}
                          src={image}
                          alt={t('product image')}
                          className='w-20 h-20 object-cover object-center rounded-sm'
                          width={100}
                          height={100}
                        />
                      ))}
                      <FormControl>
                        <UploadButton
                          endpoint='imageUploader'
                          onClientUploadComplete={(res: { url: string }[]) => {
                            if (res && res.length > 0) {
                              form.setValue('images', [...form.getValues('images'), res[0].url])
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
                    </div>
                  </CardContent>
                </Card>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>{t('description')}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t('Tell us a little bit about yourself')}
                    className='resize-none'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormField
            control={form.control}
            name='isPublished'
            render={({ field }) => (
              <FormItem className='space-x-2 items-center'>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>{t('is_published')}</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <div>
          <Button
            type='submit'
            size='lg'
            disabled={form.formState.isSubmitting}
            className='button col-span-2 w-full'
          >
            {form.formState.isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('submitting')}
              </div>
            ) : (
              t(`${type.toLowerCase()}_product`)
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default ProductForm
