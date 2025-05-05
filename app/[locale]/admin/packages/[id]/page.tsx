'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PackageInputSchema } from '@/lib/validators'
import { z } from 'zod'
import { useParams, useRouter } from 'next/navigation'
import { getPackageById, updatePackage } from '@/lib/actions/package.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Image from 'next/image'
import { UploadButton } from '@/components/shared/uploadthing'
import { PackageType } from '@/types'

const EditPackagePage = () => {
  const { id } = useParams()
  const router = useRouter()
  const [imageUrl, setImageUrl] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<z.infer<typeof PackageInputSchema>>({
    resolver: zodResolver(PackageInputSchema),
    defaultValues: {
      name: '',
      slug: '',
      price: 0,
      image: '',
      description: '',
      currency: 'USD',
      isPublished: false,
    },
  })

  useEffect(() => {
    const fetchPackage = async () => {
      const existingPackage = (await getPackageById(
        id as string
      )) as PackageType
      if (existingPackage) {
        form.reset({
          name: existingPackage.name,
          slug: existingPackage.slug,
          price: existingPackage.price,
          image: existingPackage.image,
          description: existingPackage.description,
          currency: existingPackage.currency,
          isPublished: existingPackage.isPublished,
        })
        setImageUrl(existingPackage.image)
      }
      setIsLoading(false)
    }

    fetchPackage()
  }, [id, form])

  const onSubmit = async (data: z.infer<typeof PackageInputSchema>) => {
    await updatePackage({ ...data, _id: id as string, image: imageUrl })
  }

  if (isLoading) {
    return <div className='text-center py-20 text-gray-500'>Loading...</div>
  }

  return (
    <section className='max-w-3xl mx-auto px-4 md:px-6 py-8'>
      <h1 className='text-2xl md:text-3xl font-semibold mb-6'>Edit Package</h1>

      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <div className='space-y-2'>
          <label className='block font-medium'>Package Name</label>
          <Input {...form.register('name')} />
        </div>

        <div className='space-y-2'>
          <label className='block font-medium'>Slug</label>
          <Input {...form.register('slug')} />
        </div>

        <div className='space-y-2'>
          <label className='block font-medium'>Price</label>
          <Input type='number' {...form.register('price')} />
        </div>

        <div className='space-y-2'>
          <label className='block font-medium'>Currency</label>
          <select
            {...form.register('currency')}
            className='w-full border rounded-md px-3 py-2'
          >
            <option value='USD'>دولار</option>
            <option value='SAR'>ريال سعودي</option>
            <option value='YER'>ريال يمني</option>
          </select>
        </div>

        <div className='space-y-2'>
          <label className='block font-medium'>Description</label>
          <Textarea {...form.register('description')} rows={4} />
        </div>

        <div className='space-y-2'>
          <label className='block font-medium'>Image</label>
          {imageUrl ? (
            <div className='relative w-32 h-32'>
              <Image
                src={imageUrl}
                alt='Uploaded image'
                layout='fill'
                className='object-cover rounded'
              />
            </div>
          ) : null}
          <UploadButton
            endpoint='imageUploader'
            onClientUploadComplete={(res) => {
              if (res && res[0]) setImageUrl(res[0].url)
            }}
            onUploadError={(error: Error) =>
              alert(`Upload error: ${error.message}`)
            }
          />
        </div>

        <div className='flex items-center gap-2'>
          <input type='checkbox' {...form.register('isPublished')} />
          <label>Publish</label>
        </div>

        <Button type='submit' className='w-full md:w-auto'>
          Update Package
        </Button>
      </form>
    </section>
  )
}

export default EditPackagePage
