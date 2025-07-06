'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { supabase, Pet } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Plus, Heart, Calendar, Weight, Activity } from 'lucide-react'
import Link from 'next/link'

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchPets()
    }
  }, [user])

  async function fetchPets() {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .order('name')

      if (error) throw error
      setPets(data || [])
    } catch (error) {
      console.error('Error fetching pets:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAgeFromBirthday = (birthday: string) => {
    if (!birthday) return '未知'
    const birthDate = new Date(birthday)
    const today = new Date()
    const ageInYears = today.getFullYear() - birthDate.getFullYear()
    const ageInMonths = today.getMonth() - birthDate.getMonth()
    
    if (ageInYears > 0) {
      return `${ageInYears}歲${ageInMonths > 0 ? ` ${ageInMonths}個月` : ''}`
    } else if (ageInMonths > 0) {
      return `${ageInMonths}個月`
    } else {
      const ageInDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24))
      return `${ageInDays}天`
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-700 font-medium">Loading pets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="pet-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>🐾</span>
              <span>寵物檔案</span>
            </div>
            <Link href="/pets/new">
              <Button className="bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600">
                <span className="mr-2">➕</span>
                新增寵物
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Pets Grid */}
      {pets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <Heart className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">No pets yet</h3>
            <p className="text-gray-700 mb-6">Add your first pet to start tracking their health</p>
            <Link href="/pets/new">
              <Button>Add Pet</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pets.map((pet) => (
            <Link key={pet.id} href={`/pets/${pet.id}`}>
              <Card className="pet-card hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-sky-100 flex items-center justify-center border-4 border-white shadow-lg">
                        {pet.photo_url ? (
                          <img
                            src={pet.photo_url}
                            alt={pet.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl">🐕</span>
                        )}
                      </div>
                      <button className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full shadow-md hover:bg-blue-600 transition-colors">
                        📷
                      </button>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{pet.name}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {pet.breed && (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            {pet.breed}
                          </Badge>
                        )}
                        {pet.birthday && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            {getAgeFromBirthday(pet.birthday)}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center space-x-2">
                          <Weight className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">體重</span>
                          <span className="font-medium text-gray-800">--</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">下次檢查</span>
                          <span className="font-medium text-gray-800">--</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="text-xs">
                          查看檔案
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          健康紀錄
                        </Button>
                      </div>
                      <div className="text-xs text-gray-500">
                        加入 {new Date(pet.created_at).toLocaleDateString('zh-TW')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      {pets.length > 0 && (
        <Card className="health-record-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>📊</span>
              <span>寵物統計</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{pets.length}</div>
                <div className="text-sm text-gray-600">總寵物數</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-600">健康紀錄</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">0</div>
                <div className="text-sm text-gray-600">待辦提醒</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">0</div>
                <div className="text-sm text-gray-600">本月檢查</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 