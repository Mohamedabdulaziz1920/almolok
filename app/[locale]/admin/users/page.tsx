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
    <main className='container mx-auto px-2 py-4 sm:px-4 sm:py-6 lg:py-8'>
      <div className='space-y-4 sm:space-y-6'>
        <h1 className='text-xl font-bold sm:text-2xl lg:text-3xl'>
          المستخدمون
        </h1>

        <div className='overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950'>
          <Table className='min-w-[700px]'>
            <TableHeader className='bg-gray-50 dark:bg-gray-800'>
              <TableRow>
                <TableHead className='w-[100px] sm:w-[120px]'>المعرف</TableHead>
                <TableHead className='min-w-[120px]'>الاسم</TableHead>
                <TableHead className='hidden sm:table-cell'>
                  البريد الإلكتروني
                </TableHead>
                <TableHead className='w-[100px]'>الصلاحية</TableHead>
                <TableHead className='min-w-[200px] sm:min-w-[300px]'>
                  الإجراءات
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.data.map((user: IUser) => (
                <TableRow
                  key={user._id}
                  className='hover:bg-gray-50 dark:hover:bg-gray-900'
                >
                  <TableCell className='font-medium'>
                    {formatId(user._id)}
                  </TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell className='hidden sm:table-cell'>
                    {user.email}
                  </TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <div className='grid grid-cols-1 sm:grid-cols-3 gap-2'>
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
                      <Button
                        asChild
                        variant='outline'
                        size='sm'
                        className='bg-blue-500 text-white hover:bg-yellow-500'
                      >
                        <Link href={`/admin/users/${user._id}`}>تعديل</Link>
                      </Button>
                      <DeleteDialog
                        id={user._id}
                        action={deleteUser}
                        buttonProps={{
                          size: 'sm',
                          className: 'bg-red-500 text-white hover:bg-yellow-500',
                        }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {users?.totalPages > 1 && (
          <div className='flex justify-center'>
            <Pagination page={page} totalPages={users.totalPages} />
          </div>
        )}
      </div>
    </main>
  )
}
