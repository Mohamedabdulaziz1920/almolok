'use server'

import { Cart, IOrderList } from '@/types'
import { formatError, round2 } from '../utils'
import { connectToDatabase } from '@/lib/db'
import { auth } from '@/auth'
import { Order } from '../db/models/order.model'
import User from '../db/models/user.model'
import Product from '../db/models/product.model'
import mongoose from 'mongoose'
import { revalidatePath } from 'next/cache'
import { sendPurchaseReceipt } from '@/emails'
import { getSetting } from './setting.actions'
type DateRange = {
  from?: string
  to?: string
}

export const createOrder = async (clientSideCart: Cart) => {
  try {
    await connectToDatabase()
    const session = await auth()
    const user = session?.user

    if (!user || !user.id) throw new Error('User not authenticated')

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
  const hasInvalidItems = clientSideCart.items.some(
    (item) => !item.playerId || typeof item.playerId !== 'string'
  )
  if (hasInvalidItems) {
    throw new Error('All items must have a valid Player ID')
  }

  const itemsPrice = round2(
    clientSideCart.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    )
  )

  const taxPrice = round2(itemsPrice * 0.15)
  const totalPrice = round2(itemsPrice + taxPrice)

  const user = await User.findById(userId)
  if (!user) throw new Error('User not found')
  if (user.balance < totalPrice) throw new Error('Insufficient balance')

  // خصم الرصيد من المستخدم
  user.balance -= totalPrice
  await user.save()

  // بناء العناصر المطلوبة بتفاصيل كاملة
  const orderItems = clientSideCart.items.map((item) => ({
    product: item.product, // معرف المنتج
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

  const order = await Order.create({
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
  })

  return order
}

export async function updateOrderToPaid(orderId: string) {
  try {
    await connectToDatabase()
    const order = await Order.findById(orderId).populate('user', 'name email')
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
    const order = await Order.findById(orderId).session(session)
    if (!order) throw new Error('Order not found')

    for (const item of order.items) {
      const product = await Product.findById(item.productId).session(session)
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
    const res = await Order.findByIdAndDelete(id)
    if (!res) throw new Error('Order not found')
    revalidatePath('/admin/orders')
    return {
      success: true,
      message: 'Order deleted successfully',
    }
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
  const skipAmount = (Number(page) - 1) * limit

  const [orders, ordersCount] = await Promise.all([
    Order.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .skip(skipAmount)
      .limit(limit),
    Order.countDocuments(),
  ])

  return {
    data: JSON.parse(JSON.stringify(orders)) as IOrderList[],
    totalPages: Math.ceil(ordersCount / limit),
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
  const userId = session?.user?.id
  if (!userId) throw new Error('User is not authenticated')

  const skipAmount = (Number(page) - 1) * limit

  const [orders, ordersCount] = await Promise.all([
    Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skipAmount)
      .limit(limit),
    Order.countDocuments({ user: userId }),
  ])

  return {
    data: JSON.parse(JSON.stringify(orders)),
    totalPages: Math.ceil(ordersCount / limit),
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
  const skipAmount = (Number(page) - 1) * limit

  const [orders, ordersCount] = await Promise.all([
    Order.find({ 'items.playerId': playerId })
      .sort({ createdAt: -1 })
      .skip(skipAmount)
      .limit(limit),
    Order.countDocuments({ 'items.playerId': playerId }),
  ])

  return {
    data: JSON.parse(JSON.stringify(orders)),
    totalPages: Math.ceil(ordersCount / limit),
  }
}

export async function getOrderById(orderId: string) {
  await connectToDatabase()
  const order = await Order.findById(orderId)
  if (!order) throw new Error('Order not found')
  return JSON.parse(JSON.stringify(order))
}

export async function getOrderSummary(dateRange: DateRange) {
  await connectToDatabase()

  const { from, to } = dateRange
  const fromDate = from ? new Date(from) : new Date(0)
  const toDate = to ? new Date(to) : new Date()

  const paidOrders = await Order.find({
    isPaid: true,
    paidAt: {
      $gte: fromDate,
      $lte: toDate,
    },
  }).populate('user', 'name')

  const totalSales = paidOrders.reduce(
    (acc, order) => acc + order.totalPrice,
    0
  )

  const monthlySales = await Order.aggregate([
    {
      $match: {
        isPaid: true,
        paidAt: { $gte: fromDate, $lte: toDate },
      },
    },
    {
      $group: {
        _id: { $month: '$paidAt' },
        total: { $sum: '$totalPrice' },
      },
    },
    { $sort: { _id: 1 } },
  ])

  const topSalesProducts = await Order.aggregate([
    { $match: { isPaid: true, paidAt: { $gte: fromDate, $lte: toDate } } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.name',
        total: { $sum: '$items.quantity' },
      },
    },
    { $sort: { total: -1 } },
    { $limit: 5 },
  ])

  const topSalesCategories = await Order.aggregate([
    { $match: { isPaid: true, paidAt: { $gte: fromDate, $lte: toDate } } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.category',
        total: { $sum: '$items.quantity' },
      },
    },
    { $sort: { total: -1 } },
    { $limit: 5 },
  ])

  const salesChartData = await Order.aggregate([
    {
      $match: {
        isPaid: true,
        paidAt: { $gte: fromDate, $lte: toDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$paidAt' },
        },
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

export async function markOrderAsCompleted(orderId: string) {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: 'completed' },
      { new: true }
    )
    return updatedOrder
  } catch (error) {
    console.error('Error marking order as completed:', error)
    throw new Error('تعذر تحديث حالة الطلب إلى مكتمل')
  }
}

export async function rejectOrder(orderId: string) {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: 'rejected' },
      { new: true }
    )
    return updatedOrder
  } catch (error) {
    console.error('Error rejecting order:', error)
    throw new Error('تعذر تحديث حالة الطلب إلى مرفوض')
  }
}

export async function markOrderAsPending(orderId: string) {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: 'pending' },
      { new: true }
    )
    return updatedOrder
  } catch (error) {
    console.error('Error setting order to pending:', error)
    throw new Error('تعذر تحديث حالة الطلب إلى قيد المعالجة')
  }
}
