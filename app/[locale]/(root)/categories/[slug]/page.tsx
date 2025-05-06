// app/[locale]/categories/[slug]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { CategoryType, ProductType } from '@/types'
import Image from 'next/image'
import axios from 'axios'

export default function CategoryProductsPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [products, setProducts] = useState<ProductType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // 1. جلب بيانات القسم للحصول على الـ ID من خلال الـ slug
        const categoryRes = await axios.get(`/api/categories?slug=${slug}`)
        const category: CategoryType = categoryRes.data[0]

        if (!category || !category._id) {
          setProducts([])
          setLoading(false)
          return
        }

        // 2. جلب المنتجات المرتبطة بـ category._id
        const productsRes = await axios.get(
          `/api/categories/${category._id}/products`
        )
        setProducts(productsRes.data)
      } catch (error) {
        console.error('Failed to fetch category products', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchProducts()
    }
  }, [slug])

  if (loading) return <div className='p-4 text-center'>جاري التحميل...</div>

  return (
    <div className='p-4'>
      <h1 className='text-2xl font-bold mb-4'>منتجات هذا القسم</h1>
      {products.length === 0 ? (
        <p>لا توجد منتجات في هذا القسم.</p>
      ) : (
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
          {products.map((product) => (
            <div key={product._id} className='border p-2 rounded shadow'>
              <Image
                src={product.image}
                alt={product.name}
                width={300}
                height={200}
                className='rounded'
              />
              <h2 className='mt-2 font-medium'>{product.name}</h2>
              <p className='text-green-600'>{product.price} $</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
