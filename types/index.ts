import {
  CarouselSchema,
  CartSchema,
  OrderInputSchema,
  OrderItemSchema,
  PaymentMethodSchema,
  ProductInputSchema,
  ReviewInputSchema,
  SettingInputSchema,
  SiteCurrencySchema,
  SiteLanguageSchema,
  UserInputSchema,
  UserNameSchema,
  UserSignInSchema,
  UserSignUpSchema,
  WebPageInputSchema,
} from '@/lib/validator'
import { z } from 'zod'

// Review
export type IReviewInput = z.infer<typeof ReviewInputSchema>
export type IReviewDetails = IReviewInput & {
  _id: string
  createdAt: string
  user: {
    name: string
  }
}

// Product
export type IProductInput = z.infer<typeof ProductInputSchema>

// Data
export type Data = {
  settings: ISettingInput[]
  webPages: IWebPageInput[]
  users: IUserInput[]
  products: IProductInput[]
  reviews: {
    title: string
    rating: number
    comment: string
  }[]
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
export type ProductType = {
  _id: string
  name: string
  slug: string
  category: string
  images: string[] // ← استخدم images بدلاً من image
  brand: string
  description?: string
  price: number
  listPrice: number
  countInStock: number
  tags: string[]
  avgRating: number
  numReviews: number
  createdAt?: Date
  updatedAt?: Date
}
export type CategoryType = {
  _id: string
  name: string
  slug: string
  image: string
}
// Order
export type IOrderInput = z.infer<typeof OrderInputSchema>
export type IOrderList = IOrderInput & {
  _id: string
  user: {
    name: string
    email: string
  }
  playerId: string // إضافة حقل playerId هنا
  createdAt: Date
}
export type OrderItem = z.infer<typeof OrderItemSchema>
export type Cart = z.infer<typeof CartSchema>

// User
export type IUserInput = z.infer<typeof UserInputSchema>
export type IUserSignIn = z.infer<typeof UserSignInSchema>
export type IUserSignUp = z.infer<typeof UserSignUpSchema>
export type IUserName = z.infer<typeof UserNameSchema>

// WebPage
export type IWebPageInput = z.infer<typeof WebPageInputSchema>

// Setting
export type ICarousel = z.infer<typeof CarouselSchema>
export type ISettingInput = z.infer<typeof SettingInputSchema>
export type ClientSetting = ISettingInput & {
  currency: string
}

// Others
export type SiteLanguage = z.infer<typeof SiteLanguageSchema>
export type SiteCurrency = z.infer<typeof SiteCurrencySchema>
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>

// Category
// types.ts (أو ملف أنواع مشترك)
type OrderItemInput = {
  product: string
  name: string
  slug: string
  category: string
  playerId: string
  quantity: number
  countInStock: number
  image: string
  price: number
}

type CreateOrderInput = {
  user: string // userId
  items: OrderItemInput[]
  itemsPrice: number
  taxPrice: number
  totalPrice: number
  paymentMethod: 'balance' // الدفع من الرصيد فقط
  clientId: string
  balanceUsed?: number
  balance?: number // إضافة الرصيد هنا ليتم تمريره في العملية
  status?: 'pending' | 'completed' | 'rejected' // الحالة (افتراضيًا pending)
}
export type { OrderItemInput, CreateOrderInput }
