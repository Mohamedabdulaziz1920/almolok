import { useTranslations } from 'next-intl'
import useSettingStore from '@/hooks/use-setting-store'
import Link from 'next/link'
import React from 'react'

export default function CheckoutFooter() {
  const t = useTranslations('CheckoutFooter')
  const {
    setting: { site },
  } = useSettingStore()

  return (
    <div className='border-t-2 space-y-2 my-4 py-4'>
      <p>
        {t.rich('needHelp', {
          helpLink: (chunks) => <Link href='/page/help'>{chunks}</Link>,
          contactLink: (chunks) => (
            <Link href='/page/contact-us'>{chunks}</Link>
          ),
        })}
      </p>
      <p>
        {t.rich('orderConfirmation', {
          siteName: site.name,
          privacyLink: (chunks) => (
            <Link href='/page/privacy-policy'>{chunks}</Link>
          ),
          conditionsLink: (chunks) => (
            <Link href='/page/conditions-of-use'>{chunks}</Link>
          ),
        })}
      </p>
      <p>
        {t.rich('returnPolicy', {
          siteName: site.name,
          returnsLink: (chunks) => (
            <Link href='/page/returns-policy'>{chunks}</Link>
          ),
        })}
      </p>
    </div>
  )
}
