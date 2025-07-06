'use client'

import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { EnhancedDashboard } from '@/components/EnhancedDashboard'

function LandingPage() {
  return (
    <div className="text-center py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">🐾 Pet Health Journal</h1>
        <p className="text-xl text-gray-700">Track your pets' health and activities</p>
      </div>
      <div className="space-y-4">
        <p className="text-gray-600">Get started by signing in to your account</p>
        <a
          href="/auth"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Get Started
        </a>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-700 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LandingPage />
  }

  return (
    <ProtectedRoute>
      <EnhancedDashboard />
    </ProtectedRoute>
  )
}
