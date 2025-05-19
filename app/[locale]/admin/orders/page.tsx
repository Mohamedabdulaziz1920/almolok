import { Metadata } from 'next'
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
import { formatId } from '@/lib/utils'
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

interface OrdersPageProps {
  searchParams?: {
    page?: string
  }
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const t = await getTranslations('OrdersPage')
  const page = Number(searchParams?.page) || 1
  const session = await auth()

  if (session?.user.role !== 'Admin') {
    throw new Error(t('Admin permission required'))
  }

  const ordersResponse = await getAllOrders({ page })

  if (!ordersResponse.success || !ordersResponse.data) {
    throw new Error('Failed to fetch orders')
  }

  const orders = ordersResponse.data
  const totalPages = ordersResponse.totalPages || 1

  return (
    <main className="pt-16 px-4 md:px-6">
      <div className='mb-4 sm:mb-6 lg:mb-8'>
        <h1 className='text-xl font-bold sm:text-2xl lg:text-3xl text-gray-900 dark:text-white'>
          {t('Orders')}
        </h1>
        <p className='mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-400'>
          {t('Manage and track all customer orders')}
        </p>
      </div>

      <div className='rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950 overflow-x-auto'>
        <Table className='min-w-full'>
          <TableHeader className='bg-gray-50 dark:bg-gray-800'>
            <TableRow>
              <TableHead className='w-[80px] sm:w-[100px] lg:w-[120px]'>
                {t('Id')}
              </TableHead>
              <TableHead className='hidden sm:table-cell'>
                {t('Player ID')}
              </TableHead>
              <TableHead>{t('Buyer')}</TableHead>
              <TableHead className='text-right'>{t('Total')}</TableHead>
              <TableHead className='hidden xs:table-cell'>
                {t('Status')}
              </TableHead>
              <TableHead className='hidden md:table-cell'>
                {t('Date')}
              </TableHead>
              <TableHead className='w-[150px] sm:w-[200px] lg:w-[300px]'>
                {t('Actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order: IOrderList) => (
              <TableRow
                key={order._id}
                className='hover:bg-gray-50 dark:hover:bg-gray-900'
              >
                <TableCell className='font-medium'>
                  {formatId(order._id)}
                </TableCell>
                <TableCell className='hidden sm:table-cell'>
                  {order.items[0]?.playerId || (
                    <span className='text-gray-500'>N/A</span>
                  )}
                </TableCell>
                <TableCell>
                  {order.user ? (
                    <span className='font-medium'>{order.user.name}</span>
                  ) : (
                    <Badge variant='destructive' className='text-xs'>
                      {t('Deleted User')}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className='text-right font-medium text-green-600 dark:text-green-400'>
                  <ProductPrice price={order.totalPrice} plain />
                </TableCell>
                <TableCell className='hidden xs:table-cell'>
                  <Badge
                    className={`text-xs ${
                      order.status === 'completed'
                        ? 'bg-green-600'
                        : order.status === 'rejected'
                          ? 'bg-red-600'
                          : 'bg-yellow-400'
                    }`}
                  >
                    {t(order.status)}
                  </Badge>
                </TableCell>
                <TableCell className='text-right'>
                    <Badge
                      className={`text-xs ${
                        order.status === 'completed'
                          ? 'bg-green-600'
                          : order.status === 'rejected'
                            ? 'bg-red-600'
                            : 'bg-yellow-400'
                      }`}
                    >
                      {t(order.status)}
                    </Badge>
                  </TableCell>
                <TableCell>
                  <div className='flex flex-col gap-1 sm:gap-2'>
                    <div className='flex justify-end sm:justify-start'>
                      <DeleteDialog
                        id={order._id}
                        action={deleteOrder}
                        buttonProps={{
                          variant: 'destructive',
                          size: 'sm',
                          className:
                            'hover:bg-red-600 dark:hover:bg-red-700 w-full sm:w-auto',
                        }}
                      />
                    </div>
                    <div className='grid grid-cols-2 gap-1 sm:flex sm:gap-2'>
                      <form
                        action={markOrderAsCompleted}
                        className='w-full sm:w-auto'
                      >
                        <input type='hidden' name='orderId' value={order._id} />
                        <Button
                          type='submit'
                          size='sm'
                          className='w-full'
                          disabled={order.status === 'completed'}
                        >
                          {t('completed')}
                        </Button>
                      </form>
                      <form action={rejectOrder} className='w-full sm:w-auto'>
                        <input type='hidden' name='orderId' value={order._id} />
                        <Button
                          type='submit'
                          size='sm'
                          variant='destructive'
                          className='w-full'
                          disabled={order.status === 'rejected'}
                        >
                          {t('Reject')}
                        </Button>
                      </form>
                      <form
                        action={markOrderAsPending}
                        className='hidden sm:block sm:w-auto'
                      >
                        <input type='hidden' name='orderId' value={order._id} />
                        <Button
                          type='submit'
                          size='sm'
                          variant='outline'
                          disabled={order.status === 'pending'}
                        >
                          {t('pending')}
                        </Button>
                      </form>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className='border-t border-gray-200 px-4 py-3 sm:px-6 sm:py-4 dark:border-gray-800'>
            <Pagination page={page.toString()} totalPages={totalPages} />
          </div>
        )}
      </div>
    </main>
  )
}
