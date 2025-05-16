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
import type { DateRange } from 'react-day-picker'

type DateRange = {
  from: Date
  to: Date
}

export async function getOrderSommary(date: DateRange) {
  await connectToDatabase()

  const [ordersCount, productsCount, usersCount] = await Promise.all([
    OrderModel.countDocuments({ createdAt: { $gte: date.from, $lte: date.to } }),
    Product.countDocuments({ createdAt: { $gte: date.from, $lte: date.to } }),
    User.countDocuments({ createdAt: { $gte: date.from, $lte: date.to } }),
  ])

  const totalSalesResult = await OrderModel.aggregate([
    {
      $match: {
        createdAt: { $gte: date.from, $lte: date.to },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$totalPrice' },
      },
    },
    {
      $project: {
        _id: 0,
        totalSales: { $ifNull: ['$total', 0] },
      },
    },
  ])
  const totalSales = totalSalesResult[0]?.totalSales || 0

  const today = new Date()
  const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1)

  const monthlySales = await OrderModel.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        totalSales: { $sum: '$totalPrice' },
      },
    },
    {
      $project: {
        _id: 0,
        label: '$_id',
        value: '$totalSales',
      },
    },
    { $sort: { label: 1 } },
  ])

  const [topSalesCategories, topSalesProducts, salesChartData, latestOrdersRaw] = await Promise.all([
    getTopSalesCategories(date),
    getTopSalesProducts(date),
    getSalesChartData(date),
    OrderModel.find({ createdAt: { $gte: date.from, $lte: date.to } })
      .populate('user', 'name')
      .sort({ createdAt: -1 }),
  ])

  return {
    ordersCount,
    productsCount,
    usersCount,
    totalSales,
    monthlySales,
    salesChartData,
    topSalesCategories,
    topSalesProducts,
    latestOrders: JSON.parse(JSON.stringify(latestOrdersRaw)) as IOrderList[],
  }
}

async function getSalesChartData(date: DateRange) {
  return OrderModel.aggregate([
    {
      $match: {
        createdAt: { $gte: date.from, $lte: date.to },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        },
        totalSales: { $sum: '$totalPrice' },
      },
    },
    {
      $project: {
        _id: 0,
        date: {
          $concat: [
            { $toString: '$_id.year' }, '/',
            { $toString: '$_id.month' }, '/',
            { $toString: '$_id.day' },
          ],
        },
        totalSales: 1,
      },
    },
    { $sort: { date: 1 } },
  ])
}

async function getTopSalesProducts(date: DateRange) {
  return OrderModel.aggregate([
    {
      $match: {
        createdAt: { $gte: date.from, $lte: date.to },
      },
    },
    { $unwind: '$items' },
    {
      $group: {
        _id: {
          id: '$items.product',
          name: '$items.name',
          image: '$items.image',
        },
        totalSales: {
          $sum: { $multiply: ['$items.quantity', '$items.price'] },
        },
      },
    },
    { $sort: { totalSales: -1 } },
    { $limit: 6 },
    {
      $project: {
        _id: 0,
        id: '$_id.id',
        label: '$_id.name',
        image: '$_id.image',
        value: '$totalSales',
      },
    },
  ])
}

async function getTopSalesCategories(date: DateRange, limit = 5) {
  return OrderModel.aggregate([
    {
      $match: {
        createdAt: { $gte: date.from, $lte: date.to },
      },
    },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.category',
        totalSales: { $sum: '$items.quantity' },
      },
    },
    { $sort: { totalSales: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        id: '$_id',
        value: '$totalSales',
      },
    },
  ])
}


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

export const createOrderFromCart = async (clientSideCart: Cart, userId: string) => {
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
    })
      .populate('user', 'name')
      .populate({
        path: 'orderItems.product',
        populate: { path: 'category' },
      })

    const totalSales = paidOrders.reduce(
      (acc, order) => acc + order.totalPrice,
      0
    )

    const monthlySales = await OrderModel.aggregate([
      { $match: { isPaid: true, paidAt: { $gte: fromDate, $lte: toDate } } },
      {
        $group: {
          _id: { $month: '$paidAt' },
          total: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ])

    const [users, products] = await Promise.all([User.find(), Product.find()])

    // 🔥 تجميع المنتجات حسب الكمية
    const productSalesMap: Record<string, { name: string; count: number }> = {}

    paidOrders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const product = item.product
        if (product) {
          if (!productSalesMap[product._id]) {
            productSalesMap[product._id] = {
              name: product.name,
              count: item.quantity,
            }
          } else {
            productSalesMap[product._id].count += item.quantity
          }
        }
      })
    })

    const topProducts = Object.entries(productSalesMap)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([_, data]) => data)

    // 🔥 تجميع الفئات حسب مبيعات المنتجات المرتبطة بها
    const categorySalesMap: Record<string, { name: string; total: number }> = {}

    paidOrders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const product = item.product
        if (product?.category) {
          const categoryId = product.category._id
          const categoryName = product.category.name
          const itemTotal = item.price * item.quantity

          if (!categorySalesMap[categoryId]) {
            categorySalesMap[categoryId] = {
              name: categoryName,
              total: itemTotal,
            }
          } else {
            categorySalesMap[categoryId].total += itemTotal
          }
        }
      })
    })

    const topCategories = Object.entries(categorySalesMap)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 5)
      .map(([_, data]) => data)

    return {
      success: true,
      data: {
        totalSales,
        ordersCount: paidOrders.length,
        usersCount: users.length,
        productsCount: products.length,
        monthlySales,
        latestOrders: paidOrders.slice(0, 5),
        topProducts,
        topCategories,
      },
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
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
export async function getOrderSumary(dateRange: DateRange) {
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
