'use server'

import { connectToDatabase } from '../db'
import Category from '../db/models/category.model'
import { CategoryType } from '@/types'

// واجهات بيانات
interface CategoryParams {
  name: string
  slug: string
  image: string
}

interface SimpleCategory {
  _id: string
  name: string
  slug: string
  image: string
}

// ====== إنشاء تصنيف جديد ======
export async function createCategory(data: CategoryParams) {
  try {
    await connectToDatabase()

    const existing = await Category.findOne({ slug: data.slug })
    if (existing) {
      throw new Error('Category already exists with the same slug.')
    }

    const newCategory = await Category.create(data)
    return JSON.parse(JSON.stringify(newCategory))
  } catch (error) {
    throw new Error(`Failed to create category: ${(error as Error).message}`)
  }
}

// ====== تحديث تصنيف موجود ======
export async function updateCategory(id: string, data: CategoryParams) {
  try {
    await connectToDatabase()

    const category = await Category.findById(id)
    if (!category) {
      throw new Error('Category not found.')
    }

    // التحقق من وجود slug مكرر في تصنيف آخر
    if (category.slug !== data.slug) {
      const existing = await Category.findOne({ slug: data.slug })
      if (existing) {
        throw new Error('Another category with the same slug already exists.')
      }
    }

    category.name = data.name
    category.slug = data.slug
    category.image = data.image

    await category.save()
    return JSON.parse(JSON.stringify(category))
  } catch (error) {
    throw new Error(`Failed to update category: ${(error as Error).message}`)
  }
}

// ====== جلب تصنيف حسب الـ ID ======
export async function getCategoryById(id: string) {
  try {
    await connectToDatabase()

    const category = await Category.findById(id).lean<CategoryType>()
    if (!category) {
      throw new Error('Category not found.')
    }

    return {
      _id: String(category._id),
      name: category.name,
      slug: category.slug,
      image: category.image,
    }
  } catch (error) {
    throw new Error(`Failed to fetch category: ${(error as Error).message}`)
  }
}

// ====== جلب جميع التصنيفات (للوحة التحكم) ======
export const getCategories = async (): Promise<{
  success: boolean
  data: SimpleCategory[]
  message?: string
}> => {
  try {
    await connectToDatabase()

    const categories = await Category.find()
      .select('name slug image')
      .lean<SimpleCategory[]>()

    return {
      success: true,
      data: categories.map((cat) => ({
        _id: String(cat._id),
        name: cat.name,
        slug: cat.slug,
        image: cat.image,
      })),
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      data: [],
      message: 'Failed to fetch categories.',
    }
  }
}

// ====== جلب جميع التصنيفات (كاملة) ======
export const getAllCategories = async (): Promise<CategoryType[]> => {
  await connectToDatabase()

  const categories = await Category.find().lean<CategoryType[]>()
  return categories.map((cat) => ({
    _id: String(cat._id),
    name: cat.name,
    slug: cat.slug,
    image: cat.image,
  }))
}

// ====== جلب تصنيف عن طريق الـ Slug ======
export const getCategoryBySlug = async (
  slug: string
): Promise<CategoryType | null> => {
  await connectToDatabase()

  const category = await Category.findOne({ slug }).lean<CategoryType>()

  if (!category) return null

  return {
    _id: String(category._id),
    name: category.name,
    slug: category.slug,
    image: category.image,
  }
}
