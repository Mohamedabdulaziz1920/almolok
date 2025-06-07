'use client'

import { createContext, useContext, useState } from 'react'

type SidebarContextType = {
  isOpen: boolean
  toggle: (e?: React.TouchEvent) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const toggle = (e?: React.TouchEvent) => {
    e?.stopPropagation?.()
    setIsOpen((prev) => !prev)
  }

  return (
    <SidebarContext.Provider value={{ isOpen, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
