// lib/actions/orders/pay-with-balance.ts
'use server'

import { connectToDatabase } from '@/lib/db'
import { Order } from '@/lib/db/models/order.model'
import User from '@/lib/db/models/user.model'
import { auth } from '@/auth'
import { formatError } from '@/lib/utils'
import { sendPurchaseReceipt } from '@/emails'
import { revalidatePath } from 'next/cache'

export async function payOrderWithBalance(orderId: string) {
  try {
    await connectToDatabase()
    const session = await auth()
    if (!session?.user?.id) throw new Error('User is not authenticated')

    const order = await Order.findById(orderId).populate('user')
    if (!order) throw new Error('Order not found')
    if (order.isPaid) throw new Error('Order is already paid')

    const user = await User.findById(session.user.id)
    if (!user) throw new Error('User not found')

    // تحقق من أن balance موجودة ولا تقل عن قيمة الطلب
    if (user.balance === undefined || user.balance < order.totalPrice) {
      throw new Error('Insufficient balance to pay for this order')
    }

    // خصم الرصيد
    user.balance -= order.totalPrice
    await user.save()

    // تحديث حالة الطلب
    order.isPaid = true
    order.paidAt = new Date()
    order.paymentMethod = 'wallet'
    await order.save()

    await sendPurchaseReceipt({ order })
    revalidatePath(`/account/orders/${orderId}`)

    return {
      success: true,
      message: 'تم الدفع من الرصيد بنجاح',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}
