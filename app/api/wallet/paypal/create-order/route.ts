
import { NextResponse } from 'next/server'
import { createPayPalWalletOrder } from '@/lib/actions/wallet.actions'

export async function POST(request: Request) {
  try {
    const { amount, userId } = await request.json()

    if (!amount || !userId) {
      return NextResponse.json(
        { success: false, error: 'المبلغ ومعرف المستخدم مطلوبان' },
        { status: 400 }
      )
    }

    const result = await createPayPalWalletOrder(Number(amount), userId)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      orderID: result.orderId,
    })
  } catch (error) {
    console.error('Error in create-order:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'خطأ في الخادم الداخلي',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
