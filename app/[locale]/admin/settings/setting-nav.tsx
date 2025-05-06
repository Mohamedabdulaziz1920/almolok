'use client'
import { Button } from '@/components/ui/button'
import {
  CreditCard,
  Currency,
  ImageIcon,
  Info,
  Languages,
  SettingsIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

const SettingNav = () => {
  const t = useTranslations('SettingNav')
  const [active, setActive] = useState('')

  useEffect(() => {
    const sections = document.querySelectorAll('div[id^="setting-"]')

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
          }
        })
      },
      { threshold: 0.6, rootMargin: '0px 0px -40% 0px' }
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  const handleScroll = (id: string) => {
    const section = document.getElementById(id)
    if (section) {
      const top = section.offsetTop - 16 // 20px above the section
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <div>
      <h1 className='h1-bold'>{t('setting')}</h1>
      <nav className='flex md:flex-col gap-2 md:fixed mt-4 flex-wrap'>
        {[
          { name: t('siteInfo'), hash: 'setting-site-info', icon: <Info /> },
          {
            name: t('commonSettings'),
            hash: 'setting-common',
            icon: <SettingsIcon />,
          },
          {
            name: t('carousels'),
            hash: 'setting-carousels',
            icon: <ImageIcon />,
          },
          {
            name: t('languages'),
            hash: 'setting-languages',
            icon: <Languages />,
          },
          {
            name: t('currencies'),
            hash: 'setting-currencies',
            icon: <Currency />,
          },
          {
            name: t('paymentMethods'),
            hash: 'setting-payment-methods',
            icon: <CreditCard />,
          },
        ].map((item) => (
          <Button
            onClick={() => handleScroll(item.hash)}
            key={item.hash}
            variant={active === item.hash ? 'outline' : 'ghost'}
            className={`justify-start ${
              active === item.hash ? '' : 'border border-transparent'
            }`}
          >
            {item.icon}
            {item.name}
          </Button>
        ))}
      </nav>
    </div>
  )
}

export default SettingNav
