'use client'

import { ChevronUp } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import useSettingStore from '@/hooks/use-setting-store'
import { Select, SelectContent, SelectItem, SelectTrigger } from '../ui/select'
import { SelectValue } from '@radix-ui/react-select'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/routing'
import { i18n } from '@/i18n-config'

export default function Footer() {
  const router = useRouter()
  const pathname = usePathname()
  const {
    setting: { site, availableCurrencies, currency },
    setCurrency,
  } = useSettingStore()
  const { locales } = i18n
  const locale = useLocale()
  const t = useTranslations()

  return (
    <footer className='bg-black text-white underline-link'>
      <div className='w-full'>
        <Button
          variant='ghost'
          className='bg-gray-800 w-full rounded-none'
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ChevronUp className='mr-2 h-4 w-4' />
          {t('Footer.Back to top')}
        </Button>

        {/* وسائل الدفع */}
        <div className='bg-gray-900 py-8'>
          <h3 className='text-center text-white text-lg font-semibold mb-4'>
            طرق الدفع المتاحة
          </h3>
          <div className='flex flex-wrap justify-center gap-4 items-center'>
            {[
              { name: 'Visa', src: '/icons/payment/Visa_Logo.png' },
              { name: 'MasterCard', src: '/icons/payment/Mastercard-logo.png' },
              { name: 'Mada', src: '/icons/payment/new-mada-footer.png' },
              { name: 'STC Pay', src: '/icons/payment/stc.png' },

              { name: 'apple-pay', src: '/icons/payment/apple-pay.png' },
              { name: 'PayPal', src: '/icons/payment/PayPal.png' },
            ].map((method) => (
              <Image
                key={method.name}
                src={method.src}
                alt={method.name}
                width={60}
                height={40}
                className='object-contain bg-white rounded p-1 h-10'
              />
            ))}
          </div>
        </div>

        {/* تحميل التطبيق */}
        <div className='bg-gray-950 py-8 px-4'>
          <h3 className='text-center text-white text-lg font-semibold mb-4'>
            {t('Footer.Download our app')}
          </h3>
          <div className='flex justify-center gap-4'>
            <a href='#' title='Google Play'>
              <Image
                src='https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg'
                alt='Google Play'
                width={150}
                height={50}
                className='object-contain'
              />
            </a>
            <a href='#' title='App Store'>
              <Image
                src='https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg'
                alt='App Store'
                width={150}
                height={50}
                className='object-contain'
              />
            </a>
            <a
  href='/apk/app-release.apk'
  download
  title='Download APK'
  className='hover:opacity-80 transition'
>
  <Image
    src='/icons/payment/download-apk-badge.png'
    alt='Download APK'
    width={150}
    height={50}
    className='object-contain'
  />
</a>
          </div>
        </div>

        {/* الإعدادات */}
        <div className='border-t border-gray-800'>
          <div className='max-w-7xl mx-auto py-8 px-4 flex flex-col items-center space-y-4'>
            <div className='flex items-center space-x-4 flex-wrap md:flex-nowrap'>
              <Image
                src='/icons/logo.svg'
                alt={`${site.name} logo`}
                width={48}
                height={48}
                className='w-14'
                style={{ maxWidth: '100%', height: 'auto' }}
              />
              <Select
                value={locale}
                onValueChange={(value) => {
                  router.push(pathname, { locale: value })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('Footer.Select a language')} />
                </SelectTrigger>
                <SelectContent>
                  {locales.map((lang, index) => (
                    <SelectItem key={index} value={lang.code}>
                      <Link
                        className='w-full flex items-center gap-1'
                        href={pathname}
                        locale={lang.code}
                      >
                        <span className='text-lg'>{lang.icon}</span> {lang.name}
                      </Link>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={currency}
                onValueChange={(value) => {
                  setCurrency(value)
                  window.scrollTo(0, 0)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('Footer.Select a currency')} />
                </SelectTrigger>
                <SelectContent>
                  {availableCurrencies
                    .filter((x) => x.code)
                    .map((currency, index) => (
                      <SelectItem key={index} value={currency.code}>
                        {currency.name} ({currency.code})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* روابط سفلية */}
        <div className='p-4'>
          <div className='flex justify-center gap-3 text-sm'>
            <Link href='/page/conditions-of-use'>
              {t('Footer.Conditions of Use')}
            </Link>
            <Link href='/page/privacy-policy'>
              {t('Footer.Privacy Notice')}
            </Link>
            <Link href='/page/help'>{t('Footer.Help')}</Link>
          </div>
          <div className='flex flex-col items-center text-sm text-center'>
            <p>© {site.copyright}</p>
            <p>
              {site.address} | {site.phone}
            </p>
          </div>
          <div className='mt-8 flex justify-center text-sm text-gray-400'>
            <Link href='https://mohammed-almalgami.com/'>
              {t('Footer.Designed and developed by')} |{' '}
              {t('Footer.Mohammed Almalgami')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
