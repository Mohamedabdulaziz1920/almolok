# 13-create-cart-sidebar

## Install Packages

```bash
npx shadcn@latest add scroll-area
```

## Update lib/utils.ts

```ts
// تحسين دالة toSlug لإزالة الشرطات المتكررة في المنتصف
export const toSlug = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]+/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-') // إزالة الشرطات المتكررة
    .replace(/^-+|-+$/g, '')
```

## Create components/shared/cart-sidebar.tsx

```tsx
import useCartStore from '@/hooks/use-cart-store'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import React from 'react'
import { Button, buttonVariants } from '../ui/button'
import { Separator } from '../ui/separator'
import { ScrollArea } from '../ui/scroll-area'
import Image from 'next/image'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { TrashIcon } from 'lucide-react'
import ProductPrice from './product/product-price'
import { FREE_SHIPPING_MIN_PRICE } from '@/lib/constants'

// مكون الشريط الجانبي لعرض سلة التسوق
export default function CartSidebar() {
  const {
    cart: { items, itemsPrice },
    updateItem,
    removeItem,
  } = useCartStore()

  return (
    <div className='w-36 overflow-y-auto'>
      <div className={`fixed border-l h-full`}>
        <div className='p-2 h-full flex flex-col gap-2 justify-start items-center'>
          <div className='text-center space-y-2'>
            <div> Subtotal</div>
            <div className='font-bold'>
              <ProductPrice price={itemsPrice} plain />
            </div>
            {itemsPrice > FREE_SHIPPING_MIN_PRICE && (
              <div className=' text-center text-xs'>
                Your order qualifies for FREE Shipping
              </div>
            )}

            <Link
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'rounded-full hover:no-underline w-full'
              )}
              href='/cart'
            >
              Go to Cart
            </Link>
            <Separator className='mt-3' />
          </div>

          <ScrollArea className='flex-1 w-full'>
            {items.map((item) => (
              <div key={item.clientId}>
                <div className='my-3'>
                  <Link href={`/product/${item.slug}`}>
                    <div className='relative h-24'>
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes='20vw'
                        className='object-contain'
                      />
                    </div>
                  </Link>
                  <div className='text-sm text-center font-bold'>
                    <ProductPrice price={item.price} plain />
                  </div>
                  <div className='flex gap-2 mt-2'>
                    <Select
                      value={item.quantity.toString()}
                      onValueChange={(value) => {
                        updateItem(item, Number(value))
                      }}
                    >
                      <SelectTrigger className='text-xs w-12 ml-1 h-auto py-0'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: item.countInStock }).map(
                          (_, i) => (
                            <SelectItem value={(i + 1).toString()} key={i + 1}>
                              {i + 1}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <Button
                      variant={'outline'}
                      size={'sm'}
                      onClick={() => {
                        removeItem(item)
                      }}
                    >
                      <TrashIcon className='w-4 h-4' />
                    </Button>
                  </div>
                </div>
                <Separator />
              </div>
            ))}
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
```

## Create hooks/use-device-type.ts

```ts
import { useState, useEffect } from 'react'

// هوك للكشف عن نوع الجهاز
function useDeviceType() {
  const [deviceType, setDeviceType] = useState('unknown')

  useEffect(() => {
    const handleResize = () => {
      setDeviceType(window.innerWidth <= 768 ? 'mobile' : 'desktop')
    }

    handleResize() // تعيين القيمة الأولية
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return deviceType
}

export default useDeviceType
```

## Create hooks/use-cart-sidebar.ts

```ts
import { usePathname } from 'next/navigation'
import useDeviceType from './use-device-type'
import useCartStore from './use-cart-store'

// التحقق من المسارات التي لا يجب عرض الشريط الجانبي فيها
const isNotInPaths = (s: string) =>
  !/^\/$|^\/cart$|^\/checkout$|^\/sign-in$|^\/sign-up$|^\/order(\/.*)?$|^\/account(\/.*)?$|^\/admin(\/.*)?$/.test(
    s
  )

// هوك لإدارة حالة الشريط الجانبي لسلة التسوق
function useCartSidebar() {
  const {
    cart: { items },
  } = useCartStore()
  const deviceType = useDeviceType()
  const currentPath = usePathname()

  return (
    items.length > 0 && deviceType === 'desktop' && isNotInPaths(currentPath)
  )
}

export default useCartSidebar
```

## Update components/shared/header/cart-button.tsx

```tsx
import useCartSidebar from '@/hooks/use-cart-sidebar'
const isCartSidebarOpen = useCartSidebar()
{
  isCartSidebarOpen && (
    <div
      className={`absolute top-[20px] right-[-16px] rotate-[-90deg] z-10 w-0 h-0 border-l-[7px] border-r-[7px] border-b-[8px] border-transparent border-b-background`}
    ></div>
  )
}
```

## Create components/shared/client-providers.tsx

```tsx
'use client'
import React from 'react'
import useCartSidebar from '@/hooks/use-cart-sidebar'
import CartSidebar from './cart-sidebar'
import { Toaster } from '../ui/toaster'

// مقدم الخدمات للعميل (لإدارة الحالة على جانب العميل)
export default function ClientProviders({
  children,
}: {
  children: React.ReactNode
}) {
  const isCartSidebarOpen = useCartSidebar()

  return (
    <>
      {isCartSidebarOpen ? (
        <div className='flex min-h-screen'>
          <div className='flex-1 overflow-hidden'>{children}</div>
          <CartSidebar />
        </div>
      ) : (
        <div>{children}</div>
      )}
      <Toaster />
    </>
  )
}
```

## Update app/layout.tsx

```tsx
import ClientProviders from '@/components/shared/client-providers'
// استبدال
{
  children
}
// بـ
;<ClientProviders>{children}</ClientProviders>
```

## Build and Deploy

```bash
npm run build
git add .
git commit -m "Add cart sidebar functionality"
git push
```

## View the changes

go to https://nextjs-amazona.vercel.app

لقد قمت بتنفيذ الشريط الجانبي لسلة التسوق مع:

1. عرض مصغر لعناصر السلة
2. إمكانية تحديث الكمية أو حذف العناصر
3. عرض المجموع الفرعي
4. التحقق من أهلية الشحن المجاني
5. تكامل مع زر السلة في الهيدر
6. تفعيل الشريط فقط على أجهزة الكمبيوتر
7. إخفاء الشريط في صفحات معينة (مثل صفحة الدفع)
8. تحسينات تجربة المستخدم مع تأثيرات مرئية
