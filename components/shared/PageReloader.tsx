'use client'
import { useEffect } from 'react'

export default function PageReloader() {
  useEffect(() => {
    const reloaded = sessionStorage.getItem('reloaded')
    if (reloaded === 'true') {
      sessionStorage.removeItem('reloaded')
    } else {
      sessionStorage.setItem('reloaded', 'true')
      window.location.reload()
    }
  }, [])

  return null
}
