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

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const t = await getTranslations('OrdersPage')
  const page = Number(searchParams?.page) || 1
  const session = await auth()
  if (session?.user.role !== 'Admin') {
    throw new Error(t('Admin permission required'))
  }

  const orders = await getAllOrders({ page })

  // تعديل الدوال لتتوافق مع النوع المطلوب
  const handleComplete = async (orderId: string) => {
    await markOrderAsCompleted(orderId)
  }

  const handleReject = async (orderId: string) => {
    await rejectOrder(orderId)
  }

  const handlePending = async (orderId: string) => {
    await markOrderAsPending(orderId)
  }

  return (
    <>
      <div className='mx-auto px-2 py-6 sm:px-4 sm:py-8 max-w-screen-2xl'>
        {/* Header with spacing */}
        <div className='mb-6 sm:mb-10'>
          <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white'>
            {t('Orders')}
          </h1>
          <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
            {t('Manage and track all customer orders')}
          </p>
        </div>

        {/* Responsive table container */}
        <div className='rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950 overflow-hidden'>
          {/* Mobile responsive table */}
          <div className='overflow-x-auto'>
            <Table className='min-w-full'>
              <TableHeader className='bg-gray-50 dark:bg-gray-800 hidden sm:table-header-group'>
                <TableRow>
                  <TableHead className='text-right w-[100px] sm:w-[120px]'>
                    {t('Id')}
                  </TableHead>
                  <TableHead className='text-right'>{t('Player ID')}</TableHead>
                  <TableHead className='text-right'>{t('Buyer')}</TableHead>
                  <TableHead className='text-right'>{t('Total')}</TableHead>
                  <TableHead className='text-right'>{t('Status')}</TableHead>
                  <TableHead className='text-right min-w-[120px] sm:min-w-[150px]'>
                    {t('Date')}
                  </TableHead>
                  <TableHead className='text-right w-[200px] sm:w-[300px]'>
                    {t('Actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.data.map((order: IOrderList) => (
                  <TableRow
                    key={order._id}
                    className='hover:bg-gray-50 dark:hover:bg-gray-900 block sm:table-row border-b'
                  >
                    {/* Mobile view - stacked cells */}
                    <TableCell className='block sm:table-cell p-2 sm:p-4'>
                      <div className='sm:hidden font-semibold mb-1'>
                        {t('Id')}:
                      </div>
                      <span className='font-medium text-gray-900 dark:text-white'>
                        {formatId(order._id)}
                      </span>
                    </TableCell>

                    <TableCell className='block sm:table-cell p-2 sm:p-4'>
                      <div className='sm:hidden font-semibold mb-1'>
                        {t('Player ID')}:
                      </div>
                      {order.items[0]?.playerId || (
                        <span className='text-gray-500'>N/A</span>
                      )}
                    </TableCell>

                    <TableCell className='block sm:table-cell p-2 sm:p-4'>
                      <div className='sm:hidden font-semibold mb-1'>
                        {t('Buyer')}:
                      </div>
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

                    <TableCell className='block sm:table-cell p-2 sm:p-4 text-right'>
                      <div className='sm:hidden font-semibold mb-1'>
                        {t('Total')}:
                      </div>
                      <span className='font-medium text-green-600 dark:text-green-400'>
                        <ProductPrice price={order.totalPrice} plain />
                      </span>
                    </TableCell>

                    <TableCell className='block sm:table-cell p-2 sm:p-4'>
                      <div className='sm:hidden font-semibold mb-1'>
                        {t('Status')}:
                      </div>
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

                    <TableCell className='block sm:table-cell p-2 sm:p-4'>
                      <div className='sm:hidden font-semibold mb-1'>
                        {t('Date')}:
                      </div>
                      <span className='text-gray-600 dark:text-gray-400 whitespace-nowrap'>
                        {formatDateTime(order.createdAt!).dateTime}
                      </span>
                    </TableCell>

                    <TableCell className='block sm:table-cell p-2 sm:p-4'>
                      <div className='sm:hidden font-semibold mb-2'>
                        {t('Actions')}:
                      </div>
                      <div className='flex flex-col gap-2'>
                        <div className='flex gap-2'>
                          <DeleteDialog
                            id={order._id}
                            action={deleteOrder}
                            buttonProps={{
                              variant: 'destructive',
                              size: 'sm',
                              className:
                                'hover:bg-red-600 dark:hover:bg-red-700 text-xs sm:text-sm w-full sm:w-auto',
                            }}
                          />
                        </div>
                        <div className='grid grid-cols-2 sm:flex gap-2'>
                          <form
                            action={async () => {
                              'use server'
                              await handleComplete(order._id)
                            }}
                            className='col-span-1'
                          >
                            <Button
                              size='sm'
                              variant='default'
                              className='w-full text-xs sm:text-sm'
                              disabled={order.status === 'completed'}
                            >
                              {t('completed')}
                            </Button>
                          </form>
                          <form
                            action={async () => {
                              'use server'
                              await handleReject(order._id)
                            }}
                            className='col-span-1'
                          >
                            <Button
                              size='sm'
                              variant='destructive'
                              className='w-full text-xs sm:text-sm'
                              disabled={order.status === 'rejected'}
                            >
                              {t('rejected')}
                            </Button>
                          </form>
                          <form
                            action={async () => {
                              'use server'
                              await handlePending(order._id)
                            }}
                            className='col-span-2 sm:col-span-1'
                          >
                            <Button
                              size='sm'
                              variant='outline'
                              className='w-full text-xs sm:text-sm bg-orange-500 text-white hover:bg-orange-600'
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
          </div>

          {orders.totalPages > 1 && (
            <div className='border-t border-gray-200 px-4 py-3 sm:px-6 sm:py-4 dark:border-gray-800'>
              <Pagination
                page={page.toString()}
                totalPages={orders.totalPages}
              />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
