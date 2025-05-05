# 07-create-todays-deals-slider

1. global.css

```css
/* فئة لعنوان رئيسي بخط عريض */
.h2-bold {
  @apply font-bold text-lg lg:text-xl;
}
```

2. lib/actions/product.actions.ts

```ts
// استيراد النموذج المطلوب
import Product, { IProduct } from '@/lib/db/models/product.model'

// دالة للحصول على المنتجات حسب الوسم مع تحديد حد أقصى
export async function getProductsByTag({
  tag,
  limit = 10,
}: {
  tag: string
  limit?: number
}) {
  // الاتصال بقاعدة البيانات
  await connectToDatabase()

  // البحث عن المنتجات التي تحتوي على الوسم المطلوب ومنشورة
  const products = await Product.find({
    tags: { $in: [tag] },
    isPublished: true,
  })
    .sort({ createdAt: 'desc' }) // ترتيب حسب الأحدث
    .limit(limit) // تحديد الحد الأقصى

  // تحويل النتيجة إلى JSON وإرجاعها كنوع IProduct[]
  return JSON.parse(JSON.stringify(products)) as IProduct[]
}
```

3. lib/utils.ts

```ts
// تهيئة منسق العملات
const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency',
  minimumFractionDigits: 2,
})

// دالة لتنسيق العملة
export function formatCurrency(amount: number) {
  return CURRENCY_FORMATTER.format(amount)
}

// تهيئة منسق الأرقام
const NUMBER_FORMATTER = new Intl.NumberFormat('en-US')

// دالة لتنسيق الأرقام
export function formatNumber(number: number) {
  return NUMBER_FORMATTER.format(number)
}
```

4. components/shared/product/rating.tsx

```tsx
// مكون تقييم النجوم مثل أمازون
import React from 'react'
import { Star } from 'lucide-react'

// تعريف مكون التقييم
export default function Rating({
  rating = 0,
  size = 6,
}: {
  rating: number
  size?: number
}) {
  // حساب عدد النجوم الكاملة والجزئية والفارغة
  const fullStars = Math.floor(rating)
  const partialStar = rating % 1
  const emptyStars = 5 - Math.ceil(rating)

  return (
    <div
      className='flex items-center'
      aria-label={`Rating: ${rating} out of 5 stars`}
    >
      {/* عرض النجوم الكاملة */}
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          className={`w-${size} h-${size} fill-primary text-primary`}
        />
      ))}

      {/* عرض النجم الجزئي إذا كان موجودًا */}
      {partialStar > 0 && (
        <div className='relative'>
          <Star className={`w-${size} h-${size} text-primary`} />
          <div
            className='absolute top-0 left-0 overflow-hidden'
            style={{ width: `${partialStar * 100}%` }}
          >
            <Star className='w-6 h-6 fill-primary text-primary' />
          </div>
        </div>
      )}

      {/* عرض النجوم الفارغة */}
      {[...Array(emptyStars)].map((_, i) => (
        <Star
          key={`empty-${i}`}
          className={`w-${size} h-${size}  text-primary`}
        />
      ))}
    </div>
  )
}
```

5. components/shared/product/product-price.tsx

```tsx
// مكون لعرض سعر المنتج مع الخصومات إذا وجدت
'use client'
import { cn, formatCurrency } from '@/lib/utils'

const ProductPrice = ({
  price,
  className,
  listPrice = 0,
  isDeal = false,
  forListing = true,
  plain = false,
}: {
  price: number
  isDeal?: boolean
  listPrice?: number
  className?: string
  forListing?: boolean
  plain?: boolean
}) => {
  // حساب نسبة الخصم
  const discountPercent = Math.round(100 - (price / listPrice) * 100)
  const stringValue = price.toString()
  const [intValue, floatValue] = stringValue.includes('.')
    ? stringValue.split('.')
    : [stringValue, '']

  return plain ? (
    // عرض السعر بشكل عادي
    formatCurrency(price)
  ) : listPrice == 0 ? (
    // عرض السعر بدون خصم
    <div className={cn('text-3xl', className)}>
      <span className='text-xs align-super'>$</span>
      {intValue}
      <span className='text-xs align-super'>{floatValue}</span>
    </div>
  ) : isDeal ? (
    // عرض السعر مع عرض خاص
    <div className='space-y-2'>
      <div className='flex justify-center items-center gap-2'>
        <span className='bg-red-700 rounded-sm p-1 text-white text-sm font-semibold'>
          {discountPercent}% Off
        </span>
        <span className='text-red-700 text-xs font-bold'>
          Limited time deal
        </span>
      </div>
      <div
        className={`flex ${forListing && 'justify-center'} items-center gap-2`}
      >
        <div className={cn('text-3xl', className)}>
          <span className='text-xs align-super'>$</span>
          {intValue}
          <span className='text-xs align-super'>{floatValue}</span>
        </div>
        <div className='text-muted-foreground text-xs py-2'>
          Was: <span className='line-through'>{formatCurrency(listPrice)}</span>
        </div>
      </div>
    </div>
  ) : (
    // عرض السعر مع خصم عادي
    <div className=''>
      <div className='flex justify-center gap-3'>
        <div className='text-3xl text-orange-700'>-{discountPercent}%</div>
        <div className={cn('text-3xl', className)}>
          <span className='text-xs align-super'>$</span>
          {intValue}
          <span className='text-xs align-super'>{floatValue}</span>
        </div>
      </div>
      <div className='text-muted-foreground text-xs py-2'>
        List price:{' '}
        <span className='line-through'>{formatCurrency(listPrice)}</span>
      </div>
    </div>
  )
}

export default ProductPrice
```

6. components/shared/product/image-hover.tsx

```tsx
// مكون لعرض صورة المنتج مع تأثير التغيير عند التحويم
'use client'
import Image from 'next/image'
import { useState } from 'react'

const ImageHover = ({
  src,
  hoverSrc,
  alt,
}: {
  src: string
  hoverSrc: string
  alt: string
}) => {
  const [isHovered, setIsHovered] = useState(false)
  let hoverTimeout: any
  const handleMouseEnter = () => {
    hoverTimeout = setTimeout(() => setIsHovered(true), 1000) // تأخير ثانية واحدة
  }

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout)
    setIsHovered(false)
  }

  return (
    <div
      className='relative h-52'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* الصورة الأساسية */}
      <Image
        src={src}
        alt={alt}
        fill
        sizes='80vw'
        className={`object-contain transition-opacity duration-500 ${
          isHovered ? 'opacity-0' : 'opacity-100'
        }`}
      />
      {/* الصورة عند التحويم */}
      <Image
        src={hoverSrc}
        alt={alt}
        fill
        sizes='80vw'
        className={`absolute inset-0 object-contain transition-opacity duration-500 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  )
}

export default ImageHover
```

7. components/shared/product/product-card.tsx

```tsx
// مكون بطاقة المنتج
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { IProduct } from '@/lib/db/models/product.model'

import Rating from './rating'
import { formatNumber } from '@/lib/utils'
import ProductPrice from './product-price'

const ProductCard = ({
  product,
  hideBorder = false,
  hideDetails = false,
}: {
  product: IProduct
  hideDetails?: boolean
  hideBorder?: boolean
  hideAddToCart?: boolean
}) => {
  // مكون عرض صورة المنتج
  const ProductImage = () => (
    <Link href={`/product/${product.slug}`}>
      <div className='relative h-52'>
        {product.images.length > 1 ? (
          <ImageHover
            src={product.images[0]}
            hoverSrc={product.images[1]}
            alt={product.name}
          />
        ) : (
          <div className='relative h-52'>
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes='80vw'
              className='object-contain'
            />
          </div>
        )}
      </div>
    </Link>
  )

  // مكون عرض تفاصيل المنتج
  const ProductDetails = () => (
    <div className='flex-1 space-y-2'>
      <p className='font-bold'>{product.brand}</p>
      <Link
        href={`/product/${product.slug}`}
        className='overflow-hidden text-ellipsis'
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {product.name}
      </Link>
      <div className='flex gap-2 justify-center'>
        <Rating rating={product.avgRating} />
        <span>({formatNumber(product.numReviews)})</span>
      </div>

      <ProductPrice
        isDeal={product.tags.includes('todays-deal')}
        price={product.price}
        listPrice={product.listPrice}
        forListing
      />
    </div>
  )

  return hideBorder ? (
    // عرض بدون حدود
    <div className='flex flex-col'>
      <ProductImage />
      {!hideDetails && (
        <>
          <div className='p-3 flex-1 text-center'>
            <ProductDetails />
          </div>
        </>
      )}
    </div>
  ) : (
    // عرض مع حدود
    <Card className='flex flex-col  '>
      <CardHeader className='p-3'>
        <ProductImage />
      </CardHeader>
      {!hideDetails && (
        <>
          <CardContent className='p-3 flex-1  text-center'>
            <ProductDetails />
          </CardContent>
        </>
      )}
    </Card>
  )
}

export default ProductCard
```

8. components/shared/product/product-slider.tsx

```tsx
// مكون سلايدر لعرض مجموعة من المنتجات
'use client'

import * as React from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import ProductCard from './product-card'
import { IProduct } from '@/lib/db/models/product.model'

export default function ProductSlider({
  title,
  products,
  hideDetails = false,
}: {
  title?: string
  products: IProduct[]
  hideDetails?: boolean
}) {
  return (
    <div className='w-full bg-background'>
      <h2 className='h2-bold mb-5'>{title}</h2>
      <Carousel
        opts={{
          align: 'start',
        }}
        className='w-full'
      >
        <CarouselContent>
          {products.map((product) => (
            <CarouselItem
              key={product.slug}
              className={
                hideDetails
                  ? 'md:basis-1/4 lg:basis-1/6'
                  : 'md:basis-1/3 lg:basis-1/5'
              }
            >
              <ProductCard
                hideDetails={hideDetails}
                hideAddToCart
                hideBorder
                product={product}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className='left-0' />
        <CarouselNext className='right-0' />
      </Carousel>
    </div>
  )
}
```

9. app/(home)/page.tsx

```tsx
// الصفحة الرئيسية مع سلايدر العروض اليومية
import ProductSlider from '@/components/shared/product/product-slider'
import { Card, CardContent } from '@/components/ui/card'
import {
  getAllCategories,
  getProductsByTag,
  getProductsForCard,
} from '@/lib/actions/product.actions'

export default async function HomePage() {
  // جلب العروض اليومية
  const todaysDeals = await getProductsByTag({ tag: 'todays-deal' })

  return (
    <>
      <HomeCarousel items={data.carousels} />
      <div className='md:p-4 md:space-y-4 bg-border'>
        <HomeCard cards={cards} />
        <Card className='w-full rounded-none'>
          <CardContent className='p-4 items-center gap-3'>
            <ProductSlider title={"Today's Deals"} products={todaysDeals} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
```

10. commit changes and push to GitHub
11. go to https://nextjs-amazona.vercel.app
