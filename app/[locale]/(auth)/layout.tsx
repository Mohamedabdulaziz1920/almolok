import { getSetting } from '@/lib/actions/setting.actions'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { site } = await getSetting()

  return (
  <div className="flex flex-col items-center min-h-screen highlight-link">
      {/* Header */}
     <header className="mt-4">
        <Link href="/">
          <Image
            src="/icons/logo.svg"
            alt="Logo"
            width={72}
            height={72}
            priority
            className="rounded-xl drop-shadow-md hover:scale-105 transition-transform"
          />
        </Link>
      </header>

      {/* Main Content */}
     <main className="mx-auto max-w-sm min-w-80 p-4">{children}</main>
 

      {/* Footer */}
       <footer className="flex-1 mt-4 bg-gray-800 w-full flex flex-col gap-4 items-center p-6 text-sm text-gray-400">
        <div className="flex justify-center flex-wrap gap-4 mb-2">
          <Link
            href="/page/conditions-of-use"
            className="hover:text-yellow-500 transition-colors"
          >
            Conditions of Use
          </Link>
          <Link
            href="/page/privacy-policy"
            className="hover:text-yellow-500 transition-colors"
          >
            Privacy Notice
          </Link>
          <Link
            href="/page/help"
            className="hover:text-yellow-500 transition-colors"
          >
            Help
          </Link>
        </div>
        <div>
          <p className="text-xs text-gray-500">{site?.copyright}</p>
        </div>
      </footer>
    </div>
  )
}
