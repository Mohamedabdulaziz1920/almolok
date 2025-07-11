'use client'

import { redirect, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import useSettingStore from '@/hooks/use-setting-store'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { IUserSignIn } from '@/types'
import { signInWithCredentials } from '@/lib/actions/user.actions'
import { toast } from '@/hooks/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserSignInSchema } from '@/lib/validator'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { useTranslations } from 'next-intl'

const signInDefaultValues =
  process.env.NODE_ENV === 'development'
    ? {
        email: 'admin@example.com',
        password: '123456',
      }
    : {
        email: '',
        password: '',
      }

export default function CredentialsSignInForm() {
  const t = useTranslations('SignIn.SignInForm')
  const {
    setting: { site },
  } = useSettingStore()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const form = useForm<IUserSignIn>({
    resolver: zodResolver(UserSignInSchema),
    defaultValues: signInDefaultValues,
  })

  const { control, handleSubmit } = form

  const onSubmit = async (data: IUserSignIn) => {
    try {
      await signInWithCredentials({
        email: data.email,
        password: data.password,
      })
      redirect(callbackUrl)
    } catch (error) {
      if (isRedirectError(error)) {
        throw error
      }
      toast({
        title: t('errorTitle'),
        description: t('errorDescription'),
        variant: 'destructive',
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input type='hidden' name='callbackUrl' value={callbackUrl} />
        <div className='space-y-6'>
          <FormField
            control={control}
            name='email'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel className="text-gray-800">{t('email')}</FormLabel>
                <FormControl>
                  <Input className="text-gray-800" placeholder={t('emailPlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name='password'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel className="text-gray-800">{t('password')}</FormLabel>
                <FormControl>
                  <Input className="text-gray-800"
                    type='password'
                    placeholder={t('passwordPlaceholder')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <Button type='submit'>{t('signIn')}</Button>
          </div>
          <div className="text-sm text-gray-600 text-center leading-relaxed">
            {t('agreement', { siteName: site.name })}{' '}
            <Link className="text-sm text-gray-600" href='/page/conditions-of-use'>{t('conditionsOfUse')}</Link>{' '}
            {t('and')}{' '}
            <Link href='/page/privacy-policy'>{t('privacyPolicy')}</Link>
          </div>
        </div>
      </form>
    </Form>
  )
}
