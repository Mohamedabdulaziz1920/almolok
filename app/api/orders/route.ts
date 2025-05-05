import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { Order } from '@/lib/db/models/order.model'
import User from '@/lib/db/models/user.model'
import { ObjectId } from 'mongoose'

export const POST = async (request: NextRequest) => {
  try {
    await connectToDatabase()

    let { userId, orderItems, totalAmount, paymentMethod } =
      await request.json()

    // تعديل طريقة الدفع لتكون 'wallet' إن وُجدت
    paymentMethod = paymentMethod === 'wallet' ? 'wallet' : paymentMethod

    // تحقق من الحقول المطلوبة
    if (
      !userId ||
      !orderItems ||
      orderItems.length === 0 ||
      !totalAmount ||
      !paymentMethod
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // تحقق من كل عنصر في الطلب
    for (const item of orderItems) {
      if (
        !item.productId ||
        !item.quantity ||
        item.quantity <= 0 ||
        !item.price
      ) {
        return NextResponse.json(
          { error: 'Invalid order item data' },
          { status: 400 }
        )
      }
    }

    // جلب المستخدم
    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // التحقق من الرصيد إذا كانت طريقة الدفع هي "balance"
    if (paymentMethod === 'balance') {
      if (user.balance < totalAmount) {
        return NextResponse.json(
          { error: 'Insufficient balance' },
          { status: 400 }
        )
      }

      // خصم المبلغ من الرصيد
      user.balance -= totalAmount
      await user.save()
    }

    // إنشاء الطلب
    const newOrder = new Order({
      user: new ObjectId(userId),
      items: orderItems,
      paymentMethod,
      itemsPrice: totalAmount,
      shippingPrice: 0,
      taxPrice: 0,
      totalPrice: totalAmount,
      isPaid: paymentMethod === 'balance',
      paidAt: paymentMethod === 'balance' ? new Date() : null,
    })

    await newOrder.save()

    return NextResponse.json(newOrder, { status: 201 })
  } catch (error) {
    console.error('Error in creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
