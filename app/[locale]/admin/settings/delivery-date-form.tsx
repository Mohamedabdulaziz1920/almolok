'use client'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ISettingInput } from '@/types'
import { TrashIcon } from 'lucide-react'
import React, { useEffect, useMemo } from 'react'
import { useFieldArray, UseFormReturn } from 'react-hook-form'
import { useTranslations } from 'next-intl'

export default function DeliveryDateForm({
  form,
  id,
}: {
  form: UseFormReturn<ISettingInput>
  id: string
}) {
  const t = useTranslations('DeliveryDateForm')
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'availableDeliveryDates',
  })
  const {
    setValue,
    watch,
    control,
    formState: { errors },
  } = form

  const [availableDeliveryDates, defaultDeliveryDate] = watch([
    'availableDeliveryDates',
    'defaultDeliveryDate',
  ])

  // استخراج أسماء التواريخ المتاحة باستخدام useMemo لتحسين الأداء
  const deliveryDateNames = useMemo(
    () => availableDeliveryDates.map((date) => date.name),
    [availableDeliveryDates]
  )

  // إصلاح useEffect مع التعامل الصحيح مع التبعيات
  useEffect(() => {
    if (!deliveryDateNames.includes(defaultDeliveryDate)) {
      setValue('defaultDeliveryDate', '')
    }
  }, [deliveryDateNames, defaultDeliveryDate, setValue])

  return (
    <Card id={id}>
      <CardHeader>
        <CardTitle>{t('deliveryDates')}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-4'>
          {fields.map((field, index) => (
            <div key={field.id} className='flex gap-2 items-start'>
              <FormField
                control={form.control}
                name={`availableDeliveryDates.${index}.name`}
                render={({ field }) => (
                  <FormItem className='flex-1'>
                    {index === 0 && <FormLabel>{t('name')}</FormLabel>}
                    <FormControl>
                      <Input {...field} placeholder={t('name')} />
                    </FormControl>
                    <FormMessage>
                      {errors.availableDeliveryDates?.[index]?.name?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`availableDeliveryDates.${index}.daysToDeliver`}
                render={({ field }) => (
                  <FormItem className='w-24'>
                    {index === 0 && <FormLabel>{t('days')}</FormLabel>}
                    <FormControl>
                      <Input
                        {...field}
                        type='number'
                        placeholder={t('daysToDeliver')}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage>
                      {
                        errors.availableDeliveryDates?.[index]?.daysToDeliver
                          ?.message
                      }
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`availableDeliveryDates.${index}.shippingPrice`}
                render={({ field }) => (
                  <FormItem className='w-24'>
                    {index === 0 && <FormLabel>{t('shippingPrice')}</FormLabel>}
                    <FormControl>
                      <Input
                        {...field}
                        type='number'
                        placeholder={t('shippingPrice')}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage>
                      {
                        errors.availableDeliveryDates?.[index]?.shippingPrice
                          ?.message
                      }
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`availableDeliveryDates.${index}.freeShippingMinPrice`}
                render={({ field }) => (
                  <FormItem className='w-24'>
                    {index === 0 && <FormLabel>{t('freeShipping')}</FormLabel>}
                    <FormControl>
                      <Input
                        {...field}
                        type='number'
                        placeholder={t('freeShippingMinPrice')}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage>
                      {
                        errors.availableDeliveryDates?.[index]
                          ?.freeShippingMinPrice?.message
                      }
                    </FormMessage>
                  </FormItem>
                )}
              />
              <div className='pt-7'>
                <Button
                  type='button'
                  disabled={fields.length === 1}
                  variant='outline'
                  size='icon'
                  onClick={() => remove(index)}
                >
                  <TrashIcon className='w-4 h-4' />
                </Button>
              </div>
            </div>
          ))}

          <Button
            type='button'
            variant='outline'
            onClick={() =>
              append({
                name: '',
                daysToDeliver: 0,
                shippingPrice: 0,
                freeShippingMinPrice: 0,
              })
            }
          >
            {t('addDeliveryDate')}
          </Button>
        </div>

        {availableDeliveryDates.some((date) => date.name) && (
          <FormField
            control={control}
            name='defaultDeliveryDate'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('defaultDeliveryDate')}</FormLabel>
                <Select
                  value={field.value || ''}
                  onValueChange={field.onChange}
                  disabled={!availableDeliveryDates.some((date) => date.name)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectDeliveryDate')} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDeliveryDates
                      .filter((date) => date.name)
                      .map((date, index) => (
                        <SelectItem key={index} value={date.name}>
                          {date.name} ({date.daysToDeliver} {t('days')})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage>{errors.defaultDeliveryDate?.message}</FormMessage>
              </FormItem>
            )}
          />
        )}
      </CardContent>
    </Card>
  )
}
