import { SidebarProvider } from '@/context/sidebar-context'
import AdminSidebar from '@/components/shared/admin/AdminSidebar'
import AdminHeader from '@/components/shared/admin/AdminHeader'
import ClientOnly from '@/components/shared/ClientOnly'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1">
          <ClientOnly>
            <AdminHeader />
          </ClientOnly>
          <main className="p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
