// app/[locale]/admin/categories/create/page.tsx
import CategoryForm from '../category-form'

export default function CreateCategoryPage() {
  return (
       <main className="pt-16 px-4 md:px-6">
      <h1 className='text-xl font-bold mb-6'>إنشاء قسم جديد</h1>
     <CategoryForm type='Create' />
    </main>
  )
}
