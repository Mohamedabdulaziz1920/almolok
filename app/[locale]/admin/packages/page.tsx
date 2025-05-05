'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getAllPackages, deletePackage } from '@/lib/actions/package.actions'
import { PackageType } from '@/types'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
const AdminPackagesPage = () => {
  const [packages, setPackages] = useState<PackageType[]>([])
  const router = useRouter()
  const t = useTranslations('Packages')
  useEffect(() => {
    const fetchPackages = async () => {
      const data = await getAllPackages()
      setPackages(data)
    }
    fetchPackages()
  }, [])

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this package?')) {
      await deletePackage(id)
      setPackages((prev) => prev.filter((pkg) => pkg._id !== id))
    }
  }

  return (
    <section className='px-4 md:px-10 py-6 max-w-7xl mx-auto'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl md:text-3xl font-bold'>{t('Package Management')}</h1>
        <Link href='/admin/packages/create'>
          <Button variant='default'>{t('+ New Package')}</Button>
        </Link>
      </div>

      {packages.length === 0 ? (
        <p className='text-gray-500 text-center py-10'>{t('No packages found')}</p>
      ) : (
        <div className='overflow-x-auto'>
          <table className='min-w-full bg-white rounded-lg shadow overflow-hidden'>
            <thead className='bg-gray-100 text-left text-sm uppercase text-gray-600'>
              <tr>
                <th className='px-4 py-3'>{t('Image')}</th>
                <th className='px-4 py-3'>{t('Name')}</th>
                <th className='px-4 py-3'>{t('Price')}</th>
                <th className='px-4 py-3'>{t('Currency')}</th>
                <th className='px-4 py-3'>{t('Published')}</th>
                <th className='px-4 py-3'>{t('Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => (
                <tr key={pkg._id} className='border-t'>
                  <td className='px-4 py-3'>
                    <Image
                      src={pkg.image}
                      alt={pkg.name}
                      width={50}
                      height={50}
                      className='rounded-md object-cover'
                    />
                  </td>
                  <td className='px-4 py-3'>{pkg.name}</td>
                  <td className='px-4 py-3'>{pkg.price.toFixed(2)}</td>
                  <td className='px-4 py-3'>{pkg.currency}</td>
                  <td className='px-4 py-3'>
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded ${
                        pkg.isPublished
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {pkg.isPublished ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className='px-4 py-3 flex gap-2'>
                    <Button
                      variant='secondary'
                      onClick={() =>
                        router.push(`/admin/packages/edit/${pkg._id}`)
                      }
                    >
                      {t('Edit')}
                    </Button>
                    <Button
                      variant='destructive'
                      onClick={() => handleDelete(pkg._id)}
                    >
                       {t('Delete')}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default AdminPackagesPage
