// lib/actions/balance.actions.ts
import { connectToDatabase } from '../db'
import BalanceRequest from '@/lib/db/models/balanceRequest.model'
import User from '../db/models/user.model'
export async function getBalanceRequests({ status }: { status: string }) {
  return await BalanceRequest.find({ status }).populate('user')
}

export async function addUserBalance({
  userId,
  amount,
  requestId,
}: {
  userId: string
  amount: number
  requestId: string
}) {
  await connectToDatabase()

  // 1. تحديث رصيد المستخدم
  await User.findByIdAndUpdate(userId, { $inc: { balance: amount } })

  // 2. تحديث حالة الطلب
  await BalanceRequest.findByIdAndUpdate(requestId, { status: 'approved' })

  // 3. يمكنك هنا إرسال إشعار للمستخدم إذا كنت تستخدم نظام إشعارات
}
