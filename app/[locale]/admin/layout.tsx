'use client'

import { SidebarProvider } from '@/context/sidebar-context'
import AdminSidebar  from '@/components/shared/admin/AdminSidebar'
import AdminHeader   from '@/components/shared/admin/AdminHeader'
import Footer        from '@/components/shared/admin/footer'   // تأكّد من المسار/حالة الأحرف

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      {/* الحاوية الكاملة للوحة التحكّم */}
      <div className="flex min-h-screen">
        {/* الشريط الجانبي */}
        <AdminSidebar />

        {/* المنطقة اليمنى: الهيدر + المحتوى */}
        <div className="flex flex-1 flex-col">
          <AdminHeader />
          <main className="flex-1 p-4 lg:p-6">{children}</main>
        </div>
      </div>

      {/* فوتر لوحة التحكّم (اختياري) */}
      <Footer />
    </SidebarProvider>
  )
}
