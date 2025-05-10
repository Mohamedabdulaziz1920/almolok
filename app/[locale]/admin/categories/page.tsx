import Link from 'next/link'
import { getCategories } from '@/lib/actions/category.actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import { Pencil } from 'lucide-react'

const CategoriesListPage = async () => {
  // الحصول على الفئات
  const response = await getCategories()

  // التحقق من نجاح الاستجابة وضمان أن data هي مصفوفة
  const categories = response?.data ?? []

  return (
    <main className='max-w-6xl mx-auto p-4 md:p-6 lg:p-8'>
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>الفئات</h1>
        <Link href='/admin/categories/create'>
          <Button>إنشاء فئة جديدة</Button>
        </Link>
      </div>

      {/* الفئات */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
        {categories.length > 0 ? (
          categories.map((category) => (
            <Card key={category._id}>
              <CardContent className='p-4 flex flex-col items-center'>
                <Image
                  src={category.image}
                  alt={category.name}
                  width={100}
                  height={100}
                  className='rounded object-contain'
                />
                <h3 className='mt-4 font-semibold'>{category.name}</h3>
                <Link
                  href={`/admin/categories/edit/${category._id}`}
                  className='mt-2 inline-flex items-center text-sm text-blue-600 hover:underline'
                >
                  <Pencil className='w-4 h-4 mr-1' />
                  تعديل
                </Link>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className='text-center col-span-full'>لا توجد فئات حالياً</p>
        )}
      </div>
    </main>
  )
}

export default CategoriesListPage
