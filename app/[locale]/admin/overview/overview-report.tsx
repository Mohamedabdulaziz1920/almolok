'use client'

import React, { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import {
  BadgeDollarSign,
  Barcode,
  CreditCard,
  Users,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  calculatePastDate,
  formatDateTime,
  formatNumber,
} from '@/lib/utils'

import SalesCategoryPieChart from './sales-category-pie-chart'
import { DateRange } from 'react-day-picker'
import { getOrderSommary } from '@/lib/actions/order.actions'
import SalesAreaChart from './sales-area-chart'
import { CalendarDateRangePicker } from './date-range-picker'
import { IOrderList } from '@/types'
import ProductPrice from '@/components/shared/product/product-price'
import TableChart from './table-chart'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslations } from 'next-intl'

interface IOrderSummary {
  totalSales: number
  ordersCount: number
  usersCount: number
  productsCount: number
  salesChartData: { date: string; total: number }[]
  monthlySales: { label: string; total: number }[]
  topSalesProducts: { label: string; total: number }[]
  topSalesCategories: { label: string; total: number }[]
  latestOrders: IOrderList[]
}

export default function OverviewReport() {
  const t = useTranslations('Admin')

  const [date, setDate] = useState<DateRange | undefined>({
    from: calculatePastDate(30),
    to: new Date(),
  })

  const [data, setData] = useState<IOrderSummary | undefined>()
  const [, startTransition] = useTransition()

  // ✅ Reload once only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const alreadyRefreshed = sessionStorage.getItem('dashboardRefreshed')
      if (!alreadyRefreshed) {
        sessionStorage.setItem('dashboardRefreshed', 'true')
        window.location.reload()
      }
    }
  }, [])

  useEffect(() => {
    if (date) {
      startTransition(async () => {
        const result = await getOrderSommary(date)
        setData(result)
      })
    }
  }, [date])

  if (!data)
    return (
      <div className='space-y-4'>
        <div>
          <h1 className='h1-bold'>Dashboard</h1>
        </div>
        <div className='flex gap-4'>
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className='h-36 w-full' />
          ))}
        </div>
        <div>
          <Skeleton className='h-[30rem] w-full' />
        </div>
        <div className='flex gap-4'>
          {[...Array(2)].map((_, index) => (
            <Skeleton key={index} className='h-60 w-full' />
          ))}
        </div>
        <div className='flex gap-4'>
          {[...Array(2)].map((_, index) => (
            <Skeleton key={index} className='h-60 w-full' />
          ))}
        </div>
      </div>
    )

 return (
    <div>
      <main className="pt-16 px-4 md:px-6">
      <div className='flex items-center justify-between mb-2'>
        <h1 className='h1-bold'>{t('Dashboard')}</h1>
        <CalendarDateRangePicker defaultDate={date} setDate={setDate} />
      </div>
      <div className='space-y-4'>
        <div className='grid gap-4 grid-cols-2 lg:grid-cols-4'>
         <Card>
  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
    <CardTitle className='text-sm font-medium'>
      {t('Total Revenue')}
    </CardTitle>
    <BadgeDollarSign className="text-yellow-400" />
  </CardHeader>
  <CardContent className='space-y-2'>
    <div className='text-2xl font-bold text-yellow-400'>
      <ProductPrice price={data.totalSales} plain />
    </div>
    <div>
      <Link className='text-xs' href='/admin/orders'>
        {t('View revenue')}
      </Link>
    </div>
  </CardContent>
</Card>

<Card>
  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
    <CardTitle className='text-sm font-medium'>{t('Sales')}</CardTitle>
    <CreditCard className="text-yellow-400" />
  </CardHeader>
  <CardContent className='space-y-2'>
    <div className='text-2xl font-bold text-yellow-400'>
      {formatNumber(data.ordersCount)}
    </div>
    <div>
      <Link className='text-xs' href='/admin/orders'>
        {t('View orders')}
      </Link>
    </div>
  </CardContent>
</Card>

<Card>
  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
    <CardTitle className='text-sm font-medium'>{t('Customers')}</CardTitle>
    <Users className="text-yellow-400" />
  </CardHeader>
  <CardContent className='space-y-2'>
    <div className='text-2xl font-bold text-yellow-400'>
      {data.usersCount}
    </div>
    <div>
      <Link className='text-xs' href='/admin/users'>
        {t('View customers')}
      </Link>
    </div>
  </CardContent>
</Card>

<Card>
  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
    <CardTitle className='text-sm font-medium'>{t('Products')}</CardTitle>
    <Barcode className="text-yellow-400" />
  </CardHeader>
  <CardContent className='space-y-2'>
    <div className='text-2xl font-bold text-yellow-400'>
      {data.productsCount}
    </div>
    <div>
      <Link className='text-xs' href='/admin/products'>
        {t('View products')}
      </Link>
    </div>
  </CardContent>
</Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-yellow-400">{t('Sales Overview')}</CardTitle>
            </CardHeader>
            <CardContent >
              <SalesAreaChart data={data.salesChartData} />
            </CardContent>
          </Card>
        </div>

        <div className='grid gap-4 md:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle className="text-yellow-400">{t('How much you’re earning')}</CardTitle>
              <CardDescription>{t('Estimated')} · {t('Last 6 months')}</CardDescription>
            </CardHeader>
            <CardContent>
              <TableChart 
              data={data.monthlySales} labelType='month' />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-yellow-400">{t('Product Performance')}</CardTitle>
              <CardDescription>
                {formatDateTime(date!.from!).dateOnly} to{' '}
                {formatDateTime(date!.to!).dateOnly}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TableChart data={data.topSalesProducts} labelType='product' />
            </CardContent>
          </Card>
        </div>

        <div className='grid gap-4 md:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle className="text-yellow-400">{t('Best-Selling Categories')}</CardTitle>
            </CardHeader>
            <CardContent>
              <SalesCategoryPieChart data={data.topSalesCategories} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-yellow-400">{t('Recent Sales')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                  <TableHead>{t('Buyer')}</TableHead>
                    <TableHead>{t('Date')}</TableHead>
                    <TableHead>{t('Total')}</TableHead>
                    <TableHead>{t('Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.latestOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>
                         {order.user ? order.user.name : t('Deleted User')}
                      </TableCell>
                      <TableCell>
                        {formatDateTime(order.createdAt).dateOnly}
                      </TableCell>
                      <TableCell>
                        <ProductPrice price={order.totalPrice} plain />
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/orders/${order._id}`}>
                          <span className='px-2 text-yellow-400'>{t('Details')}</span>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
      </main>
    </div>
  )
}
