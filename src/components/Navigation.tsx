'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface NavigationProps {
  currentPage: string
  onPageChange: (page: string) => void
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {
  const navItems = [
    { id: 'dashboard', label: '首頁', icon: '🏠', path: '/' },
    { id: 'pets', label: '寵物檔案', icon: '🐾', path: '/pets' },
    { id: 'health-records', label: '健康紀錄', icon: '📋', path: '/health-records' },
    { id: 'reminders', label: '提醒事項', icon: '🔔', path: '/reminders' },
    { id: 'profile', label: '設定', icon: '⚙️', path: '/profile' }
  ]

  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()

  const handlePageChange = (pageId: string) => {
    const navItem = navItems.find(item => item.id === pageId)
    if (navItem) {
      onPageChange(pageId)
      router.push(navItem.path)
    }
  }

  // Don't show navigation on auth page
  if (pathname === '/auth') {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-gray-200 shadow-lg">
      <div className="container mx-auto max-w-md px-4 py-3">
        <div className="flex items-center justify-between">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handlePageChange(item.id)}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                currentPage === item.id
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
} 