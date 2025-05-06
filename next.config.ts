import type { NextConfig } from 'next'
import withNextIntl from 'next-intl/plugin'

const nextConfig: NextConfig = withNextIntl()({
  typescript: {
    ignoreBuildErrors: true, // يمكنك تعطيل أخطاء البناء مؤقتاً للبحث عن المشكلة
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: '',
      },
    ],
  },
})

export default nextConfig
