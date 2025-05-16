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

import { deleteUser, getAllUsers } from '@/lib/actions/user.actions'
import { IUser } from '@/lib/db/models/user.model'
import { formatId } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Admin Users',
}

interface AdminUserPageProps {
  searchParams?: {
    page?: string
  }
}

export default async function AdminUserPage({ searchParams }: AdminUserPageProps) {
  const session = await auth()
  const page = Number(searchParams?.page) || 1

  if (!session?.user || session.user.role !== 'Admin') {
    throw new Error('Admin permission required')
  }

  const usersResponse = await getAllUsers({ page })
  const users = usersResponse?.data || []
  const totalPages = usersResponse?.totalPages || 1

  return (
    <main className='container mx-auto px-2 py-4 sm:px-4 sm:py-6 lg:py-8'>
      <div className='mb-4 sm:mb-6 lg:mb-8'>
        <h1 className='text-xl font-bold sm:text-2xl lg:text-3xl text-gray-900 dark:text-white'>
          المستخدمون
        </h1>
        <p className='mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-400'>
          إدارة المستخدمين ومتابعة صلاحياتهم وإجراء التعديلات المطلوبة.
        </p>
      </div>

      <div className='rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950 overflow-x-auto'>
        <Table className='min-w-full'>
          <TableHeader className='bg-gray-50 dark:bg-gray-800'>
            <TableRow>
              <TableHead className='w-[80px] sm:w-[100px] lg:w-[120px]'>المعرف</TableHead>
              <TableHead className='min-w-[120px]' >الاسم</TableHead>
              <TableHead className='hidden sm:table-cell'>البريد الإلكتروني</TableHead>
              <TableHead className='w-[100px]'>الصلاحية</TableHead>
              <TableHead className='w-[150px] sm:w-[200px] lg:w-[300px]'>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user: IUser) => (
              <TableRow
                key={user._id}
                className='hover:bg-gray-50 dark:hover:bg-gray-900'
              >
                <TableCell className='font-medium'>{formatId(user._id)}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell className='hidden sm:table-cell'>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <div className='flex flex-col gap-1 sm:gap-2'>
                    <div className='grid grid-cols-2 gap-1 sm:flex sm:gap-2'>
                      <Button
                        asChild
                        size='sm'
                        className='w-full sm:w-auto bg-yellow-400 text-black hover:bg-yellow-500'
                      >
                        <Link href={`/admin/users/${user._id}/add-balance`}>
                          إضافة رصيد
                        </Link>
                      </Button>
                      <Button
                        asChild
                        size='sm'
                        className='w-full sm:w-auto bg-blue-500 text-white hover:bg-blue-600'
                      >
                        <Link href={`/admin/users/${user._id}`}>
                          تعديل
                        </Link>
                      </Button>
                      <DeleteDialog
                        id={user._id}
                        action={deleteUser}
                        buttonProps={{
                          size: 'sm',
                          className:
                            'w-full sm:w-auto bg-red-500 text-white hover:bg-red-600',
                        }}
                      />
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className='border-t border-gray-200 px-4 py-3 sm:px-6 sm:py-4 dark:border-gray-800'>
            <Pagination page={page.toString()} totalPages={totalPages} />
          </div>
        )}
      </div>
    </main>
  )
}
