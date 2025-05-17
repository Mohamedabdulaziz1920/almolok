import Link from 'next/link'
import { getCategories } from '@/lib/actions/category.actions'
import { Button } from '@/components/ui/button'
import { getTranslations } from 'next-intl/server'
import CategoryCard from '@/components/shared/category/CategoryCard'

const CategoriesListPage = async () => {
  const response = await getCategories()
  const t = await getTranslations('CategoriesListPage')

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
              <CategoryCard key={category._id} category={category} />
            ))
          ) : (
            <p className='text-center col-span-full'>{t('No categories yet')}</p>
          )}
        </div>
      </div>
    </main>
  )
}

export default CategoriesListPage
