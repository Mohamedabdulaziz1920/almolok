import { getPublishedPackages } from '@/lib/actions/package.actions'

export default async function PackagesPage() {
  const packages = await getPublishedPackages()

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">الباقات المتوفرة</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg._id}
            className="border rounded-lg p-6 shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold mb-2">{pkg.name}</h2>
            <p className="text-gray-600 mb-4">{pkg.description}</p>
            <p className="font-bold text-primary mb-4">
              {pkg.price} {pkg.currency}
            </p>
            <button className="bg-primary text-white px-4 py-2 rounded w-full">
              اشتر الآن
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
