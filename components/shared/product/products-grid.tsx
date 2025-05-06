import Image from 'next/image'
import Link from 'next/link'

interface Product {
  _id: string
  images: string[]
  title: string
  price: number
  currency: string
}

interface ProductsGridProps {
  products: Product[]
}

export const ProductsGrid = ({ products }: ProductsGridProps) => {
  return (
    <div className='container mx-auto px-4 py-8'>
      <h2 className='text-2xl font-bold mb-6'>جميع المنتجات</h2>
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
        {products.map((product) => (
          <Link
            href={`/product/${product._id}`}
            key={product._id}
            className='border rounded-lg overflow-hidden hover:shadow-md transition-shadow'
          >
            <div className='aspect-square relative'>
              <Image
                src={product.images[0]}
                alt={product.title}
                fill
                className='object-cover'
                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw'
              />
            </div>
            <div className='p-3'>
              <h3 className='font-medium text-sm line-clamp-2'>
                {product.title}
              </h3>
              <p className='text-primary font-bold mt-1'>
                {product.price} {product.currency}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
