
'use server'

import { paypal } from '../paypal'
import User from '../db/models/user.model'
import { connectToDatabase } from '../db'

export async function createPayPalWalletOrder(
  amount: number,
  userId: string
): Promise<{ success: boolean; message: string; orderId?: string }> {
  try {
    await connectToDatabase()

    const paypalOrder = await paypal.createOrder(amount)

    await User.findByIdAndUpdate(userId, {
      $push: {
        walletTransactions: {
          amount,
          type: 'deposit_pending',
          method: 'paypal',
          transactionId: paypalOrder.id,
          status: 'pending',
        },
      },
    })

    return {
      success: true,
      message: 'تم إنشاء طلب PayPal بنجاح',
      orderId: paypalOrder.id,
    }
  } catch (error) {
    console.error('Error creating PayPal order:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'فشل في إنشاء طلب PayPal',
    }
  }
}

export async function approvePayPalWalletOrder(
  userId: string,
  amount: number,
  orderId: string
): Promise<{ success: boolean; message: string; newBalance?: number }> {
  try {
    await connectToDatabase()

    const captureData = await paypal.capturePayment(orderId)

    if (!captureData || captureData.status !== 'COMPLETED') {
      return {
        success: false,
        message: 'فشل في عملية الدفع عبر PayPal',
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $inc: { wallet: amount },
        $set: {
          'walletTransactions.$[elem].status': 'completed',
          'walletTransactions.$[elem].paypalData': {
            email: captureData.payer?.email_address,
            captureId:
              captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id,
          },
        },
      },
      {
        new: true,
        arrayFilters: [{ 'elem.transactionId': orderId }],
      }
    )

    if (!updatedUser) {
      return {
        success: false,
        message: 'فشل في تحديث رصيد المستخدم',
      }
    }

    return {
      success: true,
      message: 'تم شحن الرصيد بنجاح',
      newBalance: updatedUser.wallet,
    }
  } catch (error) {
    console.error('Error approving PayPal order:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'فشل في عملية شحن الرصيد',
    }
  }
}
