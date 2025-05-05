'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { SignInWithGoogle } from '@/lib/actions/user.actions'
import { useTranslations } from 'next-intl'

export function GoogleSignInForm() {
  const t = useTranslations('SignIn.GoogleSignInForm')

  const SignInButton = () => {
    const { pending } = useFormStatus()
    return (
      <Button
        disabled={pending}
        className='w-full flex items-center justify-center gap-2'
        variant='outline'
      >
        {pending ? t('redirecting') : t('signInWithGoogle')}
        <GoogleIcon className='w-5 h-5 ml-2' />
      </Button>
    )
  }

  return (
    <form action={SignInWithGoogle}>
      <SignInButton />
    </form>
  )
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox='0 0 488 512'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        fill='#EA4335'
        d='M488 261.8c0-17.8-1.6-35-4.6-51.6H249v97.9h134.2c-5.8 31.3-23 57.8-49 75.5v62h79.2c46.3-42.6 74.6-105.3 74.6-183.8z'
      />
      <path
        fill='#34A853'
        d='M249 498c66.4 0 122-22 162.7-59.7l-79.2-62c-22 14.8-50 23.5-83.5 23.5-64 0-118-43.2-137.3-101.3H31v63.5C71.9 439.6 153.8 498 249 498z'
      />
      <path
        fill='#4A90E2'
        d='M111.7 298.5c-9.3-27.3-9.3-56.7 0-84L31 151v63.5l80.7 84z'
      />
      <path
        fill='#FBBC05'
        d='M249 100.5c35.9 0 68.2 12.4 93.7 36.5l70.2-70.2C370.9 27.5 313.6 0 249 0 153.8 0 71.9 58.4 31 151l80.7 84c19.3-58.1 73.3-101.3 137.3-101.3z'
      />
    </svg>
  )
}
