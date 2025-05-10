import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import Order from '@/lib/db/models/order.model'
import User from '@/lib/db/models/user.model'
import mongoose from 'mongoose'

export const POST = async (request: NextRequest) => {
  try {
    await connectToDatabase()

    const {
      userId,
      orderItems,
      totalAmount,
      paymentMethod: rawPaymentMethod,
    } = await request.json()

    const paymentMethod = ['wallet', 'balance'].includes(rawPaymentMethod)
      ? 'balance'
      : rawPaymentMethod
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

    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    if (paymentMethod === 'balance') {
      if (!user.balance || user.balance < totalAmount) {
        return NextResponse.json(
          { error: 'Insufficient balance' },
          { status: 400 }
        )
      }

      user.balance -= totalAmount
      await user.save()
    }

    const newOrder = new Order({
      user: new mongoose.Types.ObjectId(userId),
      items: orderItems,
      paymentMethod,
      itemsPrice: totalAmount,
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
