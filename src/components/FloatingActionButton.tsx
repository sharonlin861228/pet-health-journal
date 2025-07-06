'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

export const FloatingActionButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const actions = [
    { 
      icon: '💉', 
      label: '疫苗記錄', 
      color: 'from-red-400 to-red-500',
      path: '/add/health?type=vaccine'
    },
    { 
      icon: '⚖️', 
      label: '體重更新', 
      color: 'from-purple-400 to-purple-500',
      path: '/add/health?type=weight'
    },
    { 
      icon: '🩺', 
      label: '健康檢查', 
      color: 'from-blue-400 to-blue-500',
      path: '/add/health?type=checkup'
    },
    { 
      icon: '💊', 
      label: '用藥記錄', 
      color: 'from-green-400 to-green-500',
      path: '/add/health?type=medication'
    },
    { 
      icon: '🔔', 
      label: '新增提醒', 
      color: 'from-yellow-400 to-yellow-500',
      path: '/add/reminder'
    }
  ]

  const handleActionClick = (path: string) => {
    router.push(path)
    setIsOpen(false)
  }

  return (
    <div className="fixed bottom-24 right-6 z-50">
      {/* Action Buttons */}
      <div className={`space-y-3 mb-4 transition-all duration-300 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}`}>
        {actions.map((action, index) => (
          <div
            key={index}
            className="flex items-center justify-end space-x-3"
            style={{
              transitionDelay: isOpen ? `${index * 50}ms` : `${(actions.length - index) * 50}ms`
            }}
          >
            <div className="bg-white text-gray-800 px-3 py-2 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap">
              {action.label}
            </div>
            <button
              className={`w-12 h-12 bg-gradient-to-r ${action.color} text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 flex items-center justify-center text-lg`}
              onClick={() => handleActionClick(action.path)}
            >
              {action.icon}
            </button>
          </div>
        ))}
      </div>

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 bg-gradient-to-r from-blue-500 to-sky-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-2xl ${
          isOpen ? 'rotate-45' : 'hover:rotate-12'
        }`}
      >
        {isOpen ? '✕' : '➕'}
      </button>

      {/* Animated Paw Prints */}
      {isOpen && (
        <div className="absolute -top-4 -left-4 pointer-events-none">
          <div className="paw-print text-2xl animate-bounce" style={{ animationDelay: '0.1s' }}>
            🐾
          </div>
        </div>
      )}
    </div>
  )
} 