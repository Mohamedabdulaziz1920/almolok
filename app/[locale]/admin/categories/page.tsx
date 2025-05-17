'use client'

import Link from 'next/link'
import { getCategories, deleteCategory } from '@/lib/actions/category.actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from '@/components/ui/use-toast'

const CategoriesListPage = async () => {
  const response = await getCategories()
  const t = await getTranslations('CreateCategoryPage')

  if (!response.success) {
    return (
      <div className='container mx-auto px-1 py-8'>
        <h1 className='text-2xl font-bold text-red-600'>{t('Error')}</h1>
        <p className='text-gray-600 dark:text-gray-400'>{response.error}</p>
      </div>
    )
  }

  const categories = response.data

  return (
    <main className='max-w-6xl mx-auto p-4 pt-20'>
      <div className='container mx-auto px-1 py-8'>
        <h1 className='text-2xl font-bold'>{t('Categories')}</h1>
        <main className='max-w-6xl mx-auto p-4 md:p-6 lg:p-8'>
          <div className='flex justify-between items-center mb-6'>
            <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
              {t('Manage and track all Categories')}
            </p>
            <Link href='/admin/categories/create'>
              <Button>{t('Create New Category')}</Button>
            </Link>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
            {categories.length > 0 ? (
              categories.map((category) => (
                <CategoryCard key={category._id} category={category} t={t} />
              ))
            ) : (
              <p className='text-center col-span-full'>
                {t('No categories yet')}
              </p>
            )}
          </div>
        </main>
      </div>
    </main>
  )
}

export default CategoriesListPage

// 🔻 مكون فرعي لعرض البطاقة مع الحذف
import { useState } from 'react'

const CategoryCard = ({ category, t }: { category: any; t: any }) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleDelete = () => {
    const confirmed = window.confirm(t('Confirm Delete'))
    if (!confirmed) return

    startTransition(() => {
      setLoadingId(category._id)
      deleteCategory(category._id).then((res) => {
        if (res.success) {
          toast({ description: res.message })
          router.refresh()
        } else {
          toast({ variant: 'destructive', description: res.message })
        }
        setLoadingId(null)
      })
    })
  }

  return (
    <Card>
      <CardContent className='p-4 flex flex-col items-center'>
        <Image
          src={category.image}
          alt={category.name}
          width={100}
          height={100}
          className='rounded object-contain'
        />
        <h3 className='mt-4 font-semibold'>{category.name}</h3>
        <div className='mt-2 flex gap-2 w-full justify-center'>
          <Button asChild variant='outline' size='sm'>
            <Link href={`/admin/categories/edit/${category._id}`}>
              {t('Edit')}
            </Link>
          </Button>
          <Button
            variant='destructive'
            size='sm'
            disabled={isPending && loadingId === category._id}
            onClick={handleDelete}
          >
            {isPending && loadingId === category._id
              ? t('Deleting...')
              : t('Delete')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
