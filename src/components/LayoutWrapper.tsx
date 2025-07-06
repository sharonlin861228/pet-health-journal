'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Navigation } from './Navigation'
import { FloatingActionButton } from './FloatingActionButton'
import { useAuth } from '@/contexts/AuthContext'

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    // Map pathname to page ID
    const pageMap: { [key: string]: string } = {
      '/': 'dashboard',
      '/pets': 'pets',
      '/reminders': 'reminders',
      '/health-records': 'health-records',
      '/profile': 'profile'
    }
    
    setCurrentPage(pageMap[pathname] || 'dashboard')
  }, [pathname])

  const handlePageChange = (pageId: string) => {
    setCurrentPage(pageId)
    
    // Map page ID to path
    const pathMap: { [key: string]: string } = {
      'dashboard': '/',
      'pets': '/pets',
      'reminders': '/reminders',
      'health-records': '/health-records',
      'profile': '/profile'
    }
    
    const path = pathMap[pageId]
    if (path) {
      router.push(path)
    }
  }

  // Don't show navigation on auth page or if user is not authenticated
  if (pathname === '/auth' || !user) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-md px-4 py-6 pb-24">
        {children}
      </div>
      <Navigation currentPage={currentPage} onPageChange={handlePageChange} />
      <FloatingActionButton />
    </div>
  )
} 