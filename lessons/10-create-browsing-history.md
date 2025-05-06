# 10-create-browsing-history

1. npm i zustand

2. hooks/use-browsing-history.ts

```ts
// تعريف مخزن Zustand لتتبع سجل التصفح
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// نوع بيانات سجل التصفح
type BrowsingHistory = {
  products: { id: string; category: string }[]
}

// الحالة الأولية
const initialState: BrowsingHistory = {
  products: [],
}

// إنشاء المخزن مع ميزة الثبات (persist)
export const browsingHistoryStore = create<BrowsingHistory>()(
  persist(() => initialState, {
    name: 'browsingHistoryStore', // اسم التخزين المحلي
  })
)

// هوك مخصص لاستخدام سجل التصفح
export default function useBrowsingHistory() {
  const { products } = browsingHistoryStore()

  return {
    products,
    // دالة لإضافة منتج للسجل
    addItem: (product: { id: string; category: string }) => {
      const index = products.findIndex((p) => p.id === product.id)
      if (index !== -1) products.splice(index, 1) // إزالة التكرارات إن وجدت
      products.unshift(product) // إضافة المنتج في البداية

      if (products.length > 10) products.pop() // الحفاظ على حد أقصى 10 منتجات

      browsingHistoryStore.setState({
        products,
      })
    },
    // دالة لمسح السجل
    clear: () => {
      browsingHistoryStore.setState({
        products: [],
      })
    },
  }
}
```

3. components/shared/browsing-history-list.tsx

```tsx
'use client'
import useBrowsingHistory from '@/hooks/use-browsing-history'
import React, { useEffect } from 'react'
import ProductSlider from './product/product-slider'
import { Separator } from '../ui/separator'
import { cn } from '@/lib/utils'

// مكون لعرض قائمة سجل التصفح
export default function BrowsingHistoryList({
  className,
}: {
  className?: string
}) {
  const { products } = useBrowsingHistory()

  return (
    products.length !== 0 && (
      <div className='bg-background'>
        <Separator className={cn('mb-4', className)} />
        <ProductList
          title={"Related to items that you've viewed"}
          type='related'
        />
        <Separator className='mb-4' />
        <ProductList
          title={'Your browsing history'}
          hideDetails
          type='history'
        />
      </div>
    )
  )
}

// مكون لعرض قائمة المنتجات
function ProductList({
  title,
  type = 'history',
  hideDetails = false,
}: {
  title: string
  type: 'history' | 'related'
  hideDetails?: boolean
}) {
  const { products } = useBrowsingHistory()
  const [data, setData] = React.useState([])

  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch(
        `/api/products/browsing-history?type=${type}&categories=${products
          .map((product) => product.category)
          .join(',')}&ids=${products.map((product) => product.id).join(',')}`
      )
      const data = await res.json()
      setData(data)
    }
    fetchProducts()
  }, [products, type])

  return (
    data.length > 0 && (
      <ProductSlider title={title} products={data} hideDetails={hideDetails} />
    )
  )
}
```

4. app/api/products/browsing-history/route.ts

```ts
import { NextRequest, NextResponse } from 'next/server'
import Product from '@/lib/db/models/product.model'
import { connectToDatabase } from '@/lib/db'

// نقطة نهاية API لجلب سجل التصفح
export const GET = async (request: NextRequest) => {
  const listType = request.nextUrl.searchParams.get('type') || 'history'
  const productIdsParam = request.nextUrl.searchParams.get('ids')
  const categoriesParam = request.nextUrl.searchParams.get('categories')

  if (!productIdsParam || !categoriesParam) {
    return NextResponse.json([])
  }

  const productIds = productIdsParam.split(',')
  const categories = categoriesParam.split(',')

  // تحديد عامل التصفية بناءً على نوع القائمة
  const filter =
    listType === 'history'
      ? {
          _id: { $in: productIds }, // المنتجات التي تمت زيارتها
        }
      : {
          category: { $in: categories }, // منتجات ذات صلة
          _id: { $nin: productIds }, // باستثناء المنتجات التي تمت زيارتها
        }

  await connectToDatabase()
  const products = await Product.find(filter)

  // ترتيب المنتجات حسب ترتيبها في السجل
  if (listType === 'history')
    return NextResponse.json(
      products.sort(
        (a, b) =>
          productIds.indexOf(a._id.toString()) -
          productIds.indexOf(b._id.toString())
      )
    )

  return NextResponse.json(products)
}
```

5. app/(home)/page.tsx

```tsx
// إضافة مكون سجل التصفح للصفحة الرئيسية
<div className='p-4 bg-background'>
  <BrowsingHistoryList />
</div>
```

6. app/(root)/product/[slug]/page.tsx

```tsx
// إضافة مكون سجل التصفح لصفحة المنتج
<section>
  <BrowsingHistoryList className='mt-10' />
</section>
```

7. components/shared/product/add-to-browsing-history.tsx

```tsx
'use client'
import useBrowsingHistory from '@/hooks/use-browsing-history'
import { useEffect } from 'react'

// مكون لإضافة المنتج لسجل التصفح تلقائيًا
export default function AddToBrowsingHistory({
  id,
  category,
}: {
  id: string
  category: string
}) {
  const { addItem } = useBrowsingHistory()

  useEffect(() => {
    addItem({ id, category })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
```

8. commit changes and push to GitHub
9. go to https://nextjs-amazona.vercel.app
