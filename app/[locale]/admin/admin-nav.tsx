'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

export function AdminNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()
  const t = useTranslations('AdminNav')

  const links = [
    {
      key: 'overview',
      href: '/admin/overview',
    },
    {
      key: 'products',
      href: '/admin/products',
    },
    {
      key: 'orders',
      href: '/admin/orders',
    },
    {
      key: 'users',
      href: '/admin/users',
    },
    {
      key: 'pages',
      href: '/admin/web-pages',
    },
    {
      key: 'settings',
      href: '/admin/settings',
    },
  ]

  return (
    <nav
      className={cn(
        'flex items-center flex-wrap overflow-hidden gap-2 md:gap-4',
        className
      )}
      {...props}
    >
      {links.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'transition-colors hover:text-primary',
            pathname.includes(item.href)
              ? 'text-primary font-medium'
              : 'text-muted-foreground'
          )}
        >
          {t(`links.${item.key}`)}
        </Link>
      ))}
    </nav>
  )
}
