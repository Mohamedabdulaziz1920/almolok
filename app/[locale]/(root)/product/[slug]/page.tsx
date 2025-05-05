import { Metadata } from 'next'
import { auth } from '@/auth'
import { Card, CardContent } from '@/components/ui/card'
import {
  getProductBySlug,
  getRelatedProductsByCategory,
} from '@/lib/actions/product.actions'
import ReviewList from './review-list'
import { generateId, round2 } from '@/lib/utils'
import SelectVariant from '@/components/shared/product/select-variant'
import ProductPrice from '@/components/shared/product/product-price'
import ProductGallery from '@/components/shared/product/product-gallery'
import AddToBrowsingHistory from '@/components/shared/product/add-to-browsing-history'
import { Separator } from '@/components/ui/separator'
import BrowsingHistoryList from '@/components/shared/browsing-history-list'
import RatingSummary from '@/components/shared/product/rating-summary'
import ProductSlider from '@/components/shared/product/product-slider'
import { getTranslations } from 'next-intl/server'
import AddToCartWithPlayerId from '@/components/shared/product/add-to-cart-with-player-id'

type PageProps = {
  params: {
    slug: string
    locale?: string // جعلها اختيارية بإضافة ?
  }
  searchParams?: {
    [key: string]: string | string[] | undefined
    page?: string
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const t = await getTranslations()
  const product = await getProductBySlug(params.slug)

  if (!product) {
    return { title: t('Product.Product not found') }
  }

  return {
    title: product.name,
    description: product.description,
  }
}

export default async function ProductDetails({
  params,
  searchParams,
}: {
  params: { slug: string; locale?: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const { page = '1' } = searchParams || {}
  const { slug, locale } = params

  const session = await auth()
  const product = await getProductBySlug(slug)
  const t = await getTranslations({ locale })

  const relatedProducts = await getRelatedProductsByCategory({
    category: product.category,
    productId: product._id,
    page: Number(page),
  })

  return (
    <div>
      <AddToBrowsingHistory id={product._id} category={product.category} />

      <section>
        <div className='grid grid-cols-1 md:grid-cols-5'>
          <div className='col-span-2'>
            <ProductGallery images={product.images} />
          </div>

          <div className='flex w-full flex-col gap-2 md:p-5 col-span-2'>
            <div className='flex flex-col gap-3'>
              <p className='p-medium-16 rounded-full bg-grey-500/10 text-grey-500'>
                {t('Product.Brand')} {product.brand} {product.category}
              </p>
              <h1 className='font-bold text-lg lg:text-xl'>{product.name}</h1>

              <RatingSummary
                avgRating={product.avgRating}
                numReviews={product.numReviews}
                asPopover
                ratingDistribution={product.ratingDistribution}
              />

              <Separator />

              <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
                <div className='flex gap-3'>
                  <ProductPrice
                    price={product.price}
                    listPrice={product.listPrice}
                    isDeal={product.tags.includes('todays-deal')}
                    forListing={false}
                  />
                </div>
              </div>
            </div>

            <div>
              <SelectVariant />
            </div>

            <Separator className='my-2' />

            <div className='flex flex-col gap-2'>
              <p className='p-bold-20 text-grey-600'>
                {t('Product.Description')}:
              </p>
              <p className='p-medium-16 lg:p-regular-18'>
                {product.description}
              </p>
            </div>
          </div>

          <div>
            <Card>
              <CardContent className='p-4 flex flex-col gap-4'>
                <ProductPrice price={product.price} />

                {product.countInStock > 0 && product.countInStock <= 3 && (
                  <div className='text-destructive font-bold'>
                    {t('Product.Only X left in stock - order soon', {
                      count: product.countInStock,
                    })}
                  </div>
                )}

                {product.countInStock !== 0 ? (
                  <div className='text-green-700 text-xl'>
                    {t('Product.In Stock')}
                  </div>
                ) : (
                  <div className='text-destructive text-xl'>
                    {t('Product.Out of Stock')}
                  </div>
                )}

                {product.countInStock !== 0 && (
                  <AddToCartWithPlayerId
                    item={{
                      clientId: generateId(),
                      product: product._id,
                      countInStock: product.countInStock,
                      name: product.name,
                      slug: product.slug,
                      category: product.category,
                      price: round2(product.price),
                      quantity: 1,
                      image: product.images[0],
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className='mt-10'>
        <h2 className='h2-bold mb-2' id='reviews'>
          {t('Product.Customer Reviews')}
        </h2>
        <ReviewList product={product} userId={session?.user.id} />
      </section>

      <section className='mt-10'>
        <ProductSlider
          products={relatedProducts.data}
          title={t('Product.Best Sellers in', { name: product.category })}
        />
      </section>

      <section>
        <BrowsingHistoryList className='mt-10' />
      </section>
    </div>
  )
}
