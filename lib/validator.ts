import { z } from 'zod'
import { formatNumberWithDecimal } from './utils'
// Common
const MongoId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid MongoDB ID' })

const Price = (field: string) =>
  z.coerce
    .number()
    .refine(
      (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(value)),
      `${field} must have exactly two decimal places (e.g., 49.99)`
    )

export const ReviewInputSchema = z.object({
  product: MongoId,
  user: MongoId,
  isVerifiedPurchase: z.boolean(),
  title: z.string().min(1, 'Title is required'),
  comment: z.string().min(1, 'Comment is required'),
  rating: z.coerce
    .number()
    .int()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
})

export const ProductInputSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  category: z.string().min(1, 'Category is required'),
  images: z.array(z.string()).min(0, 'Product must have at least one image'),
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
  packages: z.array(z.string()).optional(),
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
  reviews: z.array(ReviewInputSchema).default([]),
  numSales: z.coerce
    .number()
    .int()
    .nonnegative('Number of sales must be a non-negative number'),
})

export const ProductUpdateSchema = ProductInputSchema.extend({
  _id: z.string(),
})

// Order Item
export const OrderItemSchema = z.object({
  product: z.string().min(1, 'Product ID is required'),
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Slug is required'),
  category: z.string().min(1, 'Category is required'),
  playerId: z
    .string()
    .min(1, 'Player ID is required')
    .regex(/^[a-zA-Z0-9]+$/, 'Must contain only letters and numbers'),
  quantity: z
    .number()
    .int({ message: 'Quantity must be an integer' })
    .nonnegative({ message: 'Quantity must be non-negative' }),
  countInStock: z
    .number()
    .int({ message: 'Stock must be an integer' })
    .nonnegative({ message: 'Stock must be non-negative' }),
  image: z.string().url('Image must be a valid URL'),
  price: Price('Price'),
  clientId: z.string().min(1, 'Client ID is required'),
})

// الطلب
export const OrderInputSchema = z.object({
  user: z.string().min(1, 'User ID is required'),
  items: z
    .array(OrderItemSchema)
    .min(1, 'Order must contain at least one item'),
  paymentMethod: z.enum(['balance'], {
    errorMap: () => ({ message: 'Invalid payment method' }),
  }),
  itemsPrice: Price('Items price'),
  taxPrice: Price('Tax price'),
  totalPrice: Price('Total price'),
  isPaid: z.boolean(),
  paidAt: z.date(),
  balanceUsed: z.number().nonnegative().optional(),
  balance: z.number().nonnegative().optional(),
  status: z.enum(['pending', 'completed', 'rejected']).default('pending'),
})

// السلة (cart)
export const CartSchema = z.object({
  items: z
    .array(OrderItemSchema)
    .min(1, 'Order must contain at least one item'),
  itemsPrice: z.number(),
  taxPrice: z.optional(z.number()),
  totalPrice: z.number(),
  paymentMethod: z.optional(z.string()),
  playerId: z.string().optional(),
  balanceUsed: z.number().min(0).optional(),
  balance: z.number().optional(),
})

// USER
const UserName = z
  .string()
  .min(2, { message: 'Username must be at least 2 characters' })
  .max(50, { message: 'Username must be at most 30 characters' })
const Email = z.string().min(1, 'Email is required').email('Email is invalid')
const Password = z.string().min(3, 'Password must be at least 3 characters')
const UserRole = z.string().min(1, 'role is required')

export const UserUpdateSchema = z.object({
  _id: MongoId,
  name: UserName,
  email: Email,
  role: UserRole,
})

export const UserInputSchema = z.object({
  name: UserName,
  email: Email,
  image: z.string().optional(),
  emailVerified: z.boolean(),
  role: UserRole,
  balance: z.number().default(0).optional(),
  password: Password,
  paymentMethod: z.string().min(1, 'Payment method is required'),
  address: z.object({
    fullName: z.string().min(1, 'Full name is required'),
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    province: z.string().min(1, 'Province is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
    phone: z.string().min(1, 'Phone number is required'),
  }),
})

export const UserSignInSchema = z.object({
  email: Email,
  password: Password,
})

export const UserSignUpSchema = UserSignInSchema.extend({
  name: UserName,
  confirmPassword: Password,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const UserNameSchema = z.object({
  name: UserName,
})
// Category schema
export const CategoryInputSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  image: z.string().min(1, 'Image is required'),
})

export const CategoryUpdateSchema = CategoryInputSchema.extend({
  _id: MongoId,
})

// WEBPAGE
export const WebPageInputSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  content: z.string().min(1, 'Content is required'),
  isPublished: z.boolean(),
})

export const WebPageUpdateSchema = WebPageInputSchema.extend({
  _id: z.string(),
})

// Setting
export const SiteLanguageSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
})

export const CarouselSchema = z.object({
  title: z.string().optional(),
  url: z.string().optional(),
  image: z.string().min(1, 'image is required'),
  buttonCaption: z.string().optional(),
})

export const SiteCurrencySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  convertRate: z.coerce.number().min(0, 'Convert rate must be at least 0'),
  symbol: z.string().min(1, 'Symbol is required'),
})

export const PaymentMethodSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  commission: z.coerce.number().min(0, 'Commission must be at least 0'),
})

export const SettingInputSchema = z.object({
  common: z.object({
    pageSize: z.coerce
      .number()
      .min(1, 'Page size must be at least 1')
      .default(9),
    isMaintenanceMode: z.boolean().default(false),
    defaultTheme: z
      .string()
      .min(1, 'Default theme is required')
      .default('light'),
    defaultColor: z
      .string()
      .min(1, 'Default color is required')
      .default('gold'),
  }),
  site: z.object({
    name: z.string().min(1, 'Name is required'),
    logo: z.string().min(1, 'logo is required'),
    slogan: z.string().min(1, 'Slogan is required'),
    description: z.string().min(1, 'Description is required'),
    keywords: z.string().min(1, 'Keywords is required'),
    url: z.string().min(1, 'Url is required'),
    email: z.string().min(1, 'Email is required'),
    phone: z.string().min(1, 'Phone is required'),
    author: z.string().min(1, 'Author is required'),
    copyright: z.string().min(1, 'Copyright is required'),
    address: z.string().min(1, 'Address is required'),
  }),
  availableLanguages: z
    .array(SiteLanguageSchema)
    .min(1, 'At least one language is required'),
  carousels: z
    .array(CarouselSchema)
    .min(1, 'At least one language is required'),
  defaultLanguage: z.string().min(1, 'Language is required'),
  availableCurrencies: z
    .array(SiteCurrencySchema)
    .min(1, 'At least one currency is required'),
  defaultCurrency: z.string().min(1, 'Currency is required'),
  availablePaymentMethods: z
    .array(PaymentMethodSchema)
    .min(1, 'At least one payment method is required'),
  defaultPaymentMethod: z.string().min(1, 'Payment method is required'),
})
// Package
export const PackageInputSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  price: z.coerce.number().min(0, 'Price must be at least 0'),
  image: z.string().min(1, 'Image is required'),
  description: z.string().optional(),
  currency: z.enum(['USD', 'SAR', 'YER']),
  isPublished: z.boolean().default(false),
})

export const PackageUpdateSchema = PackageInputSchema.extend({
  _id: z.string(),
})
