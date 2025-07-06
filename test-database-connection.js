// Test Database Connection and Table Existence
// Run this with: node test-database-connection.js

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables from .env.local
const envPath = path.join(__dirname, '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim()
    }
  })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.log('Please check your .env.local file has:')
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testDatabase() {
  console.log('🔍 Testing database connection...\n')

  try {
    // Test 1: Check if we can connect
    console.log('1. Testing connection...')
    const { data: authData, error: authError } = await supabase.auth.getSession()
    if (authError) {
      console.log('❌ Auth error:', authError.message)
    } else {
      console.log('✅ Connection successful')
    }

    // Test 2: Check if pets table exists
    console.log('\n2. Checking pets table...')
    const { data: petsData, error: petsError } = await supabase
      .from('pets')
      .select('count')
      .limit(1)
    
    if (petsError) {
      console.log('❌ Pets table error:', petsError.message)
    } else {
      console.log('✅ Pets table exists')
    }

    // Test 3: Check if reminders table exists
    console.log('\n3. Checking reminders table...')
    const { data: remindersData, error: remindersError } = await supabase
      .from('reminders')
      .select('count')
      .limit(1)
    
    if (remindersError) {
      console.log('❌ Reminders table error:', remindersError.message)
      console.log('💡 You need to create the reminders table!')
      console.log('   Run the SQL in safe-database-setup.sql in your Supabase SQL Editor')
    } else {
      console.log('✅ Reminders table exists')
    }

    // Test 4: Check if health_records table exists
    console.log('\n4. Checking health_records table...')
    const { data: healthData, error: healthError } = await supabase
      .from('health_records')
      .select('count')
      .limit(1)
    
    if (healthError) {
      console.log('❌ Health records table error:', healthError.message)
    } else {
      console.log('✅ Health records table exists')
    }

    // Test 5: List all tables
    console.log('\n5. Listing all tables...')
    const { data: tablesData, error: tablesError } = await supabase
      .rpc('get_tables')
      .select('*')
    
    if (tablesError) {
      console.log('❌ Could not list tables:', tablesError.message)
    } else {
      console.log('✅ Available tables:', tablesData)
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testDatabase() 