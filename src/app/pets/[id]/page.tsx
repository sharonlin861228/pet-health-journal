'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { supabase, Pet, HealthRecord } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, Edit, Camera, Weight, Calendar, Heart, Activity } from 'lucide-react'
import WeightChart from '@/components/WeightChart'
import Link from 'next/link'

export default function PetProfilePage() {
  const [pet, setPet] = useState<Pet | null>(null)
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([])
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()

  const petId = params.id as string

  useEffect(() => {
    if (user && petId) {
      fetchPetData()
    }
  }, [user, petId])

  async function fetchPetData() {
    try {
      // Fetch pet details
      const { data: petData, error: petError } = await supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .single()

      if (petError) throw petError

      // Fetch health records for this pet
      const { data: recordsData, error: recordsError } = await supabase
        .from('health_records')
        .select('*')
        .eq('pet_id', petId)
        .order('date', { ascending: false })

      if (recordsError) throw recordsError

      setPet(petData)
      setHealthRecords(recordsData || [])
    } catch (error) {
      console.error('Error fetching pet data:', error)
      router.push('/pets')
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

  const getLatestWeight = () => {
    const weightRecords = healthRecords.filter(record => record.type === 'weight')
    if (weightRecords.length > 0) {
      return weightRecords[0].value || '未知'
    }
    return '未知'
  }

  const getLatestVaccine = () => {
    const vaccineRecords = healthRecords.filter(record => record.type === 'vaccine')
    if (vaccineRecords.length > 0) {
      return new Date(vaccineRecords[0].date).toLocaleDateString('zh-TW')
    }
    return '無記錄'
  }

  const getLatestCheckup = () => {
    const checkupRecords = healthRecords.filter(record => record.type === 'checkup')
    if (checkupRecords.length > 0) {
      return new Date(checkupRecords[0].date).toLocaleDateString('zh-TW')
    }
    return '無記錄'
  }

  const getWeightRecords = () => {
    const weightRecords = healthRecords.filter(record => record.type === 'weight')
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
          <p className="mt-2 text-gray-700 font-medium">Loading pet profile...</p>
        </div>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2 text-gray-900">Pet not found</h3>
        <Link href="/pets">
          <Button>Back to Pets</Button>
        </Link>
      </div>
    )
  }

  const healthStats = [
    { 
      label: '體重', 
      value: getLatestWeight(), 
      trend: '上次更新: ' + (healthRecords.filter(r => r.type === 'weight')[0]?.date ? new Date(healthRecords.filter(r => r.type === 'weight')[0].date).toLocaleDateString('zh-TW') : '無記錄'), 
      icon: '⚖️' 
    },
    { 
      label: '疫苗狀態', 
      value: getLatestVaccine() !== '無記錄' ? '已完成' : '待接種', 
      trend: getLatestVaccine() !== '無記錄' ? `上次: ${getLatestVaccine()}` : '需要接種', 
      icon: '💉' 
    },
    { 
      label: '健康狀況', 
      value: getLatestCheckup() !== '無記錄' ? '良好' : '待檢查', 
      trend: getLatestCheckup() !== '無記錄' ? `上次檢查: ${getLatestCheckup()}` : '建議檢查', 
      icon: '❤️' 
    },
    { 
      label: '活動力', 
      value: '活躍', 
      trend: '平均每日 2 小時', 
      icon: '🏃‍♂️' 
    }
  ]

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="pet-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-sky-100 flex items-center justify-center border-4 border-white shadow-lg">
                {pet.photo_url ? (
                  <img
                    src={pet.photo_url}
                    alt={pet.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-4xl">🐕</span>
                )}
              </div>
              <button className="absolute bottom-2 right-2 bg-blue-500 text-white p-2 rounded-full shadow-md hover:bg-blue-600 transition-colors">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{pet.name}</h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                {pet.breed && (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">{pet.breed}</Badge>
                )}
                {pet.birthday && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    {getAgeFromBirthday(pet.birthday)}
                  </Badge>
                )}
                <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                  {getLatestWeight()}
                </Badge>
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <Link href={`/pets/${pet.id}/edit`}>
                  <Button className="bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600">
                    <Edit className="h-4 w-4 mr-2" />
                    編輯資料
                  </Button>
                </Link>
                <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                  <Camera className="h-4 w-4 mr-2" />
                  添加照片
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {healthStats.map((stat, index) => (
          <Card key={index} className="health-record-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{stat.icon}</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-lg font-semibold text-gray-800">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.trend}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Basic Information */}
      <Card className="health-record-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>📝</span>
            <span>基本資料</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">姓名</label>
                <p className="text-lg text-gray-800">{pet.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">品種</label>
                <p className="text-lg text-gray-800">{pet.breed || '未知'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">年齡</label>
                <p className="text-lg text-gray-800">{pet.birthday ? getAgeFromBirthday(pet.birthday) : '未知'}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">當前體重</label>
                <p className="text-lg text-gray-800">{getLatestWeight()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">晶片號碼</label>
                <p className="text-lg text-gray-800">900-123-456-789</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">註冊日期</label>
                <p className="text-lg text-gray-800">{new Date(pet.created_at).toLocaleDateString('zh-TW')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weight Trend */}
      <WeightChart 
        weightRecords={getWeightRecords()} 
        petName={pet.name}
      />

      {/* Quick Actions */}
      <Card className="health-record-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>⚡</span>
            <span>快速操作</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href={`/add/health?type=weight&pet_id=${pet.id}`}>
              <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center space-y-1">
                <span className="text-xl">⚖️</span>
                <span className="text-sm">記錄體重</span>
              </Button>
            </Link>
            <Link href={`/add/health?type=vaccine&pet_id=${pet.id}`}>
              <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center space-y-1">
                <span className="text-xl">💉</span>
                <span className="text-sm">疫苗記錄</span>
              </Button>
            </Link>
            <Link href={`/add/health?type=checkup&pet_id=${pet.id}`}>
              <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center space-y-1">
                <span className="text-xl">🩺</span>
                <span className="text-sm">健康檢查</span>
              </Button>
            </Link>
            <Link href={`/add/reminder?pet_id=${pet.id}`}>
              <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center space-y-1">
                <span className="text-xl">🔔</span>
                <span className="text-sm">新增提醒</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 