
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'
import AddToCartWithPlayerId from '@/components/shared/product/add-to-cart-with-player-id'
import { CategoryType, ProductType } from '@/types'
import { generateId, round2 } from '@/lib/utils'
import { useTranslations } from 'next-intl'

type Props = {
  initialData: {
    category: CategoryType
    products: ProductType[]
  }
  locale: string
}

export default function CategoryDetailsClient({ initialData }: Props) {
  const { category, products } = initialData
  const t = useTranslations('Categories')

  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(
    products[0] || null
  )
  const [quantity, setQuantity] = useState<number>(1)
  const [playerId] = useState('')

  useEffect(() => {
    setQuantity(1)
  }, [selectedProduct])

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const product = products.find((p) => p._id === e.target.value)
    setSelectedProduct(product || null)
  }

  const totalPrice = selectedProduct
    ? round2(selectedProduct.price * quantity)
    : 0

  const cartItem = selectedProduct
    ? {
        clientId: generateId(),
        product: selectedProduct._id,
        countInStock: selectedProduct.countInStock,
        name: selectedProduct.name,
        slug: selectedProduct.slug,
        category: category.slug,
        price: round2(selectedProduct.price),
        quantity,
        image: selectedProduct.images[0],
        playerId,
      }
    : null

  return (
    <div>
      <section>
        <div className='grid grid-cols-1 md:grid-cols-5'>
          {/* صورة القسم */}
          <div className='col-span-2'>
            <div className='relative w-full h-64 md:h-96 rounded-lg overflow-hidden'>
              <Image
                src={category.image}
                alt={category.name}
                fill
                className='object-contain'
                priority
              />
            </div>
          </div>

          {/* اختيار المنتج فقط */}
          <div className='flex w-full flex-col gap-4 md:p-5 col-span-2'>
            <div className='flex flex-col gap-3'>
              <h1 className='font-bold text-2xl lg:text-3xl'>
                {category.name}
              </h1>

              <Separator />

              <div className='flex flex-col gap-4'>
                {/* اختيار المنتج */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    {t('ChooseProduct')}
                  </label>
                  <select
                    className='w-full p-2 border border-gray-300 rounded-md'
                    onChange={handleProductChange}
                    value={selectedProduct?._id || ''}
                  >
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* السعر الإجمالي */}
                {selectedProduct && (
                  <div className=' p-4 rounded-lg'>
                    <div className='flex justify-between items-center'>
                      <span className='font-medium'>{t('UnitPrice')}:</span>
                      <span className='font-bold'>
                        {selectedProduct.price} $
                      </span>
                    </div>
                    <div className='flex justify-between items-center mt-2'>
                      <span className='font-medium'>{t('Quantity')}:</span>
                      <span className='font-bold'>{quantity}</span>
                    </div>
                    <div className='flex justify-between items-center mt-2 border-t pt-2'>
                      <span className='font-medium'>{t('Total')}:</span>
                      <span className='font-bold text-lg'> {totalPrice} $</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator className='my-2' />
          </div>

          {/* الإضافة إلى السلة مع نموذج اللاعب والكمية */}
          <div>
            <Card>
              <CardContent className='p-4 flex flex-col gap-4'>
                {selectedProduct && (
                  <>
                    <div className='text-xl font-bold'> {totalPrice} $</div>

                    {selectedProduct.countInStock > 0 &&
                      selectedProduct.countInStock <= 3 && (
                        <div className='text-red-600 font-bold'>
                          {t('LowStock', {
                            count: selectedProduct.countInStock,
                          })}
                        </div>
                      )}

                    {selectedProduct.countInStock !== 0 ? (
                      <div className='text-green-600 text-lg'>
                        {t('InStock')}
                      </div>
                    ) : (
                      <div className='text-red-600 text-lg'>
                        {t('OutOfStock')}
                      </div>
                    )}

                    {/* إدخال معرف اللاعب والكمية هنا فقط */}
                    {selectedProduct.countInStock !== 0 && cartItem && (
                      <div className='flex flex-col gap-3'>
                        {/* زر الإضافة */}
                        <AddToCartWithPlayerId item={cartItem} />
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
