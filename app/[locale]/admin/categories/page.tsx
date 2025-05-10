// app/[locale]/admin/categories/page.tsx
import { Metadata } from 'next'
import { CategoryForm } from './category-form'

// عنوان الميتاداتا (اختياري لتحسين SEO)
export const metadata: Metadata = {
  title: 'إدارة الفئات',
  description: 'صفحة إدارة وإنشاء الفئات في لوحة التحكم.',
}

export default function CategoriesPage() {
  return (
    <div className='max-w-xl mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-6 text-center'>إضافة فئة جديدة</h1>
      <CategoryForm type='Create' />
    </div>
  )
}
