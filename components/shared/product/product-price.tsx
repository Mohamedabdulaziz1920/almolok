'use client'
import useSettingStore from '@/hooks/use-setting-store'
import { cn, round2 } from '@/lib/utils'
import { useFormatter, useTranslations } from 'next-intl'

const ProductPrice = ({
  price,
  className,
  listPrice = 0,
  isDeal = false,
  forListing = true,
  plain = false,
  hideDiscount = false, // أضفنا هذه الخاصية الجديدة
}: {
  price: number
  isDeal?: boolean
  listPrice?: number
  className?: string
  forListing?: boolean
  plain?: boolean
  hideDiscount?: boolean // نوع الخاصية
}) => {
  const { getCurrency } = useSettingStore()
  const currency = getCurrency()
  const t = useTranslations()
  const convertedPrice = round2(currency.convertRate * price)
  const convertedListPrice = round2(currency.convertRate * listPrice)

  const format = useFormatter()
  const discountPercent = Math.round(
    100 - (convertedPrice / convertedListPrice) * 100
  )

  return plain ? (
    format.number(convertedPrice, {
      style: 'currency',
      currency: currency.code,
      currencyDisplay: 'narrowSymbol',
    })
  ) : convertedListPrice == 0 ? (
    <div className={cn('text-lg', className)}>
      {format.number(convertedPrice, {
        style: 'currency',
        currency: currency.code,
        currencyDisplay: 'narrowSymbol',
      })}
    </div>
  ) : (
    <div className='space-y-2'>
      {!hideDiscount && ( // نضيف شرط إخفاء الخصم هنا
        <div className='flex justify-center items-center gap-2'>
          {discountPercent > 0 && (
            <div className='inline-block bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-md shadow-sm'>
              {t('Product.Off')} -{discountPercent}%
            </div>
          )}
          {isDeal && (
            <span className='text-red-700 text-xs font-bold'>
              {t('Product.Limited time deal')}
            </span>
          )}
        </div>
      )}

      <div
        className={`flex ${forListing && 'justify-center'} items-center gap-2`}
      >
        <div className={cn('text-lg', className)}>
          {format.number(convertedPrice, {
            style: 'currency',
            currency: currency.code,
            currencyDisplay: 'narrowSymbol',
          })}
        </div>
        <div className='text-muted-foreground text-xs py-2'>
          {t('Product.Was')}:{' '}
          <span className='line-through'>
            {format.number(convertedListPrice, {
              style: 'currency',
              currency: currency.code,
              currencyDisplay: 'narrowSymbol',
            })}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ProductPrice
