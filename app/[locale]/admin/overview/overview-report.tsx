'use client'

import { BadgeDollarSign, Barcode, CreditCard, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
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
import { calculatePastDate, formatDateTime, formatNumber } from '@/lib/utils'
import SalesCategoryPieChart from './sales-category-pie-chart'
import React, { useEffect, useState, useTransition } from 'react'
import { DateRange } from 'react-day-picker'
import { getOrderSummary } from '@/lib/actions/order.actions'
import SalesAreaChart from './sales-area-chart'
import { CalendarDateRangePicker } from './date-range-picker'
import { IOrderList } from '@/types'
import ProductPrice from '@/components/shared/product/product-price'
import { Skeleton } from '@/components/ui/skeleton'
import TableChart from './table-chart'

interface DashboardData {
  totalSales: number
  ordersCount: number
  usersCount: number
  productsCount: number
  monthlySales: Array<{ _id: number; total: number }>
  topSalesProducts: Array<{ _id: string; total: number }>
  topSalesCategories: Array<{ _id: string; total: number }>
  latestOrders: IOrderList[]
  salesChartData: Array<{ _id: string; total: number }>
}

export default function OverviewReport() {
  const t = useTranslations('Admin')
  const [date, setDate] = useState<DateRange | undefined>({
    from: calculatePastDate(30),
    to: new Date(),
  })
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (date) {
      startTransition(async () => {
        try {
          const result = await getOrderSummary(date)
          setData(result)
          setError(null)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load data')
          console.error('Error fetching order summary:', err)
        }
      })
    }
  }, [date])

  const renderLoadingSkeleton = () => (
    <div className='space-y-4'>
      <div>
        <h1 className='h1-bold'>{t('Dashboard')}</h1>
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

  const renderErrorState = () => (
    <div className='space-y-4'>
      <div className='flex items-center justify-between mb-2'>
        <h1 className='h1-bold'>{t('Dashboard')}</h1>
        <CalendarDateRangePicker defaultDate={date} setDate={setDate} />
      </div>
      <div className='p-4 text-center text-destructive'>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className='mt-2 text-sm underline'
        >
          {t('Try again')}
        </button>
      </div>
    </div>
  )

  if (isPending || !data) return renderLoadingSkeleton()
  if (error) return renderErrorState()

  return (
    <div>
      <div className='flex items-center justify-between mb-2'>
        <h1 className='h1-bold'>{t('Dashboard')}</h1>
        <CalendarDateRangePicker defaultDate={date} setDate={setDate} />
      </div>
      
      <div className='space-y-4'>
        {/* Summary Cards */}
        <div className='grid gap-4 grid-cols-2 lg:grid-cols-4'>
          <SummaryCard
            title={t('Total Revenue')}
            value={<ProductPrice price={data.totalSales} plain />}
            icon={<BadgeDollarSign />}
            link='/admin/orders'
            linkText={t('View revenue')}
          />
          <SummaryCard
            title={t('Sales')}
            value={formatNumber(data.ordersCount)}
            icon={<CreditCard />}
            link='/admin/orders'
            linkText={t('View orders')}
          />
          <SummaryCard
            title={t('Customers')}
            value={data.usersCount}
            icon={<Users />}
            link='/admin/users'
            linkText={t('View customers')}
          />
          <SummaryCard
            title={t('Products')}
            value={data.productsCount}
            icon={<Barcode />}
            link='/admin/products'
            linkText={t('View products')}
          />
        </div>

        {/* Sales Overview Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t('Sales Overview')}</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesAreaChart 
              data={data.salesChartData || []} 
              fromDate={date?.from} 
              toDate={date?.to} 
            />
          </CardContent>
        </Card>

        {/* Earnings and Product Performance */}
        <div className='grid gap-4 md:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle>{t('How much you’re earning')}</CardTitle>
              <CardDescription>
                {t('Estimated')} · {t('Last 6 months')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TableChart 
                data={data.monthlySales || []} 
                labelType='month' 
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t('Product Performance')}</CardTitle>
              <CardDescription>
                {date?.from && formatDateTime(date.from).dateOnly} to{' '}
                {date?.to && formatDateTime(date.to).dateOnly}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TableChart 
                data={data.topSalesProducts || []} 
                labelType='product' 
              />
            </CardContent>
          </Card>
        </div>

        {/* Categories and Recent Sales */}
        <div className='grid gap-4 md:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle>{t('Best-Selling Categories')}</CardTitle>
            </CardHeader>
            <CardContent>
              <SalesCategoryPieChart 
                data={data.topSalesCategories || []} 
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t('Recent Sales')}</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentSalesTable orders={data.latestOrders} t={t} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// مكونات مساعدة
interface SummaryCardProps {
  title: string
  value: React.ReactNode
  icon: React.ReactNode
  link: string
  linkText: string
}

const SummaryCard = ({ title, value, icon, link, linkText }: SummaryCardProps) => (
  <Card>
    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
      <CardTitle className='text-sm font-medium'>{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent className='space-y-2'>
      <div className='text-2xl font-bold'>{value}</div>
      <div>
        <Link className='text-xs' href={link}>
          {linkText}
        </Link>
      </div>
    </CardContent>
  </Card>
)

interface RecentSalesTableProps {
  orders: IOrderList[]
  t: (key: string) => string
}


const RecentSalesTable = ({ orders, t }: RecentSalesTableProps) => (
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
      {orders?.map((order) => (
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
              <span className='px-2'>{t('Details')}</span>
            </Link>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
)