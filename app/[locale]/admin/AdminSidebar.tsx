'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { Home, Package, ShoppingCart, Users, Settings, FileText } from 'lucide-react'

const sidebarLinks = [
  { key: 'overview', href: '/admin/overview', icon: <Home size={18} /> },
  { key: 'products', href: '/admin/products', icon: <Package size={18} /> },
  { key: 'orders', href: '/admin/orders', icon: <ShoppingCart size={18} /> },
  { key: 'users', href: '/admin/users', icon: <Users size={18} /> },
  { key: 'pages', href: '/admin/web-pages', icon: <FileText size={18} /> },
  { key: 'settings', href: '/admin/settings', icon: <Settings size={18} /> },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const t = useTranslations('AdminNav')

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col border-r bg-white shadow-lg p-4 sticky top-0">
      <h1 className="text-xl font-bold mb-6 px-2 text-primary">لوحة التحكم</h1>
      <nav className="space-y-2">
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
