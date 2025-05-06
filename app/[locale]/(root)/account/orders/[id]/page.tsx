import { notFound } from 'next/navigation'
import React from 'react'
import { getTranslations } from 'next-intl/server'

import { auth } from '@/auth'
import { getOrderById } from '@/lib/actions/order.actions'
import OrderDetailsForm from '@/components/shared/order/order-details-form'
import Link from 'next/link'
import { formatId } from '@/lib/utils'

export async function generateMetadata(props: {
  params: Promise<{ id: string }>
}) {
  const t = await getTranslations('AccountPage')
  const params = await props.params
  const formattedId = formatId(params.id)

  return {
    title: t('OrderDetails', { id: formattedId }),
  }
}

export default async function OrderDetailsPage(props: {
  params: Promise<{
    id: string
  }>
}) {
  const t = await getTranslations('AccountPage')
  const params = await props.params
  const { id } = params

  const order = await getOrderById(id)
  if (!order) notFound()

  const session = await auth()
  const formattedId = formatId(order._id)

  // ✅ تعريف userBalance هنا
  const userBalance = order.user?.balance ?? 0

  return (
    <>
      <div className='flex gap-2'>
        <Link href='/account'>{t('BreadcrumbAccount')}</Link>
        <span>›</span>
        <Link href='/account/orders'>{t('BreadcrumbOrders')}</Link>
        <span>›</span>
        <span>{t('BreadcrumbOrderDetails', { id: formattedId })}</span>
      </div>

      <h1 className='h1-bold py-4'>{t('OrderDetails', { id: formattedId })}</h1>
      <OrderDetailsForm
        order={order}
        isAdmin={session?.user?.role === 'Admin' || false}
        userBalance={userBalance}
      />
    </>
  )
}
