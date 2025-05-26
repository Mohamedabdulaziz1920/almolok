'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTransition, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { deleteCategory } from '@/lib/actions/category.actions'

type Props = {
  category: {
    _id: string
    name: string
    image: string
  }
}

const CategoryCard = ({ category }: Props) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    const confirmed = window.confirm('هل أنت متأكد أنك تريد حذف هذا التصنيف؟')
    if (!confirmed) return

    setLoading(true)

    try {
      startTransition(async () => {
        const result = await deleteCategory(category._id)
        
        if (result?.success) {
          toast({
            title: 'نجاح',
            description: result.message || 'تم حذف التصنيف بنجاح',
            variant: 'default'
          })
          router.refresh()
        } else {
          toast({
            title: 'خطأ',
            description: result?.message || 'حدث خطأ غير متوقع أثناء الحذف',
            variant: 'destructive'
          })
        }
      })
    } catch (error) {
      console.error('Error in handleDelete:', error)
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في الاتصال بالخادم',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className='p-4 flex flex-col items-center'>
        <div className='relative w-24 h-24'>
          <Image
            src={category.image}
            alt={category.name}
            fill
            className='rounded object-cover'
            priority
          />
        </div>
        <h3 className='mt-4 font-semibold text-center'>{category.name}</h3>
        <div className='mt-4 flex gap-2 w-full justify-center'>
          <Button asChild variant='outline' size='sm' className='flex-1'>
            <Link href={`/admin/categories/edit/${category._id}`}>تعديل</Link>
          </Button>
          <Button
            variant='destructive'
            size='sm'
            className='flex-1'
            onClick={handleDelete}
            disabled={isPending || loading}
          >
            {loading ? (
              <span className='flex items-center gap-1'>
                <span className='animate-spin'>↻</span>
                جارٍ الحذف...
              </span>
            ) : (
              'حذف'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default CategoryCard
