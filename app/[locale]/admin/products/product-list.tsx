'use client'
import Link from 'next/link'
import DeleteDialog from '@/components/shared/delete-dialog'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  deleteProduct,
  getAllProductsForAdmin,
} from '@/lib/actions/product.actions'
import { IProduct } from '@/lib/db/models/product.model'
import React, { useEffect, useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { formatDateTime, formatId } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

type ProductListDataProps = {
  products: IProduct[]
  totalPages: number
  totalProducts: number
  to: number
  from: number
}

// تعريف نوع للـ debounce في window
declare global {
  interface Window {
    debounce: number | undefined
  }
}

const ProductList = () => {
  const [page, setPage] = useState<number>(1)
  const [inputValue, setInputValue] = useState<string>('')
  const [data, setData] = useState<ProductListDataProps>()
  const [isPending, startTransition] = useTransition()
  const t = useTranslations('ProductList')

  const handlePageChange = (changeType: 'next' | 'prev') => {
    const newPage = changeType === 'next' ? page + 1 : page - 1
    setPage(newPage)
    startTransition(async () => {
      const data = await getAllProductsForAdmin({
        query: inputValue,
        page: newPage,
      })
      setData(data)
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    if (value) {
      // إزالة استخدام any واستبدالها بالنوع الصحيح
      if (window.debounce) {
        clearTimeout(window.debounce)
      }
      window.debounce = window.setTimeout(() => {
        startTransition(async () => {
          const data = await getAllProductsForAdmin({ query: value, page: 1 })
          setData(data)
        })
      }, 500)
    } else {
      startTransition(async () => {
        const data = await getAllProductsForAdmin({ query: '', page })
        setData(data)
      })
    }
  }

  useEffect(() => {
    startTransition(async () => {
      const data = await getAllProductsForAdmin({ query: '' })
      setData(data)
    })
  }, [])

  // تنظيف الـ timeout عند unmount
  useEffect(() => {
    return () => {
      if (window.debounce) {
        clearTimeout(window.debounce)
      }
    }
  }, [])
  return (
    <main className='max-w-6xl mx-auto p-4 pt-20'>
      <div className='container mx-auto px-2 py-6 sm:px-4 sm:py-8 max-w-screen-2xl'>
        {/* Header Section */}
        <div className='mb-6 sm:mb-10'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4'>
            <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white'>
              {t('products')}
            </h1>
            {/* زر إنشاء منتج جديد */}
      <Button 
        asChild 
        className='w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white'
      >
        <Link href='/admin/products/create'>{t('createProduct')}</Link>
      </Button>

          </div>

          {/* Search and Info Section */}
          <div className='flex flex-col sm:flex-row sm:items-center gap-4'>
            <Input
              className='w-full sm:w-64'
              type='text'
              value={inputValue}
              onChange={handleInputChange}
              placeholder={t('filterPlaceholder')}
            />
            {isPending ? (
              <p className='text-sm'>{t('loading')}</p>
            ) : (
              <p className='text-sm'>
                {data?.totalProducts === 0
                  ? t('noResults')
                  : t('paginationCount', {
                      from: data?.from,
                      to: data?.to,
                      total: data?.totalProducts,
                    })}
              </p>
            )}
          </div>
        </div>

        {/* Table Section */}
        <div className='rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950 overflow-hidden'>
          <div className='overflow-x-auto'>
            <Table className='min-w-full'>
              <TableHeader className='bg-gray-50 dark:bg-gray-800 hidden sm:table-header-group'>
                <TableRow>
                  <TableHead>{t('tableHeaders.id')}</TableHead>
                  <TableHead>{t('tableHeaders.name')}</TableHead>
                  <TableHead className='text-right'>
                    {t('tableHeaders.price')}
                  </TableHead>
                  <TableHead>{t('tableHeaders.category')}</TableHead>
                  <TableHead>{t('tableHeaders.stock')}</TableHead>
                  <TableHead>{t('tableHeaders.rating')}</TableHead>
                  <TableHead>{t('tableHeaders.published')}</TableHead>
                  <TableHead>{t('tableHeaders.lastUpdate')}</TableHead>
                  <TableHead className='text-center'>
                    {t('tableHeaders.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.products.map((product: IProduct) => (
                  <TableRow
                    key={product._id}
                    className='hover:bg-gray-50 dark:hover:bg-gray-900 block sm:table-row border-b'
                  >
                    {/* Mobile view - stacked cells */}
                    <TableCell className='block sm:table-cell p-2 sm:p-4'>
                      <div className='sm:hidden font-semibold mb-1'>
                        {t('tableHeaders.id')}:
                      </div>
                      {formatId(product._id)}
                    </TableCell>

                    <TableCell className='block sm:table-cell p-2 sm:p-4'>
                      <div className='sm:hidden font-semibold mb-1'>
                        {t('tableHeaders.name')}:
                      </div>
                      <Link
                        href={`/admin/products/${product._id}`}
                        className='font-medium hover:underline'
                      >
                        {product.name}
                      </Link>
                    </TableCell>

                    <TableCell className='block sm:table-cell p-2 sm:p-4 text-right'>
                      <div className='sm:hidden font-semibold mb-1'>
                        {t('tableHeaders.price')}:
                      </div>
                      ${product.price}
                    </TableCell>

                    <TableCell className='block sm:table-cell p-2 sm:p-4'>
                      <div className='sm:hidden font-semibold mb-1'>
                        {t('tableHeaders.category')}:
                      </div>
                      {product.category}
                    </TableCell>

                    <TableCell className='block sm:table-cell p-2 sm:p-4'>
                      <div className='sm:hidden font-semibold mb-1'>
                        {t('tableHeaders.stock')}:
                      </div>
                      {product.countInStock}
                    </TableCell>

                    <TableCell className='block sm:table-cell p-2 sm:p-4'>
                      <div className='sm:hidden font-semibold mb-1'>
                        {t('tableHeaders.rating')}:
                      </div>
                      {product.avgRating}
                    </TableCell>

                    <TableCell className='block sm:table-cell p-2 sm:p-4'>
                      <div className='sm:hidden font-semibold mb-1'>
                        {t('tableHeaders.published')}:
                      </div>
                      {product.isPublished ? t('yes') : t('no')}
                    </TableCell>

                    <TableCell className='block sm:table-cell p-2 sm:p-4'>
                      <div className='sm:hidden font-semibold mb-1'>
                        {t('tableHeaders.lastUpdate')}:
                      </div>
                      {formatDateTime(product.updatedAt).dateTime}
                    </TableCell>

                    <TableCell className='block sm:table-cell p-2 sm:p-4'>
                      <div className='sm:hidden font-semibold mb-2'>
                        {t('tableHeaders.actions')}:
                      </div>
                      <div className='flex flex-wrap justify-center gap-2'>
                       {/* أزرار الإجراءات في الجدول */}
      <div className='flex flex-wrap justify-center gap-2'>
        {/* زر التعديل */}
        <Button
          asChild
          size='sm'
          className='w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white'
        >
          <Link href={`/admin/products/${product._id}`}>
            {t('edit')}
          </Link>
        </Button>

        {/* زر المعاينة */}
        <Button
          asChild
          size='sm'
          className='w-full sm:w-auto bg-yellow-400 hover:bg-yellow-700 text-black'
        >
          <Link target='_blank' href={`/product/${product.slug}`}>
            {t('view')}
          </Link>
        </Button>

        {/* زر الحذف */}
        <DeleteDialog
          id={product._id}
          action={deleteProduct}
          callbackAction={() => {
            startTransition(async () => {
              const data = await getAllProductsForAdmin({
                query: inputValue,
              })
              setData(data)
            })
          }}
          buttonProps={{
            className: 'w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white',
          }}
        />
      </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Section */}
          {(data?.totalPages ?? 0) > 1 && (
            <div className='border-t border-gray-200 px-4 py-3 sm:px-6 sm:py-4 dark:border-gray-800'>
              <div className='flex flex-col sm:flex-row items-center justify-center gap-3'>
              {/* أزرار التصفح */}
      <Button
        variant='outline'
        onClick={() => handlePageChange('prev')}
        disabled={page <= 1}
        className='w-full sm:w-auto min-w-[100px] bg-gray-100 hover:bg-gray-200 text-gray-800'
      >
        <ChevronLeft className='h-4 w-4' /> {t('previous')}
      </Button>

      <Button
        variant='outline'
        onClick={() => handlePageChange('next')}
        disabled={page >= (data?.totalPages ?? 0)}
        className='w-full sm:w-auto min-w-[100px] bg-gray-100 hover:bg-gray-200 text-gray-800'
      >
        {t('next')} <ChevronRight className='h-4 w-4' />
      </Button>

              </div>
            </div>
          )}
        </div>
      </div>
</main>
  )
}

export default ProductList
