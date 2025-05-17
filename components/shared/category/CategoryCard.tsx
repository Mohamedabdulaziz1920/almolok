
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

  const handleDelete = () => {
    const confirmed = window.confirm('هل أنت متأكد أنك تريد حذف هذا التصنيف؟')
    if (!confirmed) return

    setLoading(true)

    startTransition(() => {
      deleteCategory(category._id).then((res) => {
        if (res.success) {
          useToast({ description: res.message })
          router.refresh()
        } else {
          useToast({ variant: 'destructive', description: res.message })
        }
        setLoading(false)
      })
    })
  }

  return (
    <Card>
      <CardContent className='p-4 flex flex-col items-center'>
        <Image
          src={category.image}
          alt={category.name}
          width={100}
          height={100}
          className='rounded object-contain'
        />
        <h3 className='mt-4 font-semibold'>{category.name}</h3>
        <div className='mt-2 flex gap-2 w-full justify-center'>
          <Button asChild variant='outline' size='sm'>
            <Link href={`/admin/categories/edit/${category._id}`}>تعديل</Link>
          </Button>
          <Button
            variant='destructive'
            size='sm'
            onClick={handleDelete}
            disabled={isPending || loading}
          >
            {loading ? 'جارٍ الحذف...' : 'حذف'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default CategoryCard
