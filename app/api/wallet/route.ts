
import { NextResponse } from 'next/server'
import {
  createPayPalWalletOrder,
  approvePayPalWalletOrder,
} from '@/lib/actions/wallet.actions'

export async function POST(request: Request) {
  const { action, amount, userId, orderId } = await request.json()

  try {
    if (action === 'create') {
      const result = await createPayPalWalletOrder(amount, userId)
      return NextResponse.json(result)
    }

    if (action === 'approve') {
      const result = await approvePayPalWalletOrder(userId, amount, orderId)
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Payment processing failed:', error)
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
