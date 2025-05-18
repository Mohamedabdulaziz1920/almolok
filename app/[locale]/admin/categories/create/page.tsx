// app/[locale]/admin/categories/create/page.tsx
import CategoryForm from '../category-form'

export default function CreateCategoryPage() {
  return (
    <main className='container mx-auto px-4 py-6'>
      <h1 className='text-xl font-bold mb-6'>إنشاء قسم جديد</h1>
     <CategoryForm type='Create' />
    </main>
  )
}
