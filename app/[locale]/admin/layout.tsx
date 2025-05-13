import { SidebarProvider } from '@/context/sidebar-context'
import AdminHeader from '@/components/shared/admin/AdminHeader'
import AdminSidebar from '@/components/shared/admin/AdminSidebar'
import { cn } from '@/lib/utils'
import { useLocale } from 'next-intl'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = useLocale()
  const isRTL = locale === 'ar'

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* السايدبار */}
        <AdminSidebar />

        {/* الجزء الرئيسي */}
        <div className="flex-1 flex flex-col">
          {/* الهيدر */}
          <AdminHeader />
          
          {/* المحتوى الرئيسي */}
          <main className={cn(
            "flex-1 p-4 lg:p-6",
            "transition-all duration-300",
            "mt-16 lg:mt-0" // تعويض ارتفاع الهيدر على الجوال
          )}>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
