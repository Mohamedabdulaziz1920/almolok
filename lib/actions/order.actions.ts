'use server'

import { Cart, IOrderList } from '@/types'
import { formatError, round2 } from '../utils'
import { connectToDatabase } from '@/lib/db'
import { auth } from '@/auth'
import OrderModel from '../db/models/order.model'
import User from '../db/models/user.model'
import Product from '../db/models/product.model'
import mongoose from 'mongoose'
import { revalidatePath } from 'next/cache'
import { sendPurchaseReceipt } from '@/emails'
import { getSetting } from './setting.actions'

type DateRange = { from?: string; to?: string }

// الدوال الأساسية لإدارة الطلبات
export const createOrder = async (clientSideCart: Cart) => {
  try {
    await connectToDatabase()
    const session = await auth()
    const user = session?.user
    if (!user?.id) throw new Error('User not authenticated')

    const hasInvalidItems = clientSideCart.items.some(
      (item) => !item.playerId || typeof item.playerId !== 'string'
    )
    if (hasInvalidItems) {
      throw new Error('All items must have a valid Player ID')
    }

    const createdOrder = await createOrderFromCart(clientSideCart, user.id)
    return {
      success: true,
      message: 'Order placed successfully',
      data: { orderId: createdOrder._id.toString() },
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

const createOrderFromCart = async (clientSideCart: Cart, userId: string) => {
  await connectToDatabase()

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const itemsPrice = round2(
      clientSideCart.items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      )
    )
    const taxPrice = round2(itemsPrice * 0.15)
    const totalPrice = round2(itemsPrice + taxPrice)

    const user = await User.findById(userId).session(session)
    if (!user) throw new Error('User not found')

    const balance = round2(user.balance)
    if (balance < totalPrice) throw new Error('Insufficient balance')

    user.balance = round2(balance - totalPrice)
    await user.save({ session })

    const orderItems = clientSideCart.items.map((item) => ({
      product: item.product,
      name: item.name,
      slug: item.slug,
      category: item.category,
      playerId: item.playerId,
      quantity: item.quantity,
      countInStock: item.countInStock,
      image: item.image,
      price: item.price,
      clientId: item.clientId,
    }))

    const order = await OrderModel.create(
      [
        {
          user: userId,
          items: orderItems,
          paymentMethod: 'balance',
          itemsPrice,
          taxPrice,
          totalPrice,
          isPaid: true,
          paidAt: new Date(),
          balanceUsed: totalPrice,
          balance: user.balance,
          status: 'pending', // الحالة الافتراضية
        },
      ],
      { session }
    )

    await session.commitTransaction()
    session.endSession()

    return order[0]
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
}

// دوال حالة الطلب
export const updateOrderStatus = async (
  orderId: string,
  status: 'pending' | 'completed' | 'rejected'
) => {
  try {
    await connectToDatabase()
    const order = await OrderModel.findById(orderId)
    if (!order) throw new Error('Order not found')

    order.status = status
    await order.save()
    revalidatePath('/admin/orders')
    return { success: true }
  } catch (error) {
    console.error(`updateOrderStatus error (${status}):`, error)
    return { success: false, message: formatError(error) }
  }
}

export const markOrderAsCompleted = async (formData: FormData) => {
  const orderId = formData.get('orderId') as string
  return await updateOrderStatus(orderId, 'completed')
}

export const markOrderAsPending = async (formData: FormData) => {
  const orderId = formData.get('orderId') as string
  return await updateOrderStatus(orderId, 'pending')
}

export const rejectOrder = async (formData: FormData) => {
  const orderId = formData.get('orderId') as string
  return await updateOrderStatus(orderId, 'rejected')
}

// دوال الحصول على الطلبات
export const getAllOrders = async ({
  page = 1,
  limit,
}: {
  page?: number
  limit?: number
}) => {
  try {
    await connectToDatabase()
    const {
      common: { pageSize },
    } = await getSetting()
    const actualLimit = limit || pageSize
    const skip = (page - 1) * actualLimit

    const [orders, count] = await Promise.all([
      OrderModel.find()
        .populate('user', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(actualLimit),
      OrderModel.countDocuments(),
    ])

    return {
      success: true,
      data: JSON.parse(JSON.stringify(orders)) as IOrderList[],
      totalPages: Math.ceil(count / actualLimit),
      totalProducts: count,
      from: skip + 1,
      to: Math.min(skip + actualLimit, count),
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export const getOrderById = async (orderId: string) => {
  try {
    await connectToDatabase()
    const order = await OrderModel.findById(orderId).populate('user')
    if (!order) throw new Error('Order not found')
    return { success: true, data: JSON.parse(JSON.stringify(order)) }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// دوال إدارة الطلبات
export const deleteOrder = async (orderId: string) => {
  try {
    await connectToDatabase()
    const order = await OrderModel.findByIdAndDelete(orderId)
    if (!order) throw new Error('Order not found')
    revalidatePath('/admin/orders')
    return { success: true, message: 'Order deleted successfully' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export const updateOrderToPaid = async (orderId: string) => {
  try {
    await connectToDatabase()
    const order = await OrderModel.findById(orderId).populate(
      'user',
      'name email'
    )
    if (!order) throw new Error('Order not found')
    if (order.isPaid) throw new Error('Order is already paid')

    order.isPaid = true
    order.paidAt = new Date()
    await order.save()

    await updateProductStock(order._id)

    if (order.user?.email) await sendPurchaseReceipt({ order })
    revalidatePath(`/account/orders/${orderId}`)

    return { success: true, message: 'Order paid successfully' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

const updateProductStock = async (orderId: string) => {
  const session = await mongoose.connection.startSession()
  try {
    session.startTransaction()
    const order = await OrderModel.findById(orderId).session(session)
    if (!order) throw new Error('Order not found')

    for (const item of order.items) {
      const product = await Product.findById(item.product).session(session)
      if (!product) throw new Error('Product not found')
      product.countInStock -= item.quantity
      await product.save({ session })
    }

    await session.commitTransaction()
    session.endSession()
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    throw error
  }
}

// دوال التقارير والإحصائيات
export const getOrderSummary = async (dateRange: DateRange) => {
  try {
    await connectToDatabase()
    const { from, to } = dateRange
    const fromDate = from ? new Date(from) : new Date(0)
    const toDate = to ? new Date(to) : new Date()

    const paidOrders = await OrderModel.find({
      isPaid: true,
      paidAt: { $gte: fromDate, $lte: toDate },
    }).populate('user', 'name')

    const totalSales = paidOrders.reduce(
      (acc, order) => acc + order.totalPrice,
      0
    )

    const monthlySales = await OrderModel.aggregate([
      { $match: { isPaid: true, paidAt: { $gte: fromDate, $lte: toDate } } },
      {
        $group: { _id: { $month: '$paidAt' }, total: { $sum: '$totalPrice' } },
      },
      { $sort: { _id: 1 } },
    ])

    const [users, products] = await Promise.all([User.find(), Product.find()])

    return {
      success: true,
      data: {
        totalSales,
        ordersCount: paidOrders.length,
        usersCount: users.length,
        productsCount: products.length,
        monthlySales,
        latestOrders: paidOrders.slice(0, 5),
      },
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}
