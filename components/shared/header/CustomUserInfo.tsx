import Image from 'next/image'
import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { cn } from '@/lib/utils'

interface CustomUserInfoProps {
  className?: string
}

export default function CustomUserInfo({ className }: CustomUserInfoProps) {
  const user = useCurrentUser()

  if (!user) return null

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 border border-gray-700 rounded-lg bg-gray-800 text-white',
        className
      )}
    >
      <div className='bg-primary rounded-full h-9 w-9 flex items-center justify-center'>
        <Image src='/icons/logo.svg' width={24} height={24} alt='User' />
      </div>
      <div className='flex flex-col'>
        <span className='font-medium'>مرحباً {user.name}</span>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className='text-xs text-red-500 hover:text-yellow-400 flex items-center gap-1 mt-1'
        >
          <LogOut size={14} /> تسجيل الخروج
        </button>
      </div>
    </div>
  )
}
