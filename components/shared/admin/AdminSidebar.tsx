'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useTranslations, useLocale } from 'next-intl'
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  Settings,
  FileText,
  Boxes,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useSidebar } from '@/context/sidebar-context'
import { useCurrentUser } from '@/hooks/useCurrentUser'

const sidebarLinks = [
  { key: 'overview',   href: '/admin/overview',   icon: <Home size={18} /> },
  { key: 'categories', href: '/admin/categories', icon: <Boxes size={18} /> },
  { key: 'products',   href: '/admin/products',   icon: <Package size={18} /> },
  { key: 'orders',     href: '/admin/orders',     icon: <ShoppingCart size={18} /> },
  { key: 'users',      href: '/admin/users',      icon: <Users size={18} /> },
  { key: 'pages',      href: '/admin/web-pages',  icon: <FileText size={18} /> },
  { key: 'settings',   href: '/admin/settings',   icon: <Settings size={18} /> },
]

export default function AdminSidebar() {
  const pathname  = usePathname()
  const t         = useTranslations('AdminNav')
  const user      = useCurrentUser()
  const locale    = useLocale()
  const isRTL     = locale === 'ar'
  const { isOpen, toggle } = useSidebar()

  /* ----------------------- عناصر مساعدة ----------------------- */
  const SidebarLinks = () => (
    <nav className="mt-4 space-y-1">
      {sidebarLinks.map(({ key, href, icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={pathname.startsWith(href) ? 'page' : undefined}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
            pathname.startsWith(href)
              ? 'bg-gray-950 font-medium text-yellow-400'
              : 'text-gray-300',
            'hover:bg-gray-800 hover:text-yellow-400'
          )}
          onClick={() => window.innerWidth < 1024 && toggle()}
        >
          <span className="text-yellow-400">{icon}</span>
          <span>{t(`links.${key}`)}</span>
        </Link>
      ))}
    </nav>
  )

  const UserInfo = () =>
    user ? (
      <div className="mb-4 flex flex-col gap-3 rounded-lg border border-black bg-gray-950 p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-400 text-black">
            {user.name?.charAt(0).toUpperCase() ?? (
              <Image src="/icons/logo.svg" alt="User" width={20} height={20} />
            )}
          </div>
          <p className="truncate font-medium text-white">
            {t('welcome')} {user.name}
          </p>
        </div>
      </div>
    ) : null

  /* ----------------------- JSX ----------------------- */
  return (
    <>
      {/* ===== Desktop ===== */}
      <aside
        dir={isRTL ? 'rtl' : 'ltr'}
        className={cn(
          'fixed top-10 hidden h-screen w-64 flex-col overflow-y-auto border-r bg-gray-950 p-4 pt-5 lg:flex',
          isRTL ? 'right-0' : 'left-0',
          'z-30'
        )}
      >
        <div className="mb-6 flex items-center gap-3 px-2">
          <Link href="/" className="shrink-0">
            <Image src="/icons/logo.svg" alt="Logo" width={32} height={32} />
          </Link>
          <h1 className="truncate text-lg font-bold text-yellow-400">
            {t('Dashboard')}
          </h1>
        </div>

        <UserInfo />
        <SidebarLinks />
      </aside>

      {/* ======= Mobile ======= */}
      <Sheet open={isOpen} onOpenChange={toggle}>

        <SheetContent
          side={isRTL ? 'right' : 'left'}
          dir={isRTL ? 'rtl' : 'ltr'}
          className={cn(
            'flex w-72 max-w-full flex-col border-l border-gray-950 bg-gray-950/90 backdrop-blur p-0',
            // إذا أُغلق: اجعل العنصر وروحه و الـPortal بأكمله بدون تفاعل ورؤية
            !isOpen && 'pointer-events-none invisible'
          )}
        >
          <SheetHeader className="border-b border-gray-950 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image src="/icons/logo.svg" alt="Logo" width={28} height={28} />
                <SheetTitle className="text-lg text-yellow-400">
                  {t('Dashboard')}
                </SheetTitle>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-4">
            <UserInfo />
            <SidebarLinks />
          </div>
        </SheetContent>
      </Sheet>

      {/* يشغل فراغ السايدبار في الديسكتوب */}
      <div className="hidden w-64 flex-shrink-0 lg:block" />
    </>
  )
}
