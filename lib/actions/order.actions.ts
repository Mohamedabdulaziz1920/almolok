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

export const createOrderFromCart = async (
  clientSideCart: Cart,
  userId: string
) => {
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

export async function updateOrderToPaid(orderId: string) {
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
  } catch (err) {
    return { success: false, message: formatError(err) }
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

export async function deleteOrder(id: string) {
  try {
    await connectToDatabase()
    const res = await OrderModel.findByIdAndDelete(id)
    if (!res) throw new Error('Order not found')
    revalidatePath('/admin/orders')
    return { success: true, message: 'Order deleted successfully' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export async function getAllOrders({
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
  const skip = (page - 1) * limit

  const [orders, count] = await Promise.all([
    OrderModel.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    OrderModel.countDocuments(),
  ])

  return {
    data: JSON.parse(JSON.stringify(orders)) as IOrderList[],
    totalPages: Math.ceil(count / limit),
  }
}

export async function getMyOrders({
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
  const session = await auth()
  const userId = session?.user?._id
  if (!userId) throw new Error('User not authenticated')

  const skip = (page - 1) * limit
  const [orders, count] = await Promise.all([
    OrderModel.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    OrderModel.countDocuments({ user: userId }),
  ])

  return {
    data: JSON.parse(JSON.stringify(orders)),
    totalPages: Math.ceil(count / limit),
  }
}

export async function getOrdersByPlayerId(
  playerId: string,
  { limit, page }: { limit?: number; page: number }
) {
  const {
    common: { pageSize },
  } = await getSetting()
  limit = limit || pageSize
  await connectToDatabase()
  const skip = (page - 1) * limit

  const [orders, count] = await Promise.all([
    OrderModel.find({ 'items.playerId': playerId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    OrderModel.countDocuments({ 'items.playerId': playerId }),
  ])

  return {
    data: JSON.parse(JSON.stringify(orders)),
    totalPages: Math.ceil(count / limit),
  }
}

export async function getOrderById(orderId: string) {
  await connectToDatabase()
  const order = await OrderModel.findById(orderId).populate('user') // ✅ هذا السطر مهم
  if (!order) throw new Error('Order not found')
  return JSON.parse(JSON.stringify(order))
}

export async function getOrderSummary(dateRange: DateRange) {
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
    { $group: { _id: { $month: '$paidAt' }, total: { $sum: '$totalPrice' } } },
    { $sort: { _id: 1 } },
  ])

  const topSalesProducts = await OrderModel.aggregate([
    { $match: { isPaid: true, paidAt: { $gte: fromDate, $lte: toDate } } },
    { $unwind: '$items' },
    { $group: { _id: '$items.name', total: { $sum: '$items.quantity' } } },
    { $sort: { total: -1 } },
    { $limit: 5 },
  ])

  const topSalesCategories = await OrderModel.aggregate([
    { $match: { isPaid: true, paidAt: { $gte: fromDate, $lte: toDate } } },
    { $unwind: '$items' },
    { $group: { _id: '$items.category', total: { $sum: '$items.quantity' } } },
    { $sort: { total: -1 } },
    { $limit: 5 },
  ])

  const salesChartData = await OrderModel.aggregate([
    { $match: { isPaid: true, paidAt: { $gte: fromDate, $lte: toDate } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } },
        total: { $sum: '$totalPrice' },
      },
    },
    { $sort: { _id: 1 } },
  ])

  const [users, products] = await Promise.all([User.find(), Product.find()])

  return {
    totalSales,
    ordersCount: paidOrders.length,
    usersCount: users.length,
    productsCount: products.length,
    monthlySales,
    topSalesProducts,
    topSalesCategories,
    latestOrders: paidOrders.slice(0, 5),
    salesChartData,
  }
}

export const markOrderAsCompleted = async (orderId: string) => {
  try {
    const order = await OrderModel.findById(orderId)
    if (!order) throw new Error('Order not found')
    order.status = 'completed'
    await order.save()
    return { success: true }
  } catch (error) {
    console.error('markOrderAsCompleted error:', error)
    return { success: false }
  }
}

export const markOrderAsPending = async (orderId: string) => {
  try {
    const order = await OrderModel.findById(orderId)
    if (!order) throw new Error('Order not found')
    order.status = 'pending'
    await order.save()
    return { success: true }
  } catch (error) {
    console.error('markOrderAsPending error:', error)
    return { success: false }
  }
}

export const rejectOrder = async (orderId: string) => {
  try {
    const order = await OrderModel.findById(orderId)
    if (!order) throw new Error('Order not found')
    order.status = 'rejected'
    await order.save()
    return { success: true }
  } catch (error) {
    console.error('rejectOrder error:', error)
    return { success: false }
  }
}
