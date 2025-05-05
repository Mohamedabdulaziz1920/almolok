import { Schema, model, models, Document } from 'mongoose'

// تعريف ICategory كـ Interface
export interface ICategory extends Document {
  name: string
  slug: string
  image: string
}

// تعريف الـ Schema للفئة
const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  image: { type: String, required: true },
})

// إذا كان هناك موديل موجود باسم Category، استخدمه، وإلا قم بإنشائه
const Category = models.Category || model<ICategory>('Category', CategorySchema)

export default Category
