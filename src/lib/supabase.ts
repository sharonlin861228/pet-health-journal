import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Pet {
  id: string
  user_id: string
  name: string
  photo_url?: string
  breed?: string
  birthday?: string
  created_at: string
  updated_at: string
}

export interface HealthRecord {
  id: string
  pet_id: string
  type: 'vaccine' | 'checkup' | 'medication' | 'weight'
  label: string
  value?: string
  date: string
  notes?: string
  veterinarian?: string
  clinic?: string
  attachments?: string[]
  created_at: string
  updated_at: string
  pets?: {
    name: string
    breed?: string
  }
}

export interface BehaviorLog {
  id: string
  pet_id: string
  label: string
  notes?: string
  date: string
  created_at: string
  updated_at: string
}

export interface Reminder {
  id: string
  user_id: string
  pet_id?: string
  label: string
  type?: string
  priority?: 'high' | 'medium' | 'low'
  repeat_interval?: string
  due_date: string
  description?: string
  is_done: boolean
  created_at: string
  updated_at: string
  pets?: {
    name: string
    breed?: string
  }
} 