import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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
import { COLORS, THEMES } from '@/lib/constants'
import { ISettingInput } from '@/types'
import React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { useTranslations } from 'next-intl'

export default function CommonForm({
  form,
  id,
}: {
  form: UseFormReturn<ISettingInput>
  id: string
}) {
  const t = useTranslations('CommonForm')
  const { control } = form

  return (
    <Card id={id}>
      <CardHeader>
        <CardTitle>{t('commonSettings')}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex flex-col gap-5 md:flex-row'>
          <FormField
            control={control}
            name='common.pageSize'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>{t('pageSize')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('enterPageSize')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name='common.freeShippingMinPrice'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>{t('freeShippingMinPrice')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('enterFreeShippingMinPrice')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className='flex flex-col gap-5 md:flex-row'>
          <FormField
            control={control}
            name='common.defaultColor'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>{t('defaultColor')}</FormLabel>
                <FormControl>
                  <Select
                    value={field.value || ''}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectColor')} />
                    </SelectTrigger>
                    <SelectContent>
                      {COLORS.map((color, index) => (
                        <SelectItem key={index} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name='common.defaultTheme'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>{t('defaultTheme')}</FormLabel>
                <FormControl>
                  <Select
                    value={field.value || ''}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectTheme')} />
                    </SelectTrigger>
                    <SelectContent>
                      {THEMES.map((theme, index) => (
                        <SelectItem key={index} value={theme}>
                          {theme}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          <FormField
            control={control}
            name='common.isMaintenanceMode'
            render={({ field }) => (
              <FormItem className='space-x-2 items-center'>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>{t('maintenanceMode')}</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  )
}
