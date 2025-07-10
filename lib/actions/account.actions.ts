'use server'

import { auth } from '@/auth'
import User from '../db/models/user.model'
import { connectToDatabase } from '../db'
import { signOut } from '@/auth'
import { redirect } from 'next/navigation'

export async function deleteCurrentUser() {
  try {
    const session = await auth()
    const user = session?.user
    if (!user) throw new Error('لم يتم تسجيل الدخول')

    await connectToDatabase()

    const res = await User.findByIdAndDelete(user._id)
    if (!res) throw new Error('المستخدم غير موجود')

    // تسجيل الخروج وإعادة التوجيه
    await signOut({ redirect: false }) // يمنع إعادة التوجيه التلقائي
    redirect('/') // التوجيه للصفحة الرئيسية

  } catch (error) {
    return { success: false, message: 'حدث خطأ أثناء حذف الحساب' }
  }
}
