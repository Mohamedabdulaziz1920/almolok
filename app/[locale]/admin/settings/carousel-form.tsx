import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import { UploadButton } from '@/lib/uploadthing'
import { ISettingInput } from '@/types'
import { TrashIcon } from 'lucide-react'
import Image from 'next/image'
import { useFieldArray, UseFormReturn } from 'react-hook-form'
import { useTranslations } from 'next-intl'

export default function CarouselForm({
  form,
  id,
}: {
  form: UseFormReturn<ISettingInput>
  id: string
}) {
  const t = useTranslations('CarouselForm')
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'carousels',
  })
  const {
    watch,
    formState: { errors },
  } = form

  return (
    <Card id={id}>
      <CardHeader>
        <CardTitle>{t('carousels')}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-4'>
          {fields.map((field, index) => (
            <div key={field.id} className='flex justify-between gap-1 w-full'>
              {/* العنوان - غير مطلوب */}
              <FormField
                control={form.control}
                name={`carousels.${index}.title`}
                render={({ field }) => (
                  <FormItem>
                    {index == 0 && <FormLabel>{t('title')}</FormLabel>}
                    <FormControl>
                      <Input {...field} placeholder={t('title')} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {/* الرابط - غير مطلوب */}
              <FormField
                control={form.control}
                name={`carousels.${index}.url`}
                render={({ field }) => (
                  <FormItem>
                    {index == 0 && <FormLabel>{t('url')}</FormLabel>}
                    <FormControl>
                      <Input {...field} placeholder={t('url')} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {/* نص الزر - غير مطلوب */}
              <FormField
                control={form.control}
                name={`carousels.${index}.buttonCaption`}
                render={({ field }) => (
                  <FormItem>
                    {index == 0 && <FormLabel>{t('caption')}</FormLabel>}
                    <FormControl>
                      <Input {...field} placeholder={t('buttonCaption')} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {/* الصورة - مطلوبة */}
              <div>
                <FormField
                  control={form.control}
                  name={`carousels.${index}.image`}
                  render={({ field }) => (
                    <FormItem>
                      {index == 0 && <FormLabel>{t('image')}*</FormLabel>}
                      <FormControl>
                        <Input 
                          placeholder={t('enterImageUrl')} 
                          {...field} 
                          required
                        />
                      </FormControl>
                      <FormMessage>
                        {errors.carousels?.[index]?.image?.message}
                      </FormMessage>
                    </FormItem>
                  )}
                />

                {watch(`carousels.${index}.image`) && (
                  <Image
                    src={watch(`carousels.${index}.image`)}
                    alt='image'
                    className='w-full object-cover object-center rounded-sm'
                    width={192}
                    height={68}
                  />
                )}
                {!watch(`carousels.${index}.image`) && (
                  <UploadButton
                    endpoint='imageUploader'
                    onClientUploadComplete={(res) => {
                      form.setValue(`carousels.${index}.image`, res[0].url)
                    }}
                    onUploadError={(error: Error) => {
                      toast({
                        variant: 'destructive',
                        description: `${t('error')} ${error.message}`,
                      })
                    }}
                  />
                )}
              </div>
              
              {/* زر الحذف */}
              <div>
                {index == 0 && <div>{t('action')}</div>}
                <Button
                  type='button'
                  disabled={fields.length === 1}
                  variant='outline'
                  className={index == 0 ? 'mt-2' : ''}
                  onClick={() => {
                    remove(index)
                  }}
                >
                  <TrashIcon className='w-4 h-4' />
                </Button>
              </div>
            </div>
          ))}

          <Button
            type='button'
            variant={'outline'}
            onClick={() =>
              append({ url: '', title: '', image: '', buttonCaption: '' })
            }
          >
            {t('addCarousel')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}