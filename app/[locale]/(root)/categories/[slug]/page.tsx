// app/[locale]/(root)/categories/[slug]/page.tsx

import { Metadata } from 'next'
import { getCategoryWithProducts } from '@/lib/actions/category.actions'
import CategoryDetailsClient from './CategoryDetailsClient'

type PageProps = {
  params: {
    slug: string
    locale: string
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const decodedSlug = decodeURIComponent(params.slug)
  const data = await getCategoryWithProducts(decodedSlug)

  return {
    title: data?.category.name || 'Category',
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const decodedSlug = decodeURIComponent(params.slug)
  const data = await getCategoryWithProducts(decodedSlug)
  if (!data) {
    return <div>Category not found</div>
  }

  return <CategoryDetailsClient initialData={data} locale={params.locale} />
}
