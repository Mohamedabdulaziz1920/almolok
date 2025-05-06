'use client'

import Image from 'next/image'
import Link from 'next/link'

import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { IOrder } from '@/lib/db/models/order.model'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import ProductPrice from '../product/product-price'
import ActionButton from '../action-button'
import { updateOrderToPaid } from '@/lib/actions/order.actions'
import { useTranslations } from 'next-intl'

export default function OrderDetailsForm({
  order,
  isAdmin,
  userBalance,
}: {
  order: IOrder
  isAdmin: boolean
  userBalance: number
}) {
  const t = useTranslations('OrderDetails')
  const { items, itemsPrice, taxPrice, totalPrice, isPaid } = order

  const canPayWithBalance = userBalance >= totalPrice

  return (
    <div className='grid md:grid-cols-3 md:gap-5'>
      <div className='overflow-x-auto md:col-span-2 space-y-4'>
        <Card>
          <CardContent className='p-4 gap-4'>
            <h2 className='text-xl pb-4'>{t('orderItems')}</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('item')}</TableHead>
                  <TableHead>{t('playerId')}</TableHead>
                  <TableHead>{t('quantity')}</TableHead>
                  <TableHead>{t('price')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.slug}>
                    <TableCell>
                      <Link
                        href={`/product/${item.slug}`}
                        className='flex items-center'
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={50}
                          height={50}
                        />
                        <div className='px-2 flex flex-col'>
                          <span>{item.name}</span>
                          {item.playerId && (
                            <span className='text-xs text-muted-foreground'>
                              {t('playerId')}: {item.playerId}
                            </span>
                          )}
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className='px-2'>{item.quantity}</span>
                    </TableCell>
                    <TableCell className='text-right'>
                      <ProductPrice price={item.price} plain />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardContent className='p-4 space-y-4 gap-4'>
            <h2 className='text-xl pb-4'>{t('orderSummary')}</h2>
            <div className='flex justify-between'>
              <div>{t('items')}</div>
              <div>
                <ProductPrice price={itemsPrice} plain />
              </div>
            </div>
            <div className='flex justify-between'>
              <div>{t('tax')}</div>
              <div>
                <ProductPrice price={taxPrice} plain />
              </div>
            </div>
            <div className='flex justify-between'>
              <div>{t('total')}</div>
              <div>
                <ProductPrice price={totalPrice} plain />
              </div>
            </div>

            {!isPaid && canPayWithBalance && (
              <Link
                className={cn(buttonVariants(), 'w-full')}
                href={`/checkout/${order._id}?paymentMethod=balance`}
              >
                {t('payWithBalance')}
              </Link>
            )}

            {!isPaid && !canPayWithBalance && (
              <div className='text-red-500'>{t('insufficientBalance')}</div>
            )}

            {isAdmin && !isPaid && (
              <ActionButton
                caption={t('markAsPaid')}
                action={() => updateOrderToPaid(order._id)}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
