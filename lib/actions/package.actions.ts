'use server'

import { revalidatePath } from 'next/cache'
import { PackageInputSchema, PackageUpdateSchema } from '../validator'
import PackageModel from '../db/models/package.model'
import { z } from 'zod'
import { redirect } from 'next/navigation'

export async function createPackage(
  formData: z.infer<typeof PackageInputSchema>
) {
  const validated = PackageInputSchema.safeParse(formData)
  if (!validated.success) throw new Error('Invalid package data')

  await PackageModel.create(validated.data)
  revalidatePath('/admin/packages')
  redirect('/admin/packages')
}

export async function updatePackage(
  formData: z.infer<typeof PackageUpdateSchema>
) {
  const validated = PackageUpdateSchema.safeParse(formData)
  if (!validated.success) throw new Error('Invalid package data')

  await PackageModel.findByIdAndUpdate(validated.data._id, validated.data)
  revalidatePath('/admin/packages')
  redirect('/admin/packages')
}

export async function getAllPackages() {
  return await PackageModel.find().sort({ createdAt: -1 }).lean()
}

export const getPackagesByIds = async (ids: string[]) => {
  return await PackageModel.find({ _id: { $in: ids } });
};
export async function deletePackage(id: string) {
  await PackageModel.findByIdAndDelete(id)
  revalidatePath('/admin/packages')
}
export async function getPublishedPackages() {
  const packages = await PackageModel.find({ isPublished: true })
    .sort({ createdAt: -1 })
    .lean()

  return {
    success: true,
    data: packages,
  }
}
