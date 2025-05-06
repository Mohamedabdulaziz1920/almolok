import { i18n } from '@/i18n-config'
import { createNavigation } from 'next-intl/navigation'
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: i18n.locales.map((locale) => locale.code),
  defaultLocale: 'ar',
  localePrefix: 'as-needed',
  pathnames: {},
})

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing)

// ✅ تعريف نوع Locale من القائمة نفسها
export type Locale = (typeof routing.locales)[number]
