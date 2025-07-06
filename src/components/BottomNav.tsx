'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Heart, Calendar, Plus, User, LogIn } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

const authenticatedNavItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/pets', label: 'Pets', icon: Heart },
  { href: '/reminders', label: 'Reminders', icon: Calendar },
  { href: '/add', label: 'Add', icon: Plus },
  { href: '/profile', label: 'Profile', icon: User },
]

const unauthenticatedNavItems = [
  { href: '/auth', label: 'Sign In', icon: LogIn },
]

export function BottomNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  // Don't show navigation on auth page
  if (pathname === '/auth') {
    return null
  }

  const navItems = user ? authenticatedNavItems : unauthenticatedNavItems

  return (
    <>
      {/* Spacer to prevent content from being hidden behind nav */}
      <div className="h-20" />
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-4 py-2">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center space-y-1 rounded-lg px-3 py-2 transition-colors',
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
} 