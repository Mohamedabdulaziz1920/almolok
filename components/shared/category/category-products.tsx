// components/shared/category/category-products.tsx
'use client'

import ProductCard from '../product/product-card'
import { IProduct } from '@/types'

type Props = {
  title: string
  products: IProduct[]
}

export default function CategoryProducts({ title, products }: Props) {
  return (
    <section className='my-8'>
      <h2 className='text-xl font-bold mb-4'>{title}</h2>
      {products.length > 0 ? (
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <p>لا توجد منتجات في هذه الفئة حالياً.</p>
      )}
    </section>
  )
}
