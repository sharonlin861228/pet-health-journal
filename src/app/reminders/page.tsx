'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Switch } from '@/components/ui/Switch'
import { supabase, Pet, Reminder } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Plus, Calendar, Bell } from 'lucide-react'
import Link from 'next/link'

interface ExtendedReminder extends Reminder {
  pets?: {
    name: string
    breed?: string
  }
  category?: string
  priority?: 'high' | 'medium' | 'low'
  recurring?: string
  description?: string
}

export default function RemindersPage() {
  const [pets, setPets] = useState<Pet[]>([])
  const [selectedPet, setSelectedPet] = useState<string>('all')
  const [reminders, setReminders] = useState<ExtendedReminder[]>([])
  const [activeTab, setActiveTab] = useState('pending')
  const [loading, setLoading] = useState(true)
  
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user, selectedPet])

  async function fetchData() {
    try {
      // Fetch pets
      const { data: petsData, error: petsError } = await supabase
        .from('pets')
        .select('*')
        .order('name')

      if (petsError) throw petsError

      // Fetch reminders
      let query = supabase
        .from('reminders')
        .select(`
          *,
          pets(name, breed)
        `)
        .order('due_date', { ascending: true })

      if (selectedPet !== 'all') {
        query = query.eq('pet_id', selectedPet)
      }

      const { data: remindersData, error: remindersError } = await query

      if (remindersError) throw remindersError

      // Transform data to include additional fields
      const transformedReminders = (remindersData || []).map(reminder => ({
        ...reminder,
        category: reminder.type || 'other',
        priority: reminder.priority || 'medium',
        recurring: reminder.repeat_interval || 'once',
        description: reminder.label
      }))

      setPets(petsData || [])
      setReminders(transformedReminders)
    } catch (error) {
      console.error('Error fetching reminders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'medical':
        return { icon: '🩺', label: '醫療', color: 'bg-red-100 text-red-800 border-red-200' }
      case 'medication':
        return { icon: '💊', label: '用藥', color: 'bg-blue-100 text-blue-800 border-blue-200' }
      case 'grooming':
        return { icon: '🛁', label: '美容', color: 'bg-purple-100 text-purple-800 border-purple-200' }
      case 'health':
        return { icon: '❤️', label: '健康', color: 'bg-green-100 text-green-800 border-green-200' }
      default:
        return { icon: '📋', label: '其他', color: 'bg-gray-100 text-gray-800 border-gray-200' }
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRecurringText = (recurring: string) => {
    switch (recurring) {
      case 'daily': return '每日'
      case 'weekly': return '每週'
      case 'bi-weekly': return '雙週'
      case 'monthly': return '每月'
      case 'yearly': return '每年'
      default: return '一次性'
    }
  }

  const toggleReminderStatus = async (reminderId: string, isDone: boolean) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ is_done: isDone })
        .eq('id', reminderId)

      if (error) throw error

      // Update local state
      setReminders(prev => prev.map(reminder => 
        reminder.id === reminderId 
          ? { ...reminder, is_done: isDone }
          : reminder
      ))
    } catch (error) {
      console.error('Error updating reminder:', error)
    }
  }

  const filteredReminders = reminders.filter(reminder => 
    activeTab === 'pending' ? !reminder.is_done : reminder.is_done
  )

  const pendingCount = reminders.filter(r => !r.is_done).length
  const completedCount = reminders.filter(r => r.is_done).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-700 font-medium">Loading reminders...</p>
        </div>
      </div>
    )
  }

  const selectedPetData = selectedPet !== 'all' 
    ? pets.find(pet => pet.id === selectedPet) 
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="pet-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>🔔</span>
              <span>
                {selectedPetData ? `${selectedPetData.name} 的提醒事項` : '提醒事項'}
              </span>
            </div>
            <Link href="/add/reminder">
              <Button className="bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600">
                <span className="mr-2">➕</span>
                新增提醒
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Pet Filter */}
          <div className="flex space-x-2 overflow-x-auto pb-4 mb-4">
            <button
              onClick={() => setSelectedPet('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedPet === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              全部寵物
            </button>
            {pets.map((pet) => (
              <button
                key={pet.id}
                onClick={() => setSelectedPet(pet.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPet === pet.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {pet.name}
              </button>
            ))}
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'pending'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              待完成 ({pendingCount})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'completed'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              已完成 ({completedCount})
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Reminders List */}
      <div className="space-y-4">
        {filteredReminders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">
                {activeTab === 'pending' ? 'No pending reminders' : 'No completed reminders'}
              </h3>
              <p className="text-gray-700 mb-6">
                {activeTab === 'pending' 
                  ? 'Add your first reminder to start tracking' 
                  : 'Complete some reminders to see them here'
                }
              </p>
              <Link href="/add/reminder">
                <Button>Add Reminder</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          filteredReminders.map((reminder) => {
            const categoryInfo = getCategoryInfo(reminder.category || 'other')
            
            return (
              <Card key={reminder.id} className={`reminder-card ${reminder.is_done ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <input
                        type="checkbox"
                        checked={reminder.is_done}
                        onChange={(e) => toggleReminderStatus(reminder.id, e.target.checked)}
                        className="w-5 h-5 text-blue-500 rounded border-gray-300 focus:ring-blue-500 mt-1"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-xl">{categoryInfo.icon}</span>
                          <h3 className={`text-lg font-semibold ${reminder.is_done ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                            {reminder.label}
                          </h3>
                        </div>
                        
                        {reminder.description && (
                          <p className={`text-sm mb-3 ${reminder.is_done ? 'text-gray-400' : 'text-gray-600'}`}>
                            {reminder.description}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={categoryInfo.color}>
                            {categoryInfo.label}
                          </Badge>
                          <Badge className={getPriorityColor(reminder.priority || 'medium')}>
                            {reminder.priority === 'high' ? '高優先' : reminder.priority === 'medium' ? '中優先' : '低優先'}
                          </Badge>
                          <Badge variant="outline">
                            {getRecurringText(reminder.recurring || 'once')}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            📅 {new Date(reminder.due_date).toLocaleDateString('zh-TW')}
                          </span>
                          {reminder.pets && (
                            <span className="text-sm text-gray-500">
                              🐾 {reminder.pets.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>通知</span>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Quick Add Section */}
      <Card className="health-record-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>⚡</span>
            <span>快速新增常用提醒</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: '💉', label: '疫苗接種', category: 'medical' },
              { icon: '💊', label: '服用藥物', category: 'medication' },
              { icon: '🛁', label: '洗澡美容', category: 'grooming' },
              { icon: '⚖️', label: '體重測量', category: 'health' }
            ].map((item, index) => (
              <Link key={index} href={`/add/reminder?category=${item.category}`}>
                <button className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center">
                  <span className="text-2xl block mb-2">{item.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 