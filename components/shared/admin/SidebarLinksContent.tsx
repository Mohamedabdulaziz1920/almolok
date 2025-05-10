'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { Home, Package, Settings } from 'lucide-react'

export default function SidebarLinksContent() {
  const pathname = usePathname()
  const t = useTranslations('AdminNav')

  const links = [
    { href: '/admin', icon: <Home size={18} />, label: t('Dashboard') },
    { href: '/admin/products', icon: <Package size={18} />, label: t('Products') },
    { href: '/admin/settings', icon: <Settings size={18} />, label: t('Settings') },
  ]

  return (
    <nav className='flex flex-col gap-2 mb-6'>
      {links.map(({ href, icon, label }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
            pathname === href
              ? 'bg-muted text-primary'
              : 'text-muted-foreground hover:bg-muted'
          )}
        >
          {icon}
          {label}
        </Link>
      ))}
    </nav>
  )
}
