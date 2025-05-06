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
import { formatDateTime, formatId } from '@/lib/utils'
import BrowsingHistoryList from '@/components/shared/browsing-history-list'
import ProductPrice from '@/components/shared/product/product-price'

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
    <div className='max-w-5xl mx-auto space-y-4'>
      <div className='flex gap-2'>
        <Link href='/account'>{t('YourAccount')}</Link>
        <span>›</span>
        <span>{t('YourOrders')}</span>
      </div>

      <h1 className='h1-bold pt-4'>{t('YourOrders')}</h1>

      <div className='overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('OrderId')}</TableHead>
              <TableHead>{t('OrderDate')}</TableHead>
              <TableHead>{t('OrderTotal')}</TableHead>
              <TableHead>{t('OrderPaid')}</TableHead>
              <TableHead>{t('OrderActive')}</TableHead>
              <TableHead>{t('OrderActions')}</TableHead>
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
                <TableCell>
                  <ProductPrice price={order.totalPrice} plain />
                </TableCell>

                <TableCell>
                  {order.isPaid && order.paidAt
                    ? formatDateTime(order.paidAt).dateTime
                    : t('No')}
                </TableCell>

                <TableCell>
                  {order.status === 'completed'
                    ? t('Completed')
                    : order.status === 'rejected'
                      ? t('Rejected')
                      : t('Pending')}
                </TableCell>

                <TableCell>
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

        {orders.totalPages > 1 && (
          <Pagination page={currentPage} totalPages={orders.totalPages} />
        )}
      </div>

      <BrowsingHistoryList className='mt-16' />
    </div>
  )
}
