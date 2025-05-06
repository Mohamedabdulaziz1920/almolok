import Link from 'next/link'
import ProductForm from '../product-form'
import { Metadata } from 'next'
import { useTranslations } from 'next-intl'

export const metadata: Metadata = {
  title: 'Create Product',
}

const CreateProductPage = () => {
  const t = useTranslations('CreateProductPage')

  return (
    <main className='max-w-6xl mx-auto p-4 md:p-6 lg:p-8'>
      {/* Breadcrumb Navigation */}
      <nav className='flex items-center text-sm mb-6 md:mb-8'>
        <Link
          href='/admin/products'
          className='text-primary hover:underline transition-colors'
        >
          {t('products')}
        </Link>
        <span className='mx-2 text-muted-foreground'>/</span>
        <Link
          href='/admin/products/create'
          className='font-medium text-primary hover:underline transition-colors'
        >
          {t('create')}
        </Link>
      </nav>

      {/* Page Header */}
      <div className='mb-8'>
        <h1 className='text-2xl md:text-3xl font-bold tracking-tight'>
          {t('create_product')}
        </h1>
        <p className='text-muted-foreground mt-2'>
          {t('create_product_details')}
        </p>
      </div>

      {/* Product Form Container */}
      <div className='bg-background rounded-lg border shadow-sm p-4 md:p-6 lg:p-8'>
        <ProductForm type='Create' />
      </div>
    </main>
  )
}

export default CreateProductPage
