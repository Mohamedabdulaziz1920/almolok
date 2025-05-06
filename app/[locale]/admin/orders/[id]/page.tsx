import { Metadata } from 'next'
import Link from 'next/link'
import { auth } from '@/auth'
import DeleteDialog from '@/components/shared/delete-dialog'
import Pagination from '@/components/shared/pagination'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDateTime, formatId } from '@/lib/utils'
import { IOrderList } from '@/types'
import ProductPrice from '@/components/shared/product/product-price'
import { getTranslations } from 'next-intl/server'
import { Badge } from '@/components/ui/badge'
import {
  deleteOrder,
  getAllOrders,
  markOrderAsCompleted,
  markOrderAsPending,
  rejectOrder,
} from '@/lib/actions/order.actions'

export const metadata: Metadata = {
  title: 'Admin Orders',
}

export default async function OrdersPage(props: {
  searchParams: Promise<{ page: string }>
}) {
  const t = await getTranslations('OrdersPage')
  const searchParams = await props.searchParams
  const { page = '1' } = searchParams

  const session = await auth()
  if (session?.user.role !== 'Admin')
    throw new Error(t('Admin permission required'))

  const orders = await getAllOrders({ page: Number(page) })

  return (
    <div className='container mx-auto px-1 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
          {t('Orders')}
        </h1>
        <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
          {t('Manage and track all customer orders')}
        </p>
      </div>

      <div className='rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950'>
        <div className='overflow-x-auto'>
          <Table className='min-w-full'>
            <TableHeader className='bg-gray-50 dark:bg-gray-800'>
              <TableRow>
                <TableHead className='text-right w-[120px]'>
                  {t('Id')}
                </TableHead>
                <TableHead className='text-right'>{t('Player ID')}</TableHead>
                <TableHead className='text-right'>{t('Total')}</TableHead>
                <TableHead className='text-right'>{t('Status')}</TableHead>
                <TableHead className='text-right min-w-[150px]'>
                  {t('Date')}
                </TableHead>
                <TableHead className='text-right'>{t('Buyer')}</TableHead>
                <TableHead className='text-right w-[220px]'>
                  {t('Actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.data.map((order: IOrderList) => (
                <TableRow
                  key={order._id}
                  className='hover:bg-gray-50 dark:hover:bg-gray-900'
                >
                  <TableCell className='font-medium text-gray-900 dark:text-white'>
                    {formatId(order._id)}
                  </TableCell>
                  <TableCell>
                    {order.items[0]?.playerId || (
                      <span className='text-gray-500'>N/A</span>
                    )}
                  </TableCell>
                  <TableCell className='text-right font-medium text-green-600 dark:text-green-400'>
                    <ProductPrice price={order.totalPrice} plain />
                  </TableCell>
                  <TableCell>
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
                  <TableCell className='text-gray-600 dark:text-gray-400'>
                    {formatDateTime(order.createdAt!).dateTime}
                  </TableCell>
                  <TableCell>
                    {order.user ? (
                      <span className='font-medium text-gray-900 dark:text-white'>
                        {order.user.name}
                      </span>
                    ) : (
                      <Badge variant='destructive' className='text-xs'>
                        {t('Deleted User')}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className='flex flex-col gap-2'>
                    <div className='flex gap-2'>
                      <Button
                        asChild
                        variant='outline'
                        size='sm'
                        className='hover:bg-gray-100 dark:hover:bg-gray-800'
                      >
                        <Link href={`/admin/orders/${order._id}`}>
                          {t('Details')}
                        </Link>
                      </Button>
                      <DeleteDialog
                        id={order._id}
                        action={deleteOrder}
                        buttonProps={{
                          variant: 'destructive',
                          size: 'sm',
                          className: 'hover:bg-red-600 dark:hover:bg-red-700',
                        }}
                      />
                    </div>
                    <div className='flex gap-2 mt-2 flex-wrap'>
                      <form action={markOrderAsCompleted.bind(null, order._id)}>
                        <Button
                          size='sm'
                          variant='default'
                          className='text-xs'
                          disabled={order.status === 'completed'}
                        >
                          {t('Mark as Completed')}
                        </Button>
                      </form>
                      <form action={rejectOrder.bind(null, order._id)}>
                        <Button
                          size='sm'
                          variant='destructive'
                          className='text-xs'
                          disabled={order.status === 'rejected'}
                        >
                          {t('Reject')}
                        </Button>
                      </form>
                      <form action={markOrderAsPending.bind(null, order._id)}>
                        <Button
                          size='sm'
                          variant='outline'
                          className='text-xs'
                          disabled={order.status === 'pending'}
                        >
                          {t('Mark as Pending')}
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {orders.totalPages > 1 && (
          <div className='border-t border-gray-200 px-6 py-4 dark:border-gray-800'>
            <Pagination page={page} totalPages={orders.totalPages!} />
          </div>
        )}
      </div>
    </div>
  )
}
