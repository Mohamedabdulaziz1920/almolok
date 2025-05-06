جميل جدًا! إليك شرح كل جزء من هذه التحديثات مع **تعليقات برمجية بالعربية** كما طلبت، وبأسلوب منظم وسهل للمراجعة لاحقًا.

---

## ✅ **أولاً: تثبيت الحزم**

```bash
# الحزم الأساسية لبايبال والبريد الإلكتروني
npm i resend @react-email/components @paypal/react-paypal-js --legacy-peer-deps

# الحزمة الخاصة بإنشاء قوالب بريد إلكتروني
npm i -D react-email --legacy-peer-deps

# إضافة عناصر تصميم UI
npx shadcn@latest add badge table
```

---

## ✅ **ثانيًا: ملف البيئة `.env.local`**

```env
# بيانات Resend API (لإرسال البريد الإلكتروني)
RESEND_API_KEY=xx
SENDER_EMAIL=onboarding@resend.dev
SENDER_NAME=support

# بيانات PayPal API
PAYPAL_API_URL=https://api-m.sandbox.paypal.com
PAYPAL_CLIENT_ID=xx
PAYPAL_APP_SECRET=xx
```

---

## ✅ **ثالثًا: تعديل `lib/constants.ts`**

```ts
// رابط الخادم
export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

// البريد الإلكتروني الافتراضي والاسم المرسل
export const SENDER_EMAIL = process.env.SENDER_EMAIL || 'onboarding@resend.dev'
export const SENDER_NAME = process.env.SENDER_NAME || APP_NAME
```

---

## ✅ **رابعًا: إنشاء قالب البريد الإلكتروني `emails/purchase-receipt.tsx`**

هذا الملف يُنشئ بريد إلكتروني يحتوي على تفاصيل الطلب:

```tsx
// استيراد مكونات البريد
import {
  Body, Column, Container, Head, Heading, Html, Img, Preview,
  Row, Section, Tailwind, Text,
} from '@react-email/components'

import { formatCurrency } from '@/lib/utils'
import { IOrder } from '@/lib/db/models/order.model'
import { SERVER_URL } from '@/lib/constants'

// النوع المستلم للبريد
type OrderInformationProps = { order: IOrder }

// بيانات تجريبية لعرض البريد محليًا
PurchaseReceiptEmail.PreviewProps = {
  order: { ... } as IOrder,
} satisfies OrderInformationProps

const dateFormatter = new Intl.DateTimeFormat('en', { dateStyle: 'medium' })

export default async function PurchaseReceiptEmail({ order }: OrderInformationProps) {
  return (
    <Html>
      <Preview>View order receipt</Preview>
      <Tailwind>
        <Head />
        <Body className='font-sans bg-white'>
          <Container className='max-w-xl'>
            <Heading>Purchase Receipt</Heading>

            {/* معلومات الطلب */}
            <Section>
              <Row>
                <Column><Text>Order ID</Text><Text>{order._id}</Text></Column>
                <Column><Text>Purchased On</Text><Text>{dateFormatter.format(order.createdAt)}</Text></Column>
                <Column><Text>Price Paid</Text><Text>{formatCurrency(order.totalPrice)}</Text></Column>
              </Row>
            </Section>

            {/* عناصر الطلب */}
            <Section className='border ...'>
              {order.items.map((item) => (
                <Row key={item.product}>
                  <Column className='w-20'>
                    <Img width='80' alt={item.name} src={item.image.startsWith('/') ? `${SERVER_URL}${item.image}` : item.image} />
                  </Column>
                  <Column><Text>{item.name} x {item.quantity}</Text></Column>
                  <Column align='right'><Text>{formatCurrency(item.price)}</Text></Column>
                </Row>
              ))}

              {/* الملخص المالي */}
              {[
                { name: 'Items', price: order.itemsPrice },
                { name: 'Tax', price: order.taxPrice },
                { name: 'Shipping', price: order.shippingPrice },
                { name: 'Total', price: order.totalPrice },
              ].map(({ name, price }) => (
                <Row key={name}>
                  <Column align='right'>{name}:</Column>
                  <Column align='right'><Text>{formatCurrency(price)}</Text></Column>
                </Row>
              ))}
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
```

---

## ✅ **خامسًا: إنشاء `emails/index.tsx`**

```ts
// إعداد الاتصال بـ Resend API
import { Resend } from 'resend'
import PurchaseReceiptEmail from './purchase-receipt'
import { IOrder } from '@/lib/db/models/order.model'
import { SENDER_EMAIL, SENDER_NAME } from '@/lib/constants'

const resend = new Resend(process.env.RESEND_API_KEY as string)

// دالة إرسال البريد الإلكتروني
export const sendPurchaseReceipt = async ({ order }: { order: IOrder }) => {
  await resend.emails.send({
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    to: (order.user as { email: string }).email,
    subject: 'Order Confirmation',
    react: <PurchaseReceiptEmail order={order} />,
  })
}
```

---

## ✅ **سادسًا: تحديث `package.json` لتشغيل السيرفر المحلي للبريد**

```json
"scripts": {
  ...
  "email": "email dev"
}
```

ثم شغله:

```bash
npm run email
```

---

## ✅ **سابعًا: تعديل أداة مساعدة في `lib/utils.ts`**

```ts
// إظهار آخر 6 أرقام من المعرف
export function formatId(id: string) {
  return `..${id.substring(id.length - 6)}`
}
```

---

## ✅ **ثامنًا: إنشاء `lib/paypal.ts`**

```ts
const base = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com'

export const paypal = {
  // إنشاء طلب جديد
  createOrder: async function (price: number) {
    const accessToken = await generateAccessToken()
    const url = `${base}/v2/checkout/orders`
    const response = await fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{ amount: { currency_code: 'USD', value: price } }],
      }),
    })
    return handleResponse(response)
  },

  // تأكيد الدفع
  capturePayment: async function (orderId: string) {
    const accessToken = await generateAccessToken()
    const url = `${base}/v2/checkout/orders/${orderId}/capture`
    const response = await fetch(url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return handleResponse(response)
  },
}

// إنشاء توكن الوصول من بايبال
async function generateAccessToken() {
  const { PAYPAL_CLIENT_ID, PAYPAL_APP_SECRET } = process.env
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_APP_SECRET}`).toString(
    'base64'
  )

  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: 'post',
    body: 'grant_type=client_credentials',
    headers: {
      Authorization: `Basic ${auth}`,
    },
  })

  const jsonData = await handleResponse(response)
  return jsonData.access_token
}

// التحقق من الاستجابة
async function handleResponse(response: any) {
  if (response.status === 200 || response.status === 201) {
    return response.json()
  }
  const errorMessage = await response.text()
  throw new Error(errorMessage)
}
```

---

أعتذر عن ذلك! إليك النص كاملاً مع التعليقات باللغة العربية كما طلبت:

## update lib/actions/order.actions.ts

```ts
-import Order from '../db/models/order.model'  // استيراد نموذج الطلب (Order) بدون تعريف الواجهة
import Order, { IOrder } from '../db/models/order.model'  // استيراد نموذج الطلب (Order) مع الواجهة (IOrder)
import { revalidatePath } from 'next/cache'  // استيراد دالة لإعادة التحقق من المسار
import { sendPurchaseReceipt } from '@/emails'  // استيراد دالة إرسال إيصال الشراء عبر البريد الإلكتروني
import { paypal } from '../paypal'  // استيراد إعدادات PayPal
export async function getOrderById(orderId: string): Promise<IOrder> {
  await connectToDatabase()  // الاتصال بقاعدة البيانات
  const order = await Order.findById(orderId)  // البحث عن الطلب باستخدام معرّف الطلب
  return JSON.parse(JSON.stringify(order))  // تحويل البيانات إلى JSON وإعادتها
}

export async function createPayPalOrder(orderId: string) {
  await connectToDatabase()  // الاتصال بقاعدة البيانات
  try {
    const order = await Order.findById(orderId)  // العثور على الطلب
    if (order) {
      const paypalOrder = await paypal.createOrder(order.totalPrice)  // إنشاء طلب PayPal
      order.paymentResult = {
        id: paypalOrder.id,
        email_address: '',  // عنوان البريد الإلكتروني
        status: '',  // حالة الدفع
        pricePaid: '0',  // المبلغ المدفوع
      }
      await order.save()  // حفظ التحديثات في قاعدة البيانات
      return {
        success: true,
        message: 'PayPal order created successfully',  // رسالة النجاح
        data: paypalOrder.id,  // إعادة معرف طلب PayPal
      }
    } else {
      throw new Error('Order not found')  // إذا لم يتم العثور على الطلب
    }
  } catch (err) {
    return { success: false, message: formatError(err) }  // معالجة الأخطاء
  }
}

export async function approvePayPalOrder(
  orderId: string,
  data: { orderID: string }
) {
  await connectToDatabase()  // الاتصال بقاعدة البيانات
  try {
    const order = await Order.findById(orderId).populate('user', 'email')  // العثور على الطلب مع البريد الإلكتروني للمستخدم
    if (!order) throw new Error('Order not found')  // إذا لم يتم العثور على الطلب

    const captureData = await paypal.capturePayment(data.orderID)  // استلام بيانات الدفع من PayPal
    if (
      !captureData ||
      captureData.id !== order.paymentResult?.id ||
      captureData.status !== 'COMPLETED'  // التحقق من حالة الدفع
    )
      throw new Error('Error in paypal payment')  // إذا كانت البيانات غير صحيحة
    order.isPaid = true  // تحديث حالة الدفع
    order.paidAt = new Date()  // تحديث تاريخ الدفع
    order.paymentResult = {
      id: captureData.id,
      status: captureData.status,
      email_address: captureData.payer.email_address,  // عنوان البريد الإلكتروني للمشتري
      pricePaid:
        captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value,  // المبلغ المدفوع
    }
    await order.save()  // حفظ التحديثات في قاعدة البيانات
    await sendPurchaseReceipt({ order })  // إرسال إيصال الشراء
    revalidatePath(`/account/orders/${orderId}`)  // إعادة التحقق من المسار
    return {
      success: true,
      message: 'Your order has been successfully paid by PayPal',  // رسالة نجاح الدفع
    }
  } catch (err) {
    return { success: false, message: formatError(err) }  // معالجة الأخطاء
  }
}
```

## create app/checkout/[id]/payment-form.tsx

```ts
'use client'  // إشارة إلى أن هذا المكون يعمل في الجهة العميلة فقط

import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from '@paypal/react-paypal-js'  // استيراد مكونات PayPal
import { Card, CardContent } from '@/components/ui/card'  // استيراد مكونات بطاقة العرض
import { useToast } from '@/hooks/use-toast'  // استيراد هوك التنبيهات
import {
  approvePayPalOrder,
  createPayPalOrder,
} from '@/lib/actions/order.actions'  // استيراد دوال التعامل مع طلبات PayPal
import { IOrder } from '@/lib/db/models/order.model'  // استيراد واجهة الطلب
import { formatDateTime } from '@/lib/utils'  // استيراد دالة تنسيق التاريخ والوقت

import CheckoutFooter from '../checkout-footer'  // استيراد تذييل الدفع
import { redirect, useRouter } from 'next/navigation'  // استيراد الدوال الخاصة بالتوجيه
import { Button } from '@/components/ui/button'  // استيراد مكون الزر
import ProductPrice from '@/components/shared/product/product-price'  // استيراد مكون عرض السعر

export default function OrderPaymentForm({
  order,
  paypalClientId,
}: {
  order: IOrder
  paypalClientId: string
  isAdmin: boolean
}) {
  const router = useRouter()  // تهيئة التوجيه
  const {
    shippingAddress,
    items,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentMethod,
    expectedDeliveryDate,
    isPaid,
  } = order  // استخراج بيانات الطلب
  const { toast } = useToast()  // تهيئة هوك التنبيهات

  if (isPaid) {
    redirect(`/account/orders/${order._id}`)  // إعادة توجيه المستخدم إذا كان الطلب مدفوعاً
  }
  function PrintLoadingState() {
    const [{ isPending, isRejected }] = usePayPalScriptReducer()  // استخدام هوك PayPal
    let status = ''
    if (isPending) {
      status = 'Loading PayPal...'  // حالة التحميل
    } else if (isRejected) {
      status = 'Error in loading PayPal.'  // حالة الخطأ
    }
    return status
  }
  const handleCreatePayPalOrder = async () => {
    const res = await createPayPalOrder(order._id)  // إنشاء طلب PayPal
    if (!res.success)
      return toast({
        description: res.message,
        variant: 'destructive',  // إذا حدث خطأ في إنشاء الطلب
      })
    return res.data  // إعادة معرف الطلب في PayPal
  }
  const handleApprovePayPalOrder = async (data: { orderID: string }) => {
    const res = await approvePayPalOrder(order._id, data)  // تأكيد الدفع عبر PayPal
    toast({
      description: res.message,
      variant: res.success ? 'default' : 'destructive',  // عرض التنبيه بناءً على النتيجة
    })
  }

  const CheckoutSummary = () => (
    <Card>
      <CardContent className='p-4'>
        <div>
          <div className='text-lg font-bold'>Order Summary</div>  // عنوان ملخص الطلب
          <div className='space-y-2'>
            <div className='flex justify-between'>
              <span>Items:</span>
              <span>
                {' '}
                <ProductPrice price={itemsPrice} plain />  // عرض سعر العناصر
              </span>
            </div>
            <div className='flex justify-between'>
              <span>Shipping & Handling:</span>
              <span>
                {shippingPrice === undefined ? (
                  '--'  // إذا لم يكن هناك سعر شحن
                ) : shippingPrice === 0 ? (
                  'FREE'  // إذا كان الشحن مجاني
                ) : (
                  <ProductPrice price={shippingPrice} plain />  // عرض سعر الشحن
                )}
              </span>
            </div>
            <div className='flex justify-between'>
              <span> Tax:</span>
              <span>
                {taxPrice === undefined ? (
                  '--'  // إذا لم يكن هناك ضريبة
                ) : (
                  <ProductPrice price={taxPrice} plain />  // عرض الضريبة
                )}
              </span>
            </div>
            <div className='flex justify-between  pt-1 font-bold text-lg'>
              <span> Order Total:</span>
              <span>
                {' '}
                <ProductPrice price={totalPrice} plain />  // عرض المجموع الكلي
              </span>
            </div>

            {!isPaid && paymentMethod === 'PayPal' && (
              <div>
                <PayPalScriptProvider options={{ clientId: paypalClientId }}>  // تهيئة PayPal
                  <PrintLoadingState />  // عرض حالة التحميل
                  <PayPalButtons
                    createOrder={handleCreatePayPalOrder}  // إنشاء طلب PayPal
                    onApprove={handleApprovePayPalOrder}  // الموافقة على الطلب
                  />
                </PayPalScriptProvider>
              </div>
            )}

            {!isPaid && paymentMethod === 'Cash On Delivery' && (
              <Button
                className='w-full rounded-full'
                onClick={() => router.push(`/account/orders/${order._id}`)}  // الانتقال إلى تفاصيل الطلب
              >
                View Order
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <main className='max-w-6xl mx-auto'>
      <div className='grid md:grid-cols-4 gap-6'>
        <div className='md:col-span-3'>
          {/* Shipping Address */}  // عنوان الشحن
          <div>
            <div className='grid md:grid-cols-3 my-3 pb-3'>
              <div className='text-lg font-bold'>
                <span>Shipping Address</span>  // نص العنوان
              </div>
              <div className='col-span-2'>
                <p>
                  {shippingAddress.fullName} <br />
                  {shippingAddress.street} <br />
                  {`${shippingAddress.city}, ${shippingAddress.province}, ${shippingAddress.postalCode}, ${shippingAddress.country}`}  // تنسيق العنوان
                </p>
              </div>
            </div>
          </div>

          {/* payment method */}  // طريقة الدفع
          <div className='border-y'>
            <div className='grid md:grid-cols-3 my-3 pb-3'>
              <div className='text-lg font-bold'>
                <span>Payment Method</span>  // نص طريقة الدفع
              </div>
              <div className='col-span-2'>
                <p>{paymentMethod}</p>  // عرض طريقة الدفع
              </div>
            </div>
          </div>

          <div className='grid md:grid-cols-3 my-3 pb-3'>
            <div className='flex text-lg font-bold'>
              <span>Items and shipping</span>  // عرض العناصر والشحن
            </div>
            <div className='col-span-2'>
              <p>
                Delivery date:
                {formatDateTime(expectedDeliveryDate).dateOnly}  // عرض تاريخ التسليم المتوقع
              </p>
              <ul>
                {items.map((item) => (  // عرض قائمة العناصر
                  <li key={item.slug}>
                    {item.name} x {item.quantity} = {item.price}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className

='py-4'>
            <CheckoutSummary />  // ملخص الدفع
          </div>
        </div>
      </div>
    </main>
  )
}
```

## create app/checkout/[id]/page.tsx

```ts
import { notFound } from 'next/navigation'  // استيراد دالة notFound من next/navigation
import React from 'react'  // استيراد مكتبة React

import { auth } from '@/auth'  // استيراد دالة auth من ملف auth
import { getOrderById } from '@/lib/actions/order.actions'  // استيراد دالة getOrderById من ملف order.actions
import PaymentForm from './payment-form'  // استيراد مكون PaymentForm من نفس المجلد

export const metadata = {  // تحديد بيانات الميتا الخاصة بالصفحة
  title: 'Payment',  // عنوان الصفحة
}

const CheckoutPaymentPage = async (props: {  // تعريف مكون CheckoutPaymentPage كدالة غير متزامنة
  params: Promise<{  // تعيين المعاملات التي تحتوي على id الطلب
    id: string  // المعرف المميز للطلب
  }>
}) => {
  const params = await props.params  // الانتظار حتى يتم الحصول على المعاملات
  const { id } = params  // استخراج id من المعاملات

  const order = await getOrderById(id)  // استرجاع بيانات الطلب باستخدام id
  if (!order) notFound()  // إذا لم يتم العثور على الطلب، يتم استدعاء دالة notFound

  const session = await auth()  // التحقق من جلسة المستخدم

  return (
    <PaymentForm  // عرض مكون PaymentForm
      order={order}  // تمرير بيانات الطلب إلى المكون
      paypalClientId={process.env.PAYPAL_CLIENT_ID || 'sb'}  // تمرير معرف عميل PayPal من المتغيرات البيئية
      isAdmin={session?.user?.role === 'Admin' || false}  // التحقق مما إذا كان المستخدم هو مسؤول
    />
  )
}

export default CheckoutPaymentPage  // تصدير مكون CheckoutPaymentPage
```

## create components/shared/order/order-details-form.tsx

```ts
'use client'  // تحديد أن هذا الملف يستخدم في بيئة العميل

import Image from 'next/image'  // استيراد مكون Image من next/image
import Link from 'next/link'  // استيراد مكون Link من next/link

import { Badge } from '@/components/ui/badge'  // استيراد مكون Badge من components/ui/badge
import { Card, CardContent } from '@/components/ui/card'  // استيراد Card و CardContent من components/ui/card
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'  // استيراد مكونات الجدول
import { IOrder } from '@/lib/db/models/order.model'  // استيراد واجهة IOrder من نموذج الطلب
import { cn, formatDateTime } from '@/lib/utils'  // استيراد دوال cn و formatDateTime من utils
import { buttonVariants } from '@/components/ui/button'  // استيراد دالة buttonVariants من components/ui/button
import ProductPrice from '../product/product-price'  // استيراد مكون ProductPrice من مكون المنتج

export default function OrderDetailsForm({  // تعريف مكون OrderDetailsForm
  order,  // تمرير بيانات الطلب
}: {
  order: IOrder  // نوع بيانات الطلب
  isAdmin: boolean  // التحقق مما إذا كان المستخدم هو مسؤول
}) {
  const {
    shippingAddress,  // عنوان الشحن
    items,  // العناصر في الطلب
    itemsPrice,  // سعر العناصر
    taxPrice,  // سعر الضرائب
    shippingPrice,  // سعر الشحن
    totalPrice,  // السعر الإجمالي
    paymentMethod,  // طريقة الدفع
    isPaid,  // حالة الدفع
    paidAt,  // تاريخ الدفع
    isDelivered,  // حالة التسليم
    deliveredAt,  // تاريخ التسليم
    expectedDeliveryDate,  // تاريخ التسليم المتوقع
  } = order  // استخراج بيانات الطلب

  return (
    <div className='grid md:grid-cols-3 md:gap-5'>  // تنسيق الشبكة لعرض البيانات
      <div className='overflow-x-auto md:col-span-2 space-y-4'>  // إعداد التنسيق الخاص بالقسم الأول
        <Card>  // مكون بطاقة لعرض بيانات العنوان
          <CardContent className='p-4 gap-4'>
            <h2 className='text-xl pb-4'>Shipping Address</h2>  // عنوان العنوان
            <p>
              {shippingAddress.fullName} {shippingAddress.phone}  // اسم العميل ورقم الهاتف
            </p>
            <p>
              {shippingAddress.street}, {shippingAddress.city},{' '}
              {shippingAddress.province}, {shippingAddress.postalCode},{' '}
              {shippingAddress.country}{' '}
            </p>

            {isDelivered ? (  // إذا تم التسليم، عرض علامة "تم التسليم"
              <Badge>
                Delivered at {formatDateTime(deliveredAt!).dateTime}  // تاريخ التسليم
              </Badge>
            ) : (
              <div>
                {' '}
                <Badge variant='destructive'>Not delivered</Badge>  // علامة "لم يتم التسليم"
                <div>
                  Expected delivery at{' '}
                  {formatDateTime(expectedDeliveryDate!).dateTime}  // تاريخ التسليم المتوقع
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>  // بطاقة لعرض معلومات الدفع
          <CardContent className='p-4 gap-4'>
            <h2 className='text-xl pb-4'>Payment Method</h2>
            <p>{paymentMethod}</p>
            {isPaid ? (
              <Badge>Paid at {formatDateTime(paidAt!).dateTime}</Badge>  // تاريخ الدفع
            ) : (
              <Badge variant='destructive'>Not paid</Badge>  // علامة "لم يتم الدفع"
            )}
          </CardContent>
        </Card>
        <Card>  // بطاقة لعرض العناصر في الطلب
          <CardContent className='p-4   gap-4'>
            <h2 className='text-xl pb-4'>Order Items</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (  // عرض العناصر في الطلب
                  <TableRow key={item.slug}>
                    <TableCell>
                      <Link
                        href={`/product/${item.slug}`}
                        className='flex items-center'
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={50}
                          height={50}
                        ></Image>
                        <span className='px-2'>{item.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className='px-2'>{item.quantity}</span>
                    </TableCell>
                    <TableCell className='text-right'>${item.price}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <div>  // القسم الخاص بإجمالي الطلب
        <Card>
          <CardContent className='p-4  space-y-4 gap-4'>
            <h2 className='text-xl pb-4'>Order Summary</h2>
            <div className='flex justify-between'>
              <div>Items</div>
              <div>
                {' '}
                <ProductPrice price={itemsPrice} plain />  // عرض سعر العناصر
              </div>
            </div>
            <div className='flex justify-between'>
              <div>Tax</div>
              <div>
                {' '}
                <ProductPrice price={taxPrice} plain />  // عرض سعر الضريبة
              </div>
            </div>
            <div className='flex justify-between'>
              <div>Shipping</div>
              <div>
                {' '}
                <ProductPrice price={shippingPrice} plain />  // عرض سعر الشحن
              </div>
            </div>
            <div className='flex justify-between'>
              <div>Total</div>
              <div>
                {' '}
                <ProductPrice price={totalPrice} plain />  // عرض السعر الإجمالي
              </div>
            </div>

            {!isPaid && ['Stripe', 'PayPal'].includes(paymentMethod) && (  // إذا لم يتم الدفع وطرق الدفع هي Stripe أو PayPal
              <Link
                className={cn(buttonVariants(), 'w-full')}  // تنسيق الزر
                href={`/checkout/${order._id}`}
              >
                Pay Order  // نص الزر
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

## create app/(root)/account/orders/[id]/page.tsx

```ts
import { notFound } from 'next/navigation'  // استيراد دالة notFound من next/navigation
import React from 'react'  // استيراد مكتبة React

import { auth } from '@/auth'  // استيراد دالة auth من ملف auth
import { getOrderById } from '@/lib/actions/order.actions'  // استيراد دالة getOrderById من ملف order.actions
import OrderDetailsForm from '@/components/shared/order/order-details-form'  // استيراد مكون OrderDetailsForm من ملف order-details-form
import Link from 'next/link'  // استيراد مكون Link من next/link
import { formatId } from '@/lib/utils'  // استيراد دالة formatId من utils

export async function generateMetadata(props: {  // دالة لتوليد البيانات الوصفية
  params: Promise<{ id: string }>  // المعاملات التي تحتوي على id الطلب
}) {
  const params = await props.params  // الانتظار حتى يتم الحصول على المعاملات

  return {
    title: `Order ${formatId(params.id)}`,  // توليد عنوان الصفحة باستخدام المعرف
  }
}

export default async function OrderDetailsPage(props: {  // مكون صفحة تفاصيل الطلب
  params: Promise<{  // المعاملات التي تحتوي على id الطلب
    id: string
  }>
}) {
  const params = await props.params  // الانتظار حتى يتم الحصول على المعاملات

  const { id } = params  // استخراج id من المعاملات

  const order = await getOrderById(id)  // استرجاع بيانات الطلب باستخدام id
  if (!order) notFound()  // إذا لم يتم العثور على الطلب، استدعاء دالة notFound

  const session = await auth()  // التحقق من جلسة المستخدم

  return (
    <>
      <div className='flex gap-2'>  // رابط العودة إلى حساب المستخدم
        <Link href='/account'>Your Account</Link>
        <span>›</span>
        <Link href='/account/orders'>Your Orders</Link>
        <span>›</span>
        <span>Order {formatId(order._id)}</span>  // عرض معرف الطلب
      </div>
      <h1 className='h1-bold py-4'>Order {formatId(order._id)}</h1>  // عنوان صفحة الطلب
      <OrderDetailsForm  // عرض مكون OrderDetailsForm
        order={order}  // تمرير بيانات الطلب إلى المكون
        isAdmin={session?.user?.role === 'Admin' || false}  // التحقق مما إذا كان المستخدم هو مسؤول
      />
    </>
  )
}
```

## create app/(root)/account/layout.tsx

```ts
import React from 'react'  // استيراد مكتبة React

export default async function AccountLayout({  // مكون تخطيط الحساب
  children,  // المحتوى المرسل للمكون
}: {
  children: React.ReactNode  // نوع البيانات للمحتوى
}) {
  return (
    <div className=' flex-1 p-4'>  // تنسيق الحاوية
      <div className='max-w-5xl mx-auto space-y-4'>{children}</div>  // تنسيق المحتوى الداخلي
    </div>
  )
}
```

## npm run build

- هذا الأمر يقوم ببناء المشروع وتحضير الملفات للنشر.

## update env variables on vercel

- تحديث المتغيرات البيئية على Vercel بما يتناسب مع البيئة الجديدة.

## commit changes and push to GitHub

- تنفيذ الأمر commit للتغييرات ثم دفع التعديلات إلى مستودع GitHub.

## go to https://nextjs-amazona.vercel.app

- الذهاب إلى رابط التطبيق على Vercel لمعاينة التغييرات.
