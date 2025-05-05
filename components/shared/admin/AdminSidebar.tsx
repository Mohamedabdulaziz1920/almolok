'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  Settings,
  FileText,
  Boxes,
  PackagePlus,
} from 'lucide-react'

const sidebarLinks = [
  { key: 'overview', href: '/admin/overview', icon: <Home size={18} /> },
  { key: 'products', href: '/admin/products', icon: <Package size={18} /> },
  { key: 'packages', href: '/admin/packages', icon: <PackagePlus size={18} /> },
  { key: 'categories', href: '/admin/categories', icon: <Boxes size={18} /> },
  { key: 'orders', href: '/admin/orders', icon: <ShoppingCart size={18} /> },
  { key: 'users', href: '/admin/users', icon: <Users size={18} /> },
  { key: 'pages', href: '/admin/web-pages', icon: <FileText size={18} /> },
  { key: 'settings', href: '/admin/settings', icon: <Settings size={18} /> },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const t = useTranslations('AdminNav')

  return (
    <aside className='h-full w-64 flex flex-col shadow-md p-4 overflow-y-auto'>
      <h1 className='text-xl font-bold mb-6 px-2 text-primary'>
        {t('Dashboard')}
      </h1>
      <nav className='space-y-2'>
        {sidebarLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md transition-all hover:bg-gray-100',
              pathname.includes(link.href)
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground'
            )}
          >
            {link.icon}
            <span>{t(`links.${link.key}`)}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}
