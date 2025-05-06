## update `lib/validator.ts`

```ts
// تعريف نوع معرف MongoDB والتحقق من صحته باستخدام تعبير منتظم
const MongoId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid MongoDB ID' })

// تعريف مخطط التحقق من صحة بيانات الطلب (Order)
export const OrderInputSchema = z.object({
  user: z.union([
    MongoId, // يمكن أن يكون المستخدم معرف MongoDB
    z.object({
      name: z.string(), // أو كائن يحتوي على الاسم والبريد
      email: z.string().email(),
    }),
  ]),
  items: z
    .array(OrderItemSchema) // مصفوفة من عناصر الطلب
    .min(1, 'Order must contain at least one item'), // يجب أن تحتوي على عنصر واحد على الأقل
  shippingAddress: ShippingAddressSchema, // عنوان الشحن
  paymentMethod: z.string().min(1, 'Payment method is required'), // طريقة الدفع مطلوبة
  paymentResult: z
    .object({
      id: z.string(),
      status: z.string(),
      email_address: z.string(),
      pricePaid: z.string(),
    })
    .optional(), // نتائج الدفع اختيارية
  itemsPrice: Price('Items price'), // سعر العناصر
  shippingPrice: Price('Shipping price'), // سعر الشحن
  taxPrice: Price('Tax price'), // الضريبة
  totalPrice: Price('Total price'), // السعر الإجمالي
  expectedDeliveryDate: z.date().refine(
    (value) => value > new Date(), // يجب أن يكون تاريخ التسليم المتوقع في المستقبل
    'Expected delivery date must be in the future'
  ),
  isDelivered: z.boolean().default(false), // حالة التسليم الافتراضية
  deliveredAt: z.date().optional(), // تاريخ التسليم إن وُجد
  isPaid: z.boolean().default(false), // حالة الدفع الافتراضية
  paidAt: z.date().optional(), // تاريخ الدفع إن وُجد
})
```

---

## update `types/index.ts`

```ts
  OrderInputSchema, // تصدير المخطط الخاص بالطلب
export type IOrderInput = z.infer<typeof OrderInputSchema> // استخراج نوع TypeScript من المخطط
```

---

## create `lib/db/models/order.model.ts`

```ts
import { IOrderInput } from '@/types' // استيراد نوع بيانات الطلب
import { Document, Model, model, models, Schema } from 'mongoose'

// تعريف واجهة الطلب مع توارث الخصائص من Mongoose و IOrderInput
export interface IOrder extends Document, IOrderInput {
  _id: string
  createdAt: Date
  updatedAt: Date
}

// تعريف مخطط الطلب في قاعدة البيانات
const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId as unknown as typeof String, // معرف المستخدم
      ref: 'User',
      required: true,
    },
    items: [
      // عناصر الطلب
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        clientId: { type: String, required: true },
        name: { type: String, required: true },
        slug: { type: String, required: true },
        image: { type: String, required: true },
        category: { type: String, required: true },
        price: { type: Number, required: true },
        countInStock: { type: Number, required: true },
        quantity: { type: Number, required: true },
        size: { type: String },
        color: { type: String },
      },
    ],
    shippingAddress: {
      // عنوان الشحن
      fullName: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      province: { type: String, required: true },
      phone: { type: String, required: true },
    },
    expectedDeliveryDate: { type: Date, required: true }, // تاريخ التسليم المتوقع
    paymentMethod: { type: String, required: true }, // طريقة الدفع
    paymentResult: { id: String, status: String, email_address: String }, // تفاصيل الدفع
    itemsPrice: { type: Number, required: true }, // سعر العناصر
    shippingPrice: { type: Number, required: true }, // سعر الشحن
    taxPrice: { type: Number, required: true }, // الضريبة
    totalPrice: { type: Number, required: true }, // السعر الإجمالي
    isPaid: { type: Boolean, required: true, default: false }, // حالة الدفع
    paidAt: { type: Date }, // تاريخ الدفع
    isDelivered: { type: Boolean, required: true, default: false }, // حالة التسليم
    deliveredAt: { type: Date }, // تاريخ التسليم
    createdAt: { type: Date, default: Date.now }, // تاريخ الإنشاء
  },
  {
    timestamps: true, // إضافة createdAt و updatedAt تلقائياً
  }
)

// إنشاء النموذج أو استخدام الموجود مسبقاً
const Order =
  (models.Order as Model<IOrder>) || model<IOrder>('Order', orderSchema)

export default Order // تصدير النموذج
```

---

## update `lib/actions/order.actions.ts`

```ts
// import غير مستخدم تم حذفه
// 'use server' لجعل الدالة تعمل في بيئة الخادم

import { Cart, OrderItem, ShippingAddress } from '@/types' // استيراد الأنواع اللازمة
import { formatError, round2 } from '../utils' // أدوات مساعدة
import { connectToDatabase } from '../db' // الاتصال بقاعدة البيانات
import { auth } from '@/auth' // التحقق من جلسة المستخدم
import { OrderInputSchema } from '../validator' // مخطط التحقق من الطلب
import Order from '../db/models/order.model' // نموذج الطلب من قاعدة البيانات

// دالة لإنشاء الطلب من جانب الخادم
export const createOrder = async (clientSideCart: Cart) => {
  try {
    await connectToDatabase() // الاتصال بقاعدة البيانات
    const session = await auth() // التحقق من جلسة المستخدم
    if (!session) throw new Error('User not authenticated') // إذا لم يكن هناك جلسة، يتم رفض العملية

    // إعادة حساب الأسعار وتاريخ التسليم على الخادم
    const createdOrder = await createOrderFromCart(
      clientSideCart,
      session.user.id!
    )
    return {
      success: true,
      message: 'Order placed successfully', // تم إنشاء الطلب بنجاح
      data: { orderId: createdOrder._id.toString() }, // إرجاع معرف الطلب
    }
  } catch (error) {
    return { success: false, message: formatError(error) } // إرجاع الخطأ في حال الفشل
  }
}

// دالة فرعية لإنشاء الطلب من بيانات السلة
export const createOrderFromCart = async (
  clientSideCart: Cart,
  userId: string
) => {
  const cart = {
    ...clientSideCart,
    ...calcDeliveryDateAndPrice({
      // حساب السعر وتاريخ التوصيل
      items: clientSideCart.items,
      shippingAddress: clientSideCart.shippingAddress,
      deliveryDateIndex: clientSideCart.deliveryDateIndex,
    }),
  }

  // التحقق من صحة الطلب باستخدام OrderInputSchema
  const order = OrderInputSchema.parse({
    user: userId,
    items: cart.items,
    shippingAddress: cart.shippingAddress,
    paymentMethod: cart.paymentMethod,
    itemsPrice: cart.itemsPrice,
    shippingPrice: cart.shippingPrice,
    taxPrice: cart.taxPrice,
    totalPrice: cart.totalPrice,
    expectedDeliveryDate: cart.expectedDeliveryDate,
  })

  return await Order.create(order) // إنشاء الطلب في قاعدة البيانات
}
```

---

## update `app/checkout/checkout-form.tsx`

```ts
import { createOrder } from '@/lib/actions/order.actions' // استيراد دالة إنشاء الطلب
import { toast } from '@/hooks/use-toast' // استيراد التنبيهات
    clearCart, // دالة لتفريغ السلة بعد الطلب

    // تنفيذ طلب الشراء
    const res = await createOrder({
      items, // عناصر السلة
      shippingAddress, // عنوان الشحن
      expectedDeliveryDate: calculateFutureDate(
        AVAILABLE_DELIVERY_DATES[deliveryDateIndex!].daysToDeliver // حساب تاريخ التسليم بناءً على الاختيار
      ),
      deliveryDateIndex, // مؤشر تاريخ التوصيل
      paymentMethod, // طريقة الدفع
      itemsPrice, // سعر العناصر
      shippingPrice, // سعر الشحن
      taxPrice, // الضريبة
      totalPrice, // المجموع الكلي
    })

    // معالجة النتيجة
    if (!res.success) {
      toast({
        description: res.message, // عرض رسالة الخطأ
        variant: 'destructive', // نمط خطأ
      })
    } else {
      toast({
        description: res.message, // عرض رسالة النجاح
        variant: 'default',
      })
      clearCart() // تفريغ السلة
      router.push(`/checkout/${res.data?.orderId}`) // التوجيه إلى صفحة تأكيد الطلب
    }
```

---

## أوامر تنفيذية

```bash
# بناء المشروع
npm run build

# رفع التعديلات إلى GitHub
commit changes and push to GitHub

# فتح التطبيق على الرابط التالي
go to https://nextjs-amazona.vercel.app
```

---
