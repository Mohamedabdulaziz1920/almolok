import { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

import Pagination from '@/components/shared/pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { getMyOrders } from '@/lib/actions/order.actions'
import { IOrder } from '@/lib/db/models/order.model'
import { formatId } from '@/lib/utils'
import BrowsingHistoryList from '@/components/shared/browsing-history-list'
import ProductPrice from '@/components/shared/product/product-price'
import { Badge } from '@/components/ui/badge'

const PAGE_TITLE = 'Your Orders'
export const metadata: Metadata = {
  title: PAGE_TITLE,
}

interface OrdersPageProps {
  searchParams: { page?: string }
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const t = await getTranslations('AccountPage')
  const currentPage = Number(searchParams.page) || 1
  const orders = await getMyOrders({ page: currentPage })

  return (
    <div className='container mx-auto px-1 py-8'>
      <div className='mb-8 flex gap-2'>
        <Link href='/account'>{t('YourAccount')}</Link>
        <span>›</span>
        <span>{t('YourOrders')}</span>
      </div>

      <h1 className='h1-bold pt-4'>{t('YourOrders')}</h1>

      <div className='rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950'>
        <div className='overflow-x-auto'>
          <Table className='min-w-full'>
            <TableHeader className='bg-gray-50 dark:bg-gray-800'>
              <TableRow>
                <TableHead>{t('OrderId')}</TableHead>
                <TableHead className='text-right'>{t('OrderTotal')}</TableHead>
                <TableHead className='text-right'>{t('OrderStatus')}</TableHead>
                <TableHead className='text-right'>
                  {t('OrderActions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className='text-center py-6'>
                    {t('NoOrders')}
                  </TableCell>
                </TableRow>
              )}

              {orders.data.map((order: IOrder) => (
                <TableRow key={String(order._id)}>
                  <TableCell>
                    <Link
                      href={`/account/orders/${String(order._id)}`}
                      className='text-primary underline'
                    >
                      {formatId(order._id)}
                    </Link>
                  </TableCell>

                  <TableCell className='text-right'>
                    <ProductPrice price={order.totalPrice} plain />
                  </TableCell>

                  <TableCell className='text-right'>
                    <Badge
                      className={`text-xs ${
                        order.status === 'completed'
                          ? 'bg-green-600'
                          : order.status === 'rejected'
                            ? 'bg-red-600'
                            : 'bg-yellow-500'
                      }`}
                    >
                      {t(order.status)}
                    </Badge>
                  </TableCell>

                  <TableCell className='text-right'>
                    <Link href={`/account/orders/${String(order._id)}`}>
                      <span className='text-blue-600 hover:underline'>
                        {t('Details')}
                      </span>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {orders.totalPages > 1 && (
          <Pagination page={currentPage} totalPages={orders.totalPages} />
        )}
      </div>

      <BrowsingHistoryList className='mt-16' />
    </div>
  )
}
