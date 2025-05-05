import Link from 'next/link'
import { Metadata } from 'next'
import { useTranslations } from 'next-intl'
import { CategoryForm } from '../category-form'
export const metadata: Metadata = {
  title: 'Create Category',
}

const CreateCategoryPage = () => {
  const t = useTranslations('CreateCategoryPage')

  return (
    <main className='max-w-6xl mx-auto p-4 md:p-6 lg:p-8'>
      {/* Breadcrumb Navigation */}
      <nav className='flex items-center text-sm mb-6 md:mb-8'>
        <Link
          href='/admin/categories'
          className='text-primary hover:underline transition-colors'
        >
          {t('categories')}
        </Link>
        <span className='mx-2 text-muted-foreground'>/</span>
        <span className='font-medium text-primary'>{t('create')}</span>
      </nav>

      {/* Page Header */}
      <div className='mb-8'>
        <h1 className='text-2xl md:text-3xl font-bold tracking-tight'>
          {t('create_category')}
        </h1>
        <p className='text-muted-foreground mt-2'>
          {t('create_category_details')}
        </p>
      </div>

      {/* Form Container */}
      <div className='bg-background rounded-lg border shadow-sm p-4 md:p-6 lg:p-8'>
        <CategoryForm type='Create' />
      </div>
    </main>
  )
}

export default CreateCategoryPage
