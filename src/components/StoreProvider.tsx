'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useAppStore.persist.rehydrate()
  }, [])

  return <>{children}</>
}
