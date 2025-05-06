// app/[locale]/admin/packages/delete/route.ts
import { deletePackage } from '@/lib/actions/package.actions'
import { redirect } from 'next/navigation'

export async function POST(request: Request) {
  const formData = await request.formData()
  const id = formData.get('id') as string

  if (!id) return new Response('Missing ID', { status: 400 })

  await deletePackage(id)

  redirect('/admin/packages') // رجوع لصفحة الباقات
}
