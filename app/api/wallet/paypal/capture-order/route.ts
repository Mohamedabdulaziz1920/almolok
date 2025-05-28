
import { NextResponse } from 'next/server'
import { approvePayPalWalletOrder } from '@/lib/actions/wallet.actions'

export async function POST(request: Request) {
  try {
    const { orderID, amount, userId } = await request.json()

    if (!orderID || !amount || !userId) {
      return NextResponse.json(
        { error: 'بيانات الطلب غير مكتملة' },
        { status: 400 }
      )
    }

    const result = await approvePayPalWalletOrder(
      userId,
      Number(amount),
      orderID
    )

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      newBalance: result.newBalance,
    })
  } catch (error) {
    console.error('Error in capture-order:', error)
    return NextResponse.json({ error: 'خطأ في معالجة الدفع' }, { status: 500 })
  }
}
