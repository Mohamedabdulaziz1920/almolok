// models/balanceRequest.model.ts
import { Schema, model } from 'mongoose'

const BalanceRequestSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  reason: { type: String },
  paymentMethod: { type: String },
  createdAt: { type: Date, default: Date.now },
})

export default model('BalanceRequest', BalanceRequestSchema)
