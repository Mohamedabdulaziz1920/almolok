'use client'

import * as React from 'react'
import Image from 'next/image'
import Autoplay from 'embla-carousel-autoplay'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { ICarousel } from '@/types'

export function HomeCarousel({ items }: { items: ICarousel[] }) {
  const [isClient, setIsClient] = React.useState(false)
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  )
  const t = useTranslations('Home')

  React.useEffect(() => {
    setIsClient(true) // التأكد من أننا في بيئة المتصفح
  }, [])

  if (!isClient) {
    return null // لا نقوم بعرض المكون إذا كنا في الـSSR
  }

  return (
    <Carousel
      dir='ltr'
      plugins={[plugin.current]}
      className='w-full mx-auto'
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {items.map((item) => {
          // تحديد إذا كان هناك محتوى إضافي غير الصورة
          const hasAdditionalContent = item.title || item.buttonCaption

          return (
            <CarouselItem key={item.title || item.image}>
              <Link href={item.url || '#'}>
                <div className='flex aspect-[16/6] items-center justify-center p-6 relative -m-1'>
                  <Image
                    src={item.image}
                    alt={item.title || 'Carousel image'}
                    fill
                    className='object-cover'
                    priority
                  />

                  {hasAdditionalContent && (
                    <div className='absolute w-1/3 left-16 md:left-32 top-1/2 transform -translate-y-1/2'>
                      {item.title && (
                        <h2
                          className={cn(
                            'text-xl md:text-6xl font-bold mb-4 text-primary'
                          )}
                        >
                          {t(`${item.title}`)}
                        </h2>
                      )}
                      {item.buttonCaption && (
                        <Button className='hidden md:block'>
                          {t(`${item.buttonCaption}`)}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            </CarouselItem>
          )
        })}
      </CarouselContent>
      <CarouselPrevious className='left-0 md:left-12' />
      <CarouselNext className='right-0 md:right-12' />
    </Carousel>
  )
}
