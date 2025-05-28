'use server'

import { connectToDatabase } from '../db'
import Category from '../db/models/category.model'
import Product from '../db/models/product.model'
import { CategoryType } from '@/types'
import mongoose from 'mongoose'
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
      return {
        success: false,
        message: 'تصنيف موجود بالفعل بنفس الـ slug.',
      }
    }

    const newCategory = await Category.create(data)
    return {
      success: true,
      message: 'تم إنشاء التصنيف بنجاح.',
      data: JSON.parse(JSON.stringify(newCategory)),
    }
  } catch (error) {
    return {
      success: false,
      message: `فشل في إنشاء التصنيف: ${(error as Error).message}`,
    }
  }
}

// ====== تحديث تصنيف موجود ======
export async function updateCategory(data: { _id: string } & CategoryParams) {
  try {
    await connectToDatabase()

    const category = await Category.findById(data._id)
    if (!category) {
      return {
        success: false,
        message: 'التصنيف غير موجود.',
      }
    }

    if (category.slug !== data.slug) {
      const existing = await Category.findOne({ slug: data.slug })
      if (existing) {
        return {
          success: false,
          message: 'يوجد تصنيف آخر بنفس الـ slug.',
        }
      }
    }

    category.name = data.name
    category.slug = data.slug
    category.image = data.image

    await category.save()
    return {
      success: true,
      message: 'تم تحديث التصنيف بنجاح.',
      data: JSON.parse(JSON.stringify(category)),
    }
  } catch (error) {
    return {
      success: false,
      message: `فشل في تحديث التصنيف: ${(error as Error).message}`,
    }
  }
}

export async function deleteCategory(id: string) {
  try {
    // التحقق الأساسي
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return {
        success: false,
        message: 'معرّف التصنيف غير صالح',
      }
    }

    await connectToDatabase()

    // التحقق من وجود التصنيف
    const category = await Category.findById(id)
    if (!category) {
      return {
        success: false,
        message: 'التصنيف غير موجود',
      }
    }

    // التحقق من التبعيات
    const dependentProducts = await Product.countDocuments({ categoryId: id })
    if (dependentProducts > 0) {
      return {
        success: false,
        message: `لا يمكن الحذف - يوجد ${dependentProducts} منتجات مرتبطة`,
      }
    }

    // تنفيذ الحذف
    await Category.findByIdAndDelete(id)

    return {
      success: true,
      message: 'تم حذف التصنيف بنجاح',
    }
  } catch (error) {
    console.error('Delete Error:', error)
    return {
      success: false,
      message: `حدث خطأ فني': ${(error as Error).message}`,
    }
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
