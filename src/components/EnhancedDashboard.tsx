'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { supabase, Pet, Reminder, HealthRecord } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Plus, Heart, Calendar, Weight, Activity } from 'lucide-react'
import WeightChart from '@/components/WeightChart'
import Link from 'next/link'

interface Task {
  id: string
  task: string
  time: string
  completed: boolean
  priority: 'high' | 'medium' | 'low'
}

interface Event {
  id: string
  event: string
  date: string
  type: 'vaccine' | 'checkup' | 'grooming' | 'medication'
}

export function EnhancedDashboard() {
  const [pets, setPets] = useState<Pet[]>([])
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([])
  const [loading, setLoading] = useState(true)
  
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  async function fetchDashboardData() {
    try {
      // Fetch pets
      const { data: petsData, error: petsError } = await supabase
        .from('pets')
        .select('*')
        .order('created_at', { ascending: false })

      if (petsError) throw petsError

      // Fetch today's reminders
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const { data: remindersData, error: remindersError } = await supabase
        .from('reminders')
        .select('*')
        .gte('due_date', today.toISOString())
        .lt('due_date', tomorrow.toISOString())
        .order('due_date', { ascending: true })

      if (remindersError) throw remindersError

      // Fetch recent health records
      const { data: healthData, error: healthError } = await supabase
        .from('health_records')
        .select('*')
        .order('date', { ascending: false })
        .limit(10)

      if (healthError) throw healthError

      setPets(petsData || [])
      setReminders(remindersData || [])
      setHealthRecords(healthData || [])
      
      if (petsData && petsData.length > 0) {
        setSelectedPet(petsData[0])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Convert reminders to tasks
  const todayTasks: Task[] = reminders.map((reminder, index) => ({
    id: reminder.id,
    task: reminder.label,
    time: new Date(reminder.due_date).toLocaleTimeString('zh-TW', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    completed: reminder.is_done,
    priority: index === 0 ? 'high' : index === 1 ? 'medium' : 'low' as const
  }))

  // Convert health records to events
  const upcomingEvents: Event[] = healthRecords.slice(0, 3).map((record) => ({
    id: record.id,
    event: record.label,
    date: new Date(record.date).toLocaleDateString('zh-TW'),
    type: record.type as any
  }))

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'vaccine': return '💉'
      case 'checkup': return '🩺'
      case 'grooming': return '🛁'
      case 'medication': return '💊'
      default: return '📅'
    }
  }

  const getLatestWeight = (petId: string) => {
    const weightRecord = healthRecords.find(
      record => record.pet_id === petId && record.type === 'weight'
    )
    return weightRecord?.value || 'N/A'
  }

  const getLatestVaccine = (petId: string) => {
    const vaccineRecord = healthRecords.find(
      record => record.pet_id === petId && record.type === 'vaccine'
    )
    return vaccineRecord ? new Date(vaccineRecord.date).toLocaleDateString('zh-TW') : 'N/A'
  }

  const getWeightRecords = (petId: string) => {
    const weightRecords = healthRecords.filter(record => record.pet_id === petId && record.type === 'weight')
    return weightRecords.map(record => ({
      date: record.date,
      weight: parseFloat(record.value || '0')
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-700 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (pets.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-gray-900">Welcome to Pet Health Journal!</h2>
          <p className="text-gray-700 mb-6 font-medium">Add your first pet to start tracking their health</p>
          <Link href="/pets/new">
            <Button>Add Your First Pet</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Pet Selector */}
      <Card className="pet-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-gray-900">
            <div className="flex items-center space-x-2">
              <span>🐾</span>
              <span className="font-bold">我的毛孩</span>
            </div>
            <Link href="/pets/new">
              <Button size="sm" className="rounded-full p-2">
                <Plus className="h-4 w-4" />
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {pets.map((pet) => (
              <button
                key={pet.id}
                onClick={() => setSelectedPet(pet)}
                className={`flex-shrink-0 p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedPet?.id === pet.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white shadow-sm">
                    <Heart className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-900">{pet.name}</p>
                    <p className="text-sm text-gray-700 font-medium">{pet.breed || 'Unknown breed'}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedPet && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Tasks */}
            <Card className="reminder-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-gray-900">
                  <div className="flex items-center space-x-2">
                    <span>📋</span>
                    <span className="font-bold">今日待辦</span>
                  </div>
                  <Badge variant="secondary" className="font-semibold">
                    {todayTasks.filter(t => !t.completed).length} 項未完成
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {todayTasks.length === 0 ? (
                  <p className="text-center text-gray-700 py-4 font-medium">No tasks for today! 🎉</p>
                ) : (
                  todayTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        task.completed ? 'bg-gray-50 opacity-60' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          className="w-5 h-5 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                          readOnly
                        />
                        <div>
                          <p className={`font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {task.task}
                          </p>
                          <p className="text-sm text-gray-700 font-medium">{task.time}</p>
                        </div>
                      </div>
                      <Badge className={`${getPriorityColor(task.priority)} font-semibold`}>
                        {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Health Overview */}
            <Card className="health-record-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900">
                  <span>💝</span>
                  <span className="font-bold">{selectedPet.name} 的健康概況</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Heart className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{selectedPet.name}</p>
                      <p className="text-sm text-gray-700 font-medium">
                        {selectedPet.breed || 'Unknown breed'} • 
                        {selectedPet.birthday ? ` ${Math.floor((Date.now() - new Date(selectedPet.birthday).getTime()) / (1000 * 60 * 60 * 24 * 365))} years` : ' Age unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-700">{getLatestWeight(selectedPet.id)}</p>
                    <p className="text-xs text-gray-700 font-medium">當前體重</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-sky-50 rounded-lg text-center">
                    <p className="text-sm text-gray-700 font-medium">上次疫苗</p>
                    <p className="font-bold text-sky-800">{getLatestVaccine(selectedPet.id)}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg text-center">
                    <p className="text-sm text-gray-700 font-medium">健康狀態</p>
                    <p className="font-bold text-green-800">良好</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Events */}
          <Card className="health-record-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <span>📅</span>
                <span className="font-bold">近期安排</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <p className="text-center text-gray-700 py-4 font-medium">No upcoming events</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getEventIcon(event.type)}</span>
                        <div>
                          <p className="font-bold text-gray-900">{event.event}</p>
                          <p className="text-sm text-gray-700 font-medium">{event.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weight Chart */}
          <WeightChart 
            weightRecords={getWeightRecords(selectedPet.id)} 
            petName={selectedPet.name}
          />
        </>
      )}
    </div>
  )
} 