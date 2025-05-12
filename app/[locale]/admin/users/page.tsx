import { deleteUser, getAllUsers } from '@/lib/actions/user.actions'
import { Metadata } from 'next'
import Link from 'next/link'

import { auth } from '@/auth'
import DeleteDialog from '@/components/shared/delete-dialog'
import Pagination from '@/components/shared/pagination'
import { Button } from '@/components/ui/button'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { IUser } from '@/lib/db/models/user.model'
import { formatId } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Admin Users',
}

export default async function AdminUser({
  searchParams,
}: {
  searchParams?: { page?: string }
}) {
  const session = await auth()

  if (!session || !session.user || session.user.role !== 'Admin') {
    throw new Error('Admin permission required')
  }

  const page = Number(searchParams?.page) || 1
  const users = await getAllUsers({ page })

  return (
    <div className='space-y-6 p-4 sm:p-6 lg:p-8'>
      <h1 className='text-2xl font-bold'>المستخدمون</h1>

      <div className='overflow-x-auto border rounded-lg shadow-sm'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المعرف</TableHead>
              <TableHead>الاسم</TableHead>
              <TableHead>البريد الإلكتروني</TableHead>
              <TableHead>الصلاحية</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.data.map((user: IUser) => (
              <TableRow key={user._id}>
                <TableCell>{formatId(user._id)}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell className='flex flex-wrap gap-2 py-4'>
                  <Button asChild variant='outline' size='sm'>
                    <Link href={`/admin/users/${user._id}`}>تعديل</Link>
                  </Button>

                  <Button
                    asChild
                    variant='secondary'
                    size='sm'
                    className='bg-yellow-400 text-black hover:bg-yellow-500'
                  >
                    <Link href={`/admin/users/${user._id}/add-balance`}>
                      إضافة رصيد
                    </Link>
                  </Button>

                  <DeleteDialog id={user._id} action={deleteUser} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {users?.totalPages > 1 && (
        <Pagination page={page} totalPages={users.totalPages} />
      )}
    </div>
  )
}
