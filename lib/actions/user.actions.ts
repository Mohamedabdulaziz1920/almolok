'use server'

import bcrypt from 'bcryptjs'
import { auth, signIn, signOut } from '@/auth'
import { IUserName, IUserSignIn, IUserSignUp } from '@/types'
import { UserSignUpSchema, UserUpdateSchema } from '../validator'
import { connectToDatabase } from '../db'
import User, { IUser } from '../db/models/user.model'
import { formatError } from '../utils'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getSetting } from './setting.actions'
import { deleteUserAccount } from '@/lib/actions/user.actions'


// CREATE - تسجيل مستخدم جديد
export async function registerUser(userSignUp: IUserSignUp) {
  try {
    const user = await UserSignUpSchema.parseAsync({
      name: userSignUp.name,
      email: userSignUp.email,
      password: userSignUp.password,
      confirmPassword: userSignUp.confirmPassword,
    })

    await connectToDatabase()
    await User.create({
      ...user,
      password: await bcrypt.hash(user.password, 5),
    })

    return { success: true, message: 'User created successfully' }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}

// DELETE - حذف مستخدم
export async function deleteUser(id: string) {
  try {
    await connectToDatabase()
    const res = await User.findByIdAndDelete(id)
    if (!res) throw new Error('Use not found')

    revalidatePath('/admin/users')
    return {
      success: true,
      message: 'User deleted successfully',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// UPDATE - تعديل بيانات مستخدم
export async function updateUser(user: z.infer<typeof UserUpdateSchema>) {
  try {
    await connectToDatabase()
    const dbUser = await User.findById(user._id)
    if (!dbUser) throw new Error('User not found')

    dbUser.name = user.name
    dbUser.email = user.email
    dbUser.role = user.role
    const updatedUser = await dbUser.save()

    revalidatePath('/admin/users')

    return {
      success: true,
      message: 'User updated successfully',
      data: JSON.parse(JSON.stringify(updatedUser)),
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// تعديل اسم المستخدم من حسابه
export async function updateUserName(user: IUserName) {
  try {
    await connectToDatabase()
    const session = await auth()
    const currentUser = await User.findById(session?.user?._id)
    if (!currentUser) throw new Error('User not found')

    currentUser.name = user.name
    const updatedUser = await currentUser.save()

    return {
      success: true,
      message: 'User updated successfully',
      data: JSON.parse(JSON.stringify(updatedUser)),
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// تسجيل الدخول
export async function signInWithCredentials(user: IUserSignIn) {
  return await signIn('credentials', { ...user, redirect: false })
}

// تسجيل الدخول باستخدام Google
export const SignInWithGoogle = async () => {
  await signIn('google')
}

// تسجيل الخروج
export const SignOut = async () => {
  const redirectTo = await signOut({ redirect: false })
  redirect(redirectTo.redirect)
}

// جلب جميع المستخدمين (للأدمن)
export async function getAllUsers({
  limit,
  page,
}: {
  limit?: number
  page: number
}) {
  const {
    common: { pageSize },
  } = await getSetting()

  limit = limit || pageSize
  await connectToDatabase()

  const skipAmount = (Number(page) - 1) * limit
  const users = await User.find()
    .sort({ createdAt: 'desc' })
    .skip(skipAmount)
    .limit(limit)

  const usersCount = await User.countDocuments()

  return {
    data: JSON.parse(JSON.stringify(users)) as IUser[],
    totalPages: Math.ceil(usersCount / limit),
  }
}

// جلب مستخدم حسب ID
export async function getUserById(userId: string) {
  await connectToDatabase()
  const user = await User.findById(userId)
  if (!user) throw new Error('User not found')
  return JSON.parse(JSON.stringify(user)) as IUser
}

//
// ✅ NEW FUNCTION: Add Balance to User
//
export async function addUserBalance(userId: string, amount: number) {
  try {
    await connectToDatabase()

    const user = await User.findById(userId)
    if (!user) throw new Error('User not found')

    user.balance = (user.balance || 0) + amount
    await user.save()

    revalidatePath('/admin/users') // إعادة تحميل الصفحة بعد التحديث

    return {
      success: true,
      message: 'تم إضافة الرصيد بنجاح',
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    }
  }
}
export async function deleteUserAccount(userId: string) {
  try {
    await db.user.delete({ where: { id: userId } })
  } catch (error) {
    console.error('Failed to delete user:', error)
    throw new Error('Failed to delete user')
  }
}
