import { Metadata } from 'next'
import { updateCategory, getCategoryById } from '@/lib/actions/category.actions'
import { CategoryForm } from '../../category-form'
import { notFound } from 'next/navigation'
import { z } from 'zod'
import { CategoryInputSchema } from '@/lib/validator'

export const metadata: Metadata = {
  title: 'تعديل الفئة',
}

type CategoryFormInputs = z.infer<typeof CategoryInputSchema>

export default async function EditCategoryPage({
  params,
}: {
  params: { id: string }
}) {
  const category = await getCategoryById(params.id)

  if (!category) notFound()

  return (
    <main className='max-w-6xl mx-auto p-4 md:p-6 lg:p-8'>
      <div className='mb-8'>
        <h1 className='text-2xl md:text-3xl font-bold'>تعديل الفئة</h1>
        <p className='text-muted-foreground mt-2'>
          قم بتعديل بيانات الفئة الحالية.
        </p>
      </div>

      <div className='bg-background rounded-lg border shadow-sm p-4 md:p-6 lg:p-8'>
        <CategoryForm
          type='Edit'
          initialData={category}
          onSubmit={async (data: CategoryFormInputs) => {
            await updateCategory(params.id, data)
          }}
        />
      </div>
    </main>
  )
}
