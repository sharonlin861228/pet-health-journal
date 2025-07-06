'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { supabase, Pet } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, Save, Bell } from 'lucide-react'
import Link from 'next/link'

export default function AddReminderPage() {
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const searchParams = useSearchParams()
  const defaultCategory = searchParams.get('category') || 'other'
  
  const [formData, setFormData] = useState({
    pet_id: '',
    label: '',
    type: defaultCategory,
    priority: 'medium' as 'high' | 'medium' | 'low',
    due_date: new Date().toISOString().split('T')[0],
    repeat_interval: 'once' as 'once' | 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'yearly',
    description: ''
  })
  
  const router = useRouter()
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
      
      // Set first pet as default if available
      if (data && data.length > 0) {
        setFormData(prev => ({ ...prev, pet_id: data[0].id }))
      }
    } catch (error) {
      console.error('Error fetching pets:', error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.pet_id || !formData.label) {
      setError('請填寫所有必填欄位')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)
    
    try {
      console.log('Submitting reminder:', {
        user_id: user!.id,
        pet_id: formData.pet_id,
        label: formData.label,
        type: formData.type,
        priority: formData.priority,
        due_date: formData.due_date,
        repeat_interval: formData.repeat_interval,
        description: formData.description || null,
        is_done: false
      })

      const { data, error } = await supabase
        .from('reminders')
        .insert({
          user_id: user!.id,
          pet_id: formData.pet_id,
          label: formData.label,
          type: formData.type,
          priority: formData.priority,
          due_date: formData.due_date,
          repeat_interval: formData.repeat_interval,
          description: formData.description || null,
          is_done: false
        })
        .select()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Reminder created successfully:', data)
      setSuccess(true)
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push('/reminders')
      }, 1500)
      
    } catch (error: any) {
      console.error('Error adding reminder:', error)
      setError(error.message || '新增提醒時發生錯誤')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'medical':
        return { icon: '🩺', label: '醫療', color: 'bg-red-100 text-red-800' }
      case 'medication':
        return { icon: '💊', label: '用藥', color: 'bg-blue-100 text-blue-800' }
      case 'grooming':
        return { icon: '🛁', label: '美容', color: 'bg-purple-100 text-purple-800' }
      case 'health':
        return { icon: '❤️', label: '健康', color: 'bg-green-100 text-green-800' }
      default:
        return { icon: '📋', label: '其他', color: 'bg-gray-100 text-gray-800' }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/reminders">
          <Button variant="ghost" size="sm" className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">新增提醒事項</h1>
          <p className="text-gray-700">Create a new reminder for your pet</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900">提醒事項詳情</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">❌ {error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">✅ 提醒事項新增成功！正在跳轉...</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pet Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                選擇寵物 *
              </label>
              <select
                value={formData.pet_id}
                onChange={(e) => handleInputChange('pet_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a pet</option>
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name} {pet.breed && `(${pet.breed})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                類別 *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="medical">🩺 醫療</option>
                <option value="medication">💊 用藥</option>
                <option value="grooming">🛁 美容</option>
                <option value="health">❤️ 健康</option>
                <option value="other">📋 其他</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                標題 *
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => handleInputChange('label', e.target.value)}
                placeholder="e.g., 五合一疫苗接種, 心絲蟲預防用藥"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                描述 (可選)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Additional details about this reminder..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                優先級 *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="high">🔴 高優先</option>
                <option value="medium">🟡 中優先</option>
                <option value="low">🟢 低優先</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                到期日期 *
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Repeat Interval */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                重複頻率 *
              </label>
              <select
                value={formData.repeat_interval}
                onChange={(e) => handleInputChange('repeat_interval', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="once">一次性</option>
                <option value="daily">每日</option>
                <option value="weekly">每週</option>
                <option value="bi-weekly">雙週</option>
                <option value="monthly">每月</option>
                <option value="yearly">每年</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <Link href="/reminders">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>Save Reminder</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 