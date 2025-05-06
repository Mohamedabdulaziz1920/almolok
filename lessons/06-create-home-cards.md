# 06-create-home-cards

1. npx shadcn@latest add card

2. components/shared/home/home-card.tsx

```tsx
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

// تعريف نوع البيانات للبطاقة يحتوي على عنوان، رابط، وقائمة من العناصر
type CardItem = {
  title: string
  link: { text: string; href: string }
  items: {
    name: string
    items?: string[]
    image: string
    href: string
  }[]
}

// مكون رئيسي لعرض مجموعة من البطاقات
export function HomeCard({ cards }: { cards: CardItem[] }) {
  return (
    // حاوية رئيسية للبطاقات بتصميم متجاوب يعرض 1-2-4 بطاقات حسب حجم الشاشة
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 md:gap-4'>
      {cards.map((card) => (
        // بطاقة فردية بدون حواف مستديرة
        <Card key={card.title} className='rounded-none flex flex-col'>
          <CardContent className='p-4 flex-1'>
            <h3 className='text-xl font-bold mb-4'>{card.title}</h3>
            // شبكة داخلية لعرض العناصر في صفين
            <div className='grid grid-cols-2 gap-4'>
              {card.items.map((item) => (
                // رابط لكل عنصر في البطاقة
                <Link
                  key={item.name}
                  href={item.href}
                  className='flex flex-col'
                >
                  // عرض صورة العنصر
                  <Image
                    src={item.image}
                    alt={item.name}
                    className='aspect-square object-scale-down max-w-full h-auto mx-auto'
                    height={120}
                    width={120}
                  />
                  // نص اسم العنصر
                  <p className='text-center text-sm whitespace-nowrap overflow-hidden text-ellipsis'>
                    {item.name}
                  </p>
                </Link>
              ))}
            </div>
          </CardContent>
          // تذييل البطاقة إذا كان هناك رابط
          {card.link && (
            <CardFooter>
              <Link href={card.link.href} className='mt-4 block'>
                {card.link.text}
              </Link>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  )
}
```

3. lib/actions/product.actions.ts

```ts
// دوال تعمل على جانب الخادم فقط
'use server'

import { connectToDatabase } from '@/lib/db'
import Product from '@/lib/db/models/product.model'

// دالة لجلب جميع الفئات الفريدة للمنتجات المنشورة
export async function getAllCategories() {
  await connectToDatabase()
  const categories = await Product.find({ isPublished: true }).distinct(
    'category'
  )
  return categories
}

// دالة لجلب المنتجات حسب الوسم مع تحديد حد أقصى
export async function getProductsForCard({
  tag,
  limit = 4,
}: {
  tag: string
  limit?: number
}) {
  await connectToDatabase()
  // استعلام MongoDB للحصول على المنتجات المنشورة ذات الوسم المحدد
  const products = await Product.find(
    { tags: { $in: [tag] }, isPublished: true },
    {
      name: 1, // اسم المنتج فقط
      href: { $concat: ['/product/', '$slug'] }, // إنشاء رابط المنتج
      image: { $arrayElemAt: ['$images', 0] }, // أخذ أول صورة من المصفوفة
    }
  )
    .sort({ createdAt: 'desc' }) // ترتيب حسب الأحدث
    .limit(limit) // تحديد العدد الأقصى
  return JSON.parse(JSON.stringify(products)) as {
    name: string
    href: string
    image: string
  }[]
}
```

4. app/(home)/page.tsx

```tsx
import { HomeCard } from '@/components/shared/home/home-card'
import { HomeCarousel } from '@/components/shared/home/home-carousel'
import { Card, CardContent } from '@/components/ui/card'

// الصفحة الرئيسية كمكون غير عميل
export default async function HomePage() {
  // جلب البيانات من قاعدة البيانات
  const categories = (await getAllCategories()).slice(0, 4)
  const newArrivals = await getProductsForCard({
    tag: 'new-arrival',
    limit: 4,
  })
  const featureds = await getProductsForCard({
    tag: 'featured',
    limit: 4,
  })
  const bestSellers = await getProductsForCard({
    tag: 'best-seller',
    limit: 4,
  })

  // تحضير بيانات البطاقات الأربع
  const cards = [
    {
      title: 'Categories to explore',
      link: {
        text: 'See More',
        href: '/search',
      },
      items: categories.map((category) => ({
        name: category,
        image: `/images/${toSlug(category)}.jpg`,
        href: `/search?category=${category}`,
      })),
    },
    {
      title: 'Explore New Arrivals',
      items: newArrivals,
      link: {
        text: 'View All',
        href: '/search?tag=new-arrival',
      },
    },
    {
      title: 'Discover Best Sellers',
      items: bestSellers,
      link: {
        text: 'View All',
        href: '/search?tag=new-arrival',
      },
    },
    {
      title: 'Featured Products',
      items: featureds,
      link: {
        text: 'Shop Now',
        href: '/search?tag=new-arrival',
      },
    },
  ]

  // عرض مكون الصفحة الرئيسية
  return (
    <>
      <HomeCarousel items={carousels} />
      <div className='md:p-4 md:space-y-4 bg-border'>
        <HomeCard cards={cards} />
      </div>
    </>
  )
}
```

5. commit changes and push to GitHub

6. go to https://nextjs-amazona.vercel.app

لقد قمت بإضافة التعليقات التوضيحية فقط دون أي تعديل على الكود الأصلي، مع الحفاظ على جميع المسافات والفواصل والتركيبة تمامًا كما هي في الكود الذي أرسلته. التعليقات مكتوبة باللغة العربية وتشرح وظيفة كل جزء من الكود دون تغيير أي شيء في الكود نفسه.
