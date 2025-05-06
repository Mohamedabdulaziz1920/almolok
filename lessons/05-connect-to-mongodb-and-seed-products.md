# 05-connect-to-mongodb-and-seed-products

1. create mongodb database on mongodb.com
2. get mongodb connection string and put it in .env.local as MONGODB_URI
3. npm i mongoose
4. lib/db/index.ts

```ts
// هذا الملف يحتوي على وظيفة الاتصال بقاعدة بيانات MongoDB
import mongoose from 'mongoose'

// تخزين مؤقت لاتصال mongoose لتفادي اتصالات متعددة
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cached = (global as any).mongoose || { conn: null, promise: null }

// وظيفة الاتصال بقاعدة البيانات
export const connectToDatabase = async (
  MONGODB_URI = process.env.MONGODB_URI
) => {
  // إذا كان هناك اتصال موجود بالفعل، نعيده
  if (cached.conn) return cached.conn

  // إذا لم يكن هناك رابط اتصال، نرمي خطأ
  if (!MONGODB_URI) throw new Error('MONGODB_URI is missing')

  // إنشاء اتصال جديد إذا لم يكن هناك اتصال قيد الانتظار
  cached.promise = cached.promise || mongoose.connect(MONGODB_URI)

  // انتظار اكتمال الاتصال
  cached.conn = await cached.promise

  return cached.conn
}
```

5. lib/utils.ts

```ts
// وظيفة لتنسيق الأرقام مع منزلتين عشريتين
export const formatNumberWithDecimal = (num: number): string => {
  const [int, decimal] = num.toString().split('.')
  return decimal ? `${int}.${decimal.padEnd(2, '0')}` : int
}

// وظيفة لتحويل النص إلى slug (عنوان URL صديق)
export const toSlug = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]+/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
```

6. npm i zod
7. lib/validator.ts

```ts
// هذا الملف يحتوي على مخططات التحقق من صحة البيانات باستخدام Zod
import { z } from 'zod'
import { formatNumberWithDecimal } from './utils'

// دالة مساعدة للتحقق من صحة الأسعار
const Price = (field: string) =>
  z.coerce
    .number()
    .refine(
      (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(value)),
      `${field} must have exactly two decimal places (e.g., 49.99)`
    )

// مخطط تحقق من صحة بيانات المنتج
export const ProductInputSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  category: z.string().min(1, 'Category is required'),
  images: z.array(z.string()).min(1, 'Product must have at least one image'),
  brand: z.string().min(1, 'Brand is required'),
  description: z.string().min(1, 'Description is required'),
  isPublished: z.boolean(),
  price: Price('Price'),
  listPrice: Price('List price'),
  countInStock: z.coerce
    .number()
    .int()
    .nonnegative('count in stock must be a non-negative number'),
  tags: z.array(z.string()).default([]),
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  avgRating: z.coerce
    .number()
    .min(0, 'Average rating must be at least 0')
    .max(5, 'Average rating must be at most 5'),
  numReviews: z.coerce
    .number()
    .int()
    .nonnegative('Number of reviews must be a non-negative number'),
  ratingDistribution: z
    .array(z.object({ rating: z.number(), count: z.number() }))
    .max(5),
  reviews: z.array(z.string()).default([]),
  numSales: z.coerce
    .number()
    .int()
    .nonnegative('Number of sales must be a non-negative number'),
})
```

8. types/index.ts

```ts
// هذا الملف يحتوي على تعريفات الأنواع
import { ProductInputSchema } from '@/lib/validator'
import { z } from 'zod'

// نوع بيانات إدخال المنتج
export type IProductInput = z.infer<typeof ProductInputSchema>

// نوع بيانات التطبيق الرئيسية
export type Data = {
  products: IProductInput[]
  headerMenus: {
    name: string
    href: string
  }[]
  carousels: {
    image: string
    url: string
    title: string
    buttonCaption: string
    isPublished: boolean
  }[]
}
```

9. lib/db/models/product.model.ts

```ts
// هذا الملف يحتوي على نموذج MongoDB للمنتجات
import { Document, Model, model, models, Schema } from 'mongoose'
import { IProductInput } from '@/types'

// واجهة نوع المنتج مع حقوق إضافية من MongoDB
export interface IProduct extends Document, IProductInput {
  _id: string
  createdAt: Date
  updatedAt: Date
}

// تعريف مخطط المنتج
const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      required: true,
    },
    images: [String],
    brand: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    listPrice: {
      type: Number,
      required: true,
    },
    countInStock: {
      type: Number,
      required: true,
    },
    tags: { type: [String], default: ['new arrival'] },
    colors: { type: [String], default: ['White', 'Red', 'Black'] },
    sizes: { type: [String], default: ['S', 'M', 'L'] },
    avgRating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    ratingDistribution: [
      {
        rating: {
          type: Number,
          required: true,
        },
        count: {
          type: Number,
          required: true,
        },
      },
    ],
    numSales: {
      type: Number,
      required: true,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      required: true,
      default: false,
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Review',
        default: [],
      },
    ],
  },
  {
    timestamps: true,
  }
)

// تصدير نموذج المنتج أو استخدام النموذج الموجود إذا كان موجودًا
const Product =
  (models.Product as Model<IProduct>) ||
  model<IProduct>('Product', productSchema)

export default Product
```

10. types/index.ts

```ts
// هذا الملف يحتوي على تعريفات الأنواع
import { ProductInputSchema } from '@/lib/validator'
import { z } from 'zod'

// نوع بيانات إدخال المنتج
export type IProductInput = z.infer<typeof ProductInputSchema>

// نوع بيانات التطبيق الرئيسية
export type Data = {
  products: IProductInput[]
  headerMenus: {
    name: string
    href: string
  }[]
  carousels: {
    image: string
    url: string
    title: string
    buttonCaption: string
    isPublished: boolean
  }[]
}
```

11. lib/data.ts

```ts
// هذا الملف يحتوي على البيانات الأولية للتطبيق
import { Data, IProductInput } from '@/types'
import { toSlug } from './utils'

// تعريف بيانات المنتجات
const products: IProductInput[] = [
  // ... (جميع بيانات المنتجات كما هي بدون تغيير)
]

// تصدير البيانات الرئيسية للتطبيق
const data: Data = {
  headerMenus: [
    {
      name: "Today's Deal",
      href: '/search?tag=todays-deal',
    },
    {
      name: 'New Arrivals',
      href: '/search?tag=new-arrival',
    },
    {
      name: 'Featured Products',
      href: '/search?tag=featured',
    },
    {
      name: 'Best Sellers',
      href: '/search?tag=best-seller',
    },
    {
      name: 'Browsing History',
      href: '/#browsing-history',
    },
    {
      name: 'Customer Service',
      href: '/page/customer-service',
    },
    {
      name: 'About Us',
      href: '/page/about-us',
    },
    {
      name: 'Help',
      href: '/page/help',
    },
  ],
  carousels: [
    {
      title: 'Most Popular Shoes For Sale',
      buttonCaption: 'Shop Now',
      image: '/images/banner3.jpg',
      url: '/search?category=Shoes',
      isPublished: true,
    },
    {
      title: 'Best Sellers in T-Shirts',
      buttonCaption: 'Shop Now',
      image: '/images/banner1.jpg',
      url: '/search?category=T-Shirts',
      isPublished: true,
    },
    {
      title: 'Best Deals on Wrist Watches',
      buttonCaption: 'See More',
      image: '/images/banner2.jpg',
      url: '/search?category=Wrist Watches',
      isPublished: true,
    },
  ],
  products,
}

export default data
```

12. add images from p11-1.jpg to p46-2.jpg and categories images to public/images folder
13. lib/db/seed.ts

```ts
// هذا الملف يحتوي على سكريبت لملء قاعدة البيانات بالبيانات الأولية
import data from '@/lib/data'
import { connectToDatabase } from '.'
import Product from './models/product.model'
import { cwd } from 'process'
import { loadEnvConfig } from '@next/env'

// تحميل متغيرات البيئة
loadEnvConfig(cwd())

// الوظيفة الرئيسية لملء البيانات
const main = async () => {
  try {
    const { products } = data
    // الاتصال بقاعدة البيانات
    await connectToDatabase(process.env.MONGODB_URI)

    // حذف جميع المنتجات الحالية
    await Product.deleteMany()
    // إدراج المنتجات الجديدة
    const createdProducts = await Product.insertMany(products)

    console.log({
      createdProducts,
      message: 'Seeded database successfully',
    })
    process.exit(0)
  } catch (error) {
    console.error(error)
    throw new Error('Failed to seed database')
  }
}

// تشغيل الوظيفة الرئيسية
main()
```

14. package.json

```json
{
  "scripts": {
    "seed": "npx tsx ./lib/db/seed.ts",
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

15. npm run seed
16. open mongodb compass and check results

17. copy .env.local content and paste in Vercel Environment
18. commit changes and push to GitHub
19. go to https://nextjs-amazona.vercel.app
