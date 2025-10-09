'use client'

import { Navigation } from '@/components/Navigation'

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      {children}
    </>
  )
}
