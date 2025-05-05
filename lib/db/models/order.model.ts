import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IOrderItem {
  product: Types.ObjectId
  name: string
  slug: string
  category: string
  playerId: string
  quantity: number
  countInStock: number
  image: string
  price: number
  clientId: string
}

export interface IOrder extends Document {
  _id: string
  user: Types.ObjectId
  items: IOrderItem[]
  paymentMethod: 'balance'
  itemsPrice: number
  taxPrice: number
  totalPrice: number
  isPaid: boolean
  paidAt: Date
  isDelivered: boolean
  deliveredAt?: Date
  balanceUsed?: number
  balance?: number
  status: 'pending' | 'completed' | 'rejected'
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    category: { type: String, required: true },
    playerId: { type: String, required: true },
    quantity: { type: Number, required: true },
    countInStock: { type: Number, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    clientId: { type: String, required: true },
  },
  { _id: false }
)

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [OrderItemSchema],
    paymentMethod: { type: String, enum: ['balance'], required: true },
    itemsPrice: { type: Number, required: true },
    taxPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    balanceUsed: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'completed', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
)

const OrderModel =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema)

export default OrderModel
