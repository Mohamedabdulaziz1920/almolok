import * as React from 'react'
import ProductCard from './product-card'
import { IProduct } from '@/lib/db/models/product.model'

interface ProductSliderProps {
  title?: string
  products: IProduct[]
  hideDetails?: boolean
}

export default function ProductSlider({
  title,
  products,
  hideDetails = false,
}: ProductSliderProps) {
  if (!products || products.length === 0) return null

  return (
    <div className='w-full bg-background'>
      {title && <h2 className='h2-bold mb-5'>{title}</h2>}

      <div
        className={`
          grid 
          gap-4 
          grid-cols-2
          sm:grid-cols-3
          md:grid-cols-4
          lg:grid-cols-5
          xl:grid-cols-5
        `}
      >
        {products.map((product) => (
          <ProductCard
            key={product._id.toString()}
            product={product}
            hideDetails={hideDetails}
            hideAddToCart
          />
        ))}
      </div>
    </div>
  )
}
