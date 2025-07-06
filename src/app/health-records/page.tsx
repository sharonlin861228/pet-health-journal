'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { supabase, Pet, HealthRecord } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Plus, Calendar, User, Building } from 'lucide-react'
import Link from 'next/link'

interface ExtendedHealthRecord extends HealthRecord {
  pets?: {
    name: string
    breed?: string
  }
  veterinarian?: string
  clinic?: string
  attachments?: string[]
}

export default function HealthRecordsPage() {
  const [pets, setPets] = useState<Pet[]>([])
  const [selectedPet, setSelectedPet] = useState<string>('all')
  const [healthRecords, setHealthRecords] = useState<ExtendedHealthRecord[]>([])
  const [filter, setFilter] = useState('all')
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

      // Fetch health records
      let query = supabase
        .from('health_records')
        .select(`
          *,
          pets(name, breed)
        `)
        .order('date', { ascending: false })

      if (selectedPet !== 'all') {
        query = query.eq('pet_id', selectedPet)
      }

      const { data: recordsData, error: recordsError } = await query

      if (recordsError) throw recordsError

      setPets(petsData || [])
      setHealthRecords(recordsData || [])
    } catch (error) {
      console.error('Error fetching health records:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'vaccine':
        return { icon: '💉', label: '疫苗', color: 'bg-green-100 text-green-800 border-green-200' }
      case 'checkup':
        return { icon: '🩺', label: '檢查', color: 'bg-blue-100 text-blue-800 border-blue-200' }
      case 'weight':
        return { icon: '⚖️', label: '體重', color: 'bg-purple-100 text-purple-800 border-purple-200' }
      case 'medication':
        return { icon: '💊', label: '用藥', color: 'bg-orange-100 text-orange-800 border-orange-200' }
      default:
        return { icon: '📋', label: '其他', color: 'bg-gray-100 text-gray-800 border-gray-200' }
    }
  }

  const filteredRecords = filter === 'all' 
    ? healthRecords 
    : healthRecords.filter(record => record.type === filter)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-700 font-medium">Loading health records...</p>
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
              <span>📋</span>
              <span>
                {selectedPetData ? `${selectedPetData.name} 的健康紀錄` : '健康紀錄'}
              </span>
            </div>
            <Link href="/add/health">
              <Button className="bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600">
                <span className="mr-2">➕</span>
                新增紀錄
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

          {/* Type Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              全部紀錄
            </button>
            <button
              onClick={() => setFilter('vaccine')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'vaccine'
                  ? 'bg-green-500 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              💉 疫苗
            </button>
            <button
              onClick={() => setFilter('checkup')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'checkup'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              🩺 檢查
            </button>
            <button
              onClick={() => setFilter('weight')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'weight'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              ⚖️ 體重
            </button>
            <button
              onClick={() => setFilter('medication')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'medication'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              💊 用藥
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      {filteredRecords.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">No health records yet</h3>
            <p className="text-gray-700 mb-6">Add your first health record to start tracking</p>
            <Link href="/add/health">
              <Button>Add Health Record</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 to-sky-300"></div>
          
          <div className="space-y-6">
            {filteredRecords.map((record, index) => {
              const typeInfo = getTypeInfo(record.type)
              
              return (
                <div key={record.id} className="relative">
                  <div className="absolute left-6 w-4 h-4 bg-white border-4 border-blue-400 rounded-full"></div>
                  
                  <Card className="ml-16 health-record-card hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{typeInfo.icon}</span>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">{record.label}</h3>
                            <p className="text-sm text-gray-500">
                              {new Date(record.date).toLocaleDateString('zh-TW')}
                            </p>
                          </div>
                        </div>
                        <Badge className={typeInfo.color}>
                          {typeInfo.label}
                        </Badge>
                      </div>
                      
                      {record.value && (
                        <p className="text-gray-700 mb-4">{record.value}</p>
                      )}
                      
                      {record.pets && (
                        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                          <span className="font-medium">🐾 {record.pets.name}</span>
                          {record.pets.breed && (
                            <span className="text-gray-500">({record.pets.breed})</span>
                          )}
                        </div>
                      )}
                      
                      {(record.veterinarian || record.clinic) && (
                        <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                          {record.veterinarian && (
                            <span className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>{record.veterinarian}</span>
                            </span>
                          )}
                          {record.clinic && (
                            <span className="flex items-center space-x-1">
                              <Building className="h-3 w-3" />
                              <span>{record.clinic}</span>
                            </span>
                          )}
                        </div>
                      )}
                      
                      {record.notes && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                          <p className="text-sm text-yellow-800">
                            <span className="font-medium">備註：</span>
                            {record.notes}
                          </p>
                        </div>
                      )}
                      
                      {record.attachments && record.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {record.attachments.map((attachment, idx) => (
                            <button
                              key={idx}
                              className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              <span>📎</span>
                              <span>{attachment}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
} 