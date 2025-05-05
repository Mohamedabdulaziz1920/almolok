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
import React, { useEffect } from 'react'
import { useFieldArray, UseFormReturn } from 'react-hook-form'
import { useTranslations } from 'next-intl'

export default function PaymentMethodForm({
  form,
  id,
}: {
  form: UseFormReturn<ISettingInput>
  id: string
}) {
  const t = useTranslations('PaymentMethodForm')
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'availablePaymentMethods',
  })
  const {
    setValue,
    watch,
    control,
    formState: { errors },
  } = form

  const availablePaymentMethods = watch('availablePaymentMethods')
  const defaultPaymentMethod = watch('defaultPaymentMethod')

  useEffect(() => {
    const validCodes = availablePaymentMethods.map((lang) => lang.name)
    if (!validCodes.includes(defaultPaymentMethod)) {
      setValue('defaultPaymentMethod', '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(availablePaymentMethods)])

  return (
    <Card id={id}>
      <CardHeader>
        <CardTitle>{t('paymentMethods')}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-4'>
          {fields.map((field, index) => (
            <div key={field.id} className='flex gap-2'>
              <FormField
                control={form.control}
                name={`availablePaymentMethods.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    {index == 0 && <FormLabel>{t('name')}</FormLabel>}
                    <FormControl>
                      <Input {...field} placeholder={t('name')} />
                    </FormControl>
                    <FormMessage>
                      {errors.availablePaymentMethods?.[index]?.name?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`availablePaymentMethods.${index}.commission`}
                render={({ field }) => (
                  <FormItem>
                    {index == 0 && <FormLabel>{t('commission')}</FormLabel>}
                    <FormControl>
                      <Input {...field} placeholder={t('commission')} />
                    </FormControl>
                    <FormMessage>
                      {
                        errors.availablePaymentMethods?.[index]?.commission
                          ?.message
                      }
                    </FormMessage>
                  </FormItem>
                )}
              />
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
            onClick={() => append({ name: '', commission: 0 })}
          >
            {t('addPaymentMethod')}
          </Button>
        </div>

        <FormField
          control={control}
          name='defaultPaymentMethod'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('defaultPaymentMethod')}</FormLabel>
              <FormControl>
                <Select
                  value={field.value || ''}
                  onValueChange={(value) => field.onChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectPaymentMethod')} />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePaymentMethods
                      .filter((x) => x.name)
                      .map((lang, index) => (
                        <SelectItem key={index} value={lang.name}>
                          {lang.name} ({lang.name})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage>{errors.defaultPaymentMethod?.message}</FormMessage>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
