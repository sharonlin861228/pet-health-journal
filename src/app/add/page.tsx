'use client'

import { useState } from 'react'
import { ArrowLeft, Activity, Heart, Calendar, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

const logTypes = [
  {
    id: 'health',
    title: 'Health Record',
    description: 'Track vaccinations, checkups, medications, or weight',
    icon: Heart,
    href: '/add/health',
    color: 'bg-red-100 text-red-600'
  },
  {
    id: 'behavior',
    title: 'Behavior Log',
    description: 'Log daily behavior and activities',
    icon: Activity,
    href: '/add/behavior',
    color: 'bg-green-100 text-green-600'
  },
  {
    id: 'reminder',
    title: 'Reminder',
    description: 'Set health reminders and tasks',
    icon: Calendar,
    href: '/add/reminder',
    color: 'bg-blue-100 text-blue-600'
  }
]

export default function AddPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New</h1>
          <p className="text-gray-600">What would you like to add?</p>
        </div>
      </div>

      {/* Log Types */}
      <div className="space-y-4">
        {logTypes.map((type) => {
          const Icon = type.icon
          return (
            <Link key={type.id} href={type.href}>
              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${type.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{type.title}</h3>
                      <p className="text-gray-600">{type.description}</p>
                    </div>
                    <Plus className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          <Link href="/pets/new">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="p-4 text-center">
                <div className="mx-auto h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                  <Plus className="h-4 w-4 text-purple-600" />
                </div>
                <p className="text-sm font-medium">Add Pet</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/reminders">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="p-4 text-center">
                <div className="mx-auto h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center mb-2">
                  <Calendar className="h-4 w-4 text-orange-600" />
                </div>
                <p className="text-sm font-medium">View Reminders</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
} 