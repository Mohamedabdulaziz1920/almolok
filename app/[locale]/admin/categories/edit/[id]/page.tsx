import { notFound } from 'next/navigation'
import { getCategoryById } from '@/lib/actions/category.actions'
import CategoryForm, { CategoryFormType } from '../../category-form'

type Props = {
  params: { id: string }
}

export default async function EditCategoryPage({ params }: Props) {
  const category = await getCategoryById(params.id)
  if (!category) notFound()

  return (
    <main className='container mx-auto px-4 py-6'>
      <h1 className='text-xl font-bold mb-6'>تعديل القسم</h1>
      <CategoryForm
        type={CategoryFormType.Update}
        initialData={{
          name: category.name,
          slug: category.slug,
          image: category.image,
        }}
        categoryId={category._id}
      />
    </main>
  )
}
