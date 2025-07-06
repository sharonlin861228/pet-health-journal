'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { supabase, Pet } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, Save, Upload, X, FileText, Image, File } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  url?: string
  file?: File
}

export default function AddHealthRecordPage() {
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const searchParams = useSearchParams()
  const defaultType = searchParams.get('type') || 'checkup'
  
  const [formData, setFormData] = useState({
    pet_id: '',
    type: defaultType as 'vaccine' | 'checkup' | 'medication' | 'weight',
    label: '',
    value: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    veterinarian: '',
    clinic: ''
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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert(`File ${file.name} is too large. Maximum size is 10MB.`)
        return
      }
      
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'text/plain']
      if (!allowedTypes.includes(file.type)) {
        alert(`File type ${file.type} is not supported. Please upload PDF, image, or text files.`)
        return
      }

      const newFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        file: file
      }
      
      setUploadedFiles(prev => [...prev, newFile])
    })
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />
    if (type === 'application/pdf') return <FileText className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  async function uploadFiles() {
    const uploadedUrls: string[] = []
    
    for (const file of uploadedFiles) {
      if (file.file) {
        const fileName = `${Date.now()}-${file.name}`
        const { data, error } = await supabase.storage
          .from('health-records')
          .upload(fileName, file.file)
        
        if (error) {
          console.error('Error uploading file:', error)
          throw error
        }
        
        const { data: urlData } = supabase.storage
          .from('health-records')
          .getPublicUrl(fileName)
        
        uploadedUrls.push(urlData.publicUrl)
      }
    }
    
    return uploadedUrls
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.pet_id || !formData.label) return

    setLoading(true)
    try {
      let attachmentUrls: string[] = []
      
      // Upload files if any
      if (uploadedFiles.length > 0) {
        setUploading(true)
        attachmentUrls = await uploadFiles()
        setUploading(false)
      }

      const { error } = await supabase
        .from('health_records')
        .insert({
          pet_id: formData.pet_id,
          type: formData.type,
          label: formData.label,
          value: formData.value || null,
          date: formData.date,
          notes: formData.notes || null,
          veterinarian: formData.veterinarian || null,
          clinic: formData.clinic || null,
          attachments: attachmentUrls.length > 0 ? attachmentUrls : null
        })

      if (error) throw error

      router.push('/health-records')
    } catch (error) {
      console.error('Error adding health record:', error)
      setUploading(false)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/health-records">
          <Button variant="ghost" size="sm" className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">新增健康紀錄</h1>
          <p className="text-gray-700">Add a new health record for your pet</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900">健康紀錄詳情</CardTitle>
        </CardHeader>
        <CardContent>
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

            {/* Record Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                紀錄類型 *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="checkup">健康檢查</option>
                <option value="vaccine">疫苗接種</option>
                <option value="medication">藥物治療</option>
                <option value="weight">體重測量</option>
              </select>
            </div>

            {/* Label */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                標題 *
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => handleInputChange('label', e.target.value)}
                placeholder="e.g., Annual checkup, Rabies vaccine"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                數值 (可選)
              </label>
              <input
                type="text"
                value={formData.value}
                onChange={(e) => handleInputChange('value', e.target.value)}
                placeholder="e.g., 25kg, 3.5ml, Normal"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                日期 *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Veterinarian */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                獸醫師 (可選)
              </label>
              <input
                type="text"
                value={formData.veterinarian}
                onChange={(e) => handleInputChange('veterinarian', e.target.value)}
                placeholder="e.g., 王醫師"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Clinic */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                診所 (可選)
              </label>
              <input
                type="text"
                value={formData.clinic}
                onChange={(e) => handleInputChange('clinic', e.target.value)}
                placeholder="e.g., 愛心動物醫院"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                備註 (可選)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes about this health record..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                附件 (可選)
              </label>
              
              {/* Drag & Drop Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  拖拽檔案到這裡或
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-700 font-medium ml-1"
                  >
                    點擊上傳
                  </button>
                </p>
                <p className="text-xs text-gray-500">
                  支援 PDF、圖片、文字檔案 (最大 10MB)
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.txt"
                  onChange={(e) => e.target.files && handleFiles(e.target.files)}
                  className="hidden"
                />
              </div>

              {/* File List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-gray-700">已選擇的檔案：</p>
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file.type)}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <Link href="/health-records">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading || uploading}>
                {loading || uploading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{uploading ? 'Uploading...' : 'Saving...'}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>Save Record</span>
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