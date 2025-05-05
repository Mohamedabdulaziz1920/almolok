import { Schema, model, models, Document } from 'mongoose'

export interface IPackage extends Document {
  name: string
  slug: string
  price: number
  image: string
  description: string
  currency: 'USD' | 'SAR' | 'YER'
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

const packageSchema = new Schema<IPackage>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    description: { type: String },
    currency: {
      type: String,
      enum: ['USD', 'SAR', 'YER'],
      default: 'USD',
      required: true,
    },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
)

const PackageModel = models.Package || model<IPackage>('Package', packageSchema)
export default PackageModel
