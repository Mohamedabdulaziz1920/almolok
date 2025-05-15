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

interface OrdersPageProps {
  searchParams?: {
    page?: string
  }
}
type OrderAction = (formData: FormData) => Promise<{ success: boolean }>

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

  // دالة مساعدة لمعالجة Server Actions
  const handleAction = async (
    action: OrderAction,
    formData: FormData
  ): Promise<void> => {
    'use server'
    await action(formData)
  }

  return (
        <main className='max-w-6xl mx-auto p-4 pt-20'>
    <div className='container mx-auto px-2 py-6 sm:px-4 sm:py-8'>
      <div className='mb-6 sm:mb-10'>
        <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white'>
          {t('Orders')}
        </h1>
        <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
          {t('Manage and track all customer orders')}
        </p>
      </div>

      <div className='rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950 overflow-hidden'>
        <div className='overflow-x-auto'>
          <Table className='min-w-full'>
            <TableHeader className='bg-gray-50 dark:bg-gray-800'>
              <TableRow>
                <TableHead className='w-[100px] sm:w-[120px]'>
                  {t('Id')}
                </TableHead>
                <TableHead>{t('Player ID')}</TableHead>
                <TableHead>{t('Buyer')}</TableHead>
                <TableHead className='text-right'>{t('Total')}</TableHead>
                <TableHead>{t('Status')}</TableHead>
                <TableHead className='min-w-[120px] sm:min-w-[150px]'>
                  {t('Date')}
                </TableHead>
                <TableHead className='w-[200px] sm:w-[300px]'>
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
                  <TableCell>
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
                  <TableCell>
                    <Badge
                      className={`text-xs ${
                        order.status === 'completed'
                          ? 'bg-green-600'
                          : order.status === 'rejected'
                            ? 'bg-red-600'
                            : 'bg-orange-500'
                      }`}
                    >
                      {t(order.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className='whitespace-nowrap'>
                    {formatDateTime(order.createdAt!).dateTime}
                  </TableCell>
                  <TableCell>
                    <div className='flex flex-col gap-2'>
                      <div className='flex gap-2'>
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
                      <div className='grid grid-cols-2 sm:flex gap-2'>
                        <form
                          action={(fd) =>
                            handleAction(markOrderAsCompleted, fd)
                          }
                        >
                          <input
                            type='hidden'
                            name='orderId'
                            value={order._id}
                          />
                          <Button
                            type='submit'
                            size='sm'
                            disabled={order.status === 'completed'}
                          >
                            {t('Complete')}
                          </Button>
                        </form>
                        <form action={(fd) => handleAction(rejectOrder, fd)}>
                          <input
                            type='hidden'
                            name='orderId'
                            value={order._id}
                          />
                          <Button
                            type='submit'
                            size='sm'
                            variant='destructive'
                            disabled={order.status === 'rejected'}
                          >
                            {t('Reject')}
                          </Button>
                        </form>
                        <form
                          action={(fd) => handleAction(markOrderAsPending, fd)}
                        >
                          <input
                            type='hidden'
                            name='orderId'
                            value={order._id}
                          />
                          <Button
                            type='submit'
                            size='sm'
                            variant='outline'
                            disabled={order.status === 'pending'}
                          >
                            {t('Pending')}
                          </Button>
                        </form>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className='border-t border-gray-200 px-4 py-3 sm:px-6 sm:py-4 dark:border-gray-800'>
            <Pagination page={page.toString()} totalPages={totalPages} />
          </div>
        )}
      </div>
    </div>
          </main>
  )
}
