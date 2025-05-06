import Link from 'next/link'
import Image from 'next/image'
import { getAllCategories } from '@/lib/actions/category.actions'
import { getSetting } from '@/lib/actions/setting.actions'
import { Card, CardContent } from '@/components/ui/card'
import { HomeCarousel } from '@/components/shared/home/home-carousel'
import { CategoryType } from '@/types' // ✅ إضافة النوع
export default async function HomePage() {
  const { carousels } = await getSetting()
  const categories: CategoryType[] = await getAllCategories() // ✅ تحديد نوع صريح
  return (
    <>
      {/* السلايدر الرئيسي */}
      <HomeCarousel items={carousels} />

      {/* عرض الأقسام فقط */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4'>
        {categories.map((category: CategoryType) => (
          <Link
            key={category.slug}
            href={`/search?category=${category.slug}`}
            className='block'
          >
            <Card className='hover:shadow-lg transition-shadow duration-300'>
              <CardContent className='p-4 flex flex-col items-center text-center space-y-2'>
                <Image
                  src={category.image}
                  alt={category.name}
                  width={200}
                  height={200}
                  className='object-contain rounded-md'
                />
                <h2 className='text-lg font-semibold'>{category.name}</h2>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </>
  )
}
