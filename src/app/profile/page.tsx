'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { useAuth } from '@/contexts/AuthContext'
import { LogOut, User, Settings as SettingsIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const { user, signOut } = useAuth()
  const router = useRouter()

  const [settings, setSettings] = useState({
    // Notification settings
    pushNotifications: true,
    lineNotify: false,
    emailNotifications: true,
    soundAlerts: true,
    
    // Language and region
    traditionalChinese: true,
    time24Hour: false,
    metricUnits: true,
    
    // Privacy and security
    biometricUnlock: false,
    autoBackup: true,
    anonymousAnalytics: false
  })

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    // Here you would typically save to database or localStorage
  }

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await signOut()
      router.push('/auth')
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setLoading(false)
    }
  }

  const settingsSections = [
    {
      title: '通知設定',
      icon: '🔔',
      items: [
        { 
          key: 'pushNotifications',
          label: 'App 推播通知', 
          description: '接收應用程式推播提醒', 
          enabled: settings.pushNotifications 
        },
        { 
          key: 'lineNotify',
          label: 'Line Notify 整合', 
          description: '透過 Line 接收提醒訊息', 
          enabled: settings.lineNotify 
        },
        { 
          key: 'emailNotifications',
          label: '郵件通知', 
          description: '重要事項郵件提醒', 
          enabled: settings.emailNotifications 
        },
        { 
          key: 'soundAlerts',
          label: '聲音提醒', 
          description: '播放提醒音效', 
          enabled: settings.soundAlerts 
        }
      ]
    },
    {
      title: '語言與地區',
      icon: '🌐',
      items: [
        { 
          key: 'traditionalChinese',
          label: '繁體中文', 
          description: '顯示語言設定', 
          enabled: settings.traditionalChinese 
        },
        { 
          key: 'time24Hour',
          label: '24小時制', 
          description: '時間顯示格式', 
          enabled: settings.time24Hour 
        },
        { 
          key: 'metricUnits',
          label: '公制單位', 
          description: '使用公斤、公分等單位', 
          enabled: settings.metricUnits 
        }
      ]
    },
    {
      title: '隱私與安全',
      icon: '🔒',
      items: [
        { 
          key: 'biometricUnlock',
          label: '生物識別解鎖', 
          description: '使用指紋或面部解鎖', 
          enabled: settings.biometricUnlock 
        },
        { 
          key: 'autoBackup',
          label: '自動備份', 
          description: '定期備份資料到雲端', 
          enabled: settings.autoBackup 
        },
        { 
          key: 'anonymousAnalytics',
          label: '匿名數據分析', 
          description: '協助改善應用程式體驗', 
          enabled: settings.anonymousAnalytics 
        }
      ]
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="pet-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>⚙️</span>
              <span>應用程式設定</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {user?.email}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Settings Sections */}
      {settingsSections.map((section, sectionIndex) => (
        <Card key={sectionIndex} className="health-record-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>{section.icon}</span>
              <span>{section.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {section.items.map((item, itemIndex) => (
              <div key={itemIndex} className="flex items-center justify-between py-2">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
                <Switch 
                  checked={item.enabled}
                  onCheckedChange={(checked) => handleSettingChange(item.key, checked)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Data Management */}
      <Card className="health-record-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>💾</span>
            <span>資料管理</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-1">
              <span className="text-xl">📤</span>
              <span className="text-sm">匯出 PDF 報告</span>
            </Button>
            
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-1">
              <span className="text-xl">☁️</span>
              <span className="text-sm">備份到雲端</span>
            </Button>
            
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center space-y-1">
              <span className="text-xl">📥</span>
              <span className="text-sm">還原資料</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-16 flex flex-col items-center justify-center space-y-1 text-red-600 border-red-200 hover:bg-red-50"
            >
              <span className="text-xl">🗑️</span>
              <span className="text-sm">清除所有資料</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* App Information */}
      <Card className="health-record-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>ℹ️</span>
            <span>應用程式資訊</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-700">版本</span>
            <span className="text-gray-500">1.0.0</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-700">最後更新</span>
            <span className="text-gray-500">2024年6月30日</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-700">資料庫大小</span>
            <span className="text-gray-500">2.4 MB</span>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm">
                使用條款
              </Button>
              <Button variant="outline" size="sm">
                隱私政策
              </Button>
              <Button variant="outline" size="sm">
                意見回饋
              </Button>
              <Button variant="outline" size="sm">
                聯絡我們
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="health-record-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>👤</span>
            <span>帳戶管理</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex-1">
              <p className="font-medium text-gray-800">登出帳戶</p>
              <p className="text-sm text-gray-500">安全登出並清除本地資料</p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleSignOut}
              disabled={loading}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  <span>登出中...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <LogOut className="h-4 w-4" />
                  <span>登出</span>
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 