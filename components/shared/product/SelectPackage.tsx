'use client'

import { useState } from 'react'
import { PackageType } from '@/types'
import ProductPrice from './product-price'

type Props = {
  defaultPrice: number
  packages: PackageType[]
}

export default function SelectPackage({ defaultPrice, packages }: Props) {
  const [selectedPrice, setSelectedPrice] = useState<number>(defaultPrice)

  return (
    <div className="flex flex-col gap-4 mt-4">
      <label className="font-bold">اختر الكمية التي تريد شحنها:</label>
      <select
        className="border p-2 rounded"
        onChange={(e) => {
          const pkg = packages.find((p) => p._id === e.target.value)
          setSelectedPrice(pkg ? pkg.price : defaultPrice)
        }}
      >
        <option value="">({defaultPrice})</option>
        {packages.map((pkg) => (
          <option key={pkg._id} value={pkg._id}>
            {pkg.name} - {pkg.price} {pkg.currency}
          </option>
        ))}
      </select>

      <div>
        <ProductPrice price={selectedPrice} />
      </div>
    </div>
  )
}
