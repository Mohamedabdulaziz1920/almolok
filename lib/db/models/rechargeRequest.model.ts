import mongoose from 'mongoose'

const RechargeRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
  },
  { timestamps: true }
)

export default mongoose.models.RechargeRequest ||
  mongoose.model('RechargeRequest', RechargeRequestSchema)
