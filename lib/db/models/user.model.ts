import { IUserInput } from '@/types'
import { Document, model, models, Schema } from 'mongoose'

// تعريف واجهة الـ User
export interface IUser extends Document, IUserInput {
  _id: string
  createdAt: Date
  updatedAt: Date
}

// تعريف الـ Schema لملف المستخدم
const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true }, // تأكيد أن البريد الإلكتروني فريد
    name: { type: String, required: true }, // الاسم مطلوب
    role: { type: String, required: true, default: 'User' }, // تعيين الدور الافتراضي للمستخدم
    password: { type: String }, // كلمة المرور (قد تكون null إذا لم يتم تعيينها)
    image: { type: String }, // صورة المستخدم
    emailVerified: { type: Boolean, default: false }, // التحقق من البريد الإلكتروني
    balance: { type: Number, default: 0 }, // رصيد المستخدم
  },
  {
    timestamps: true, // لتخزين createdAt و updatedAt تلقائيًا
  }
)

// تأكد من أن الـ Model يتم تعريفه بشكل صحيح باستخدام models لتجنب مشاكل إعادة التعريف
const User = models.User || model<IUser>('User', userSchema)

export default User