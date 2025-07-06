'use client'

import { useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface WeightRecord {
  date: string
  weight: number
}

interface WeightChartProps {
  weightRecords: WeightRecord[]
  petName?: string
  className?: string
}

export default function WeightChart({ weightRecords, petName, className = '' }: WeightChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || weightRecords.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const width = canvas.width
    const height = canvas.height
    const padding = 40

    // Sort records by date
    const sortedRecords = [...weightRecords].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    if (sortedRecords.length === 0) {
      // Draw empty state
      ctx.fillStyle = '#9CA3AF'
      ctx.font = '16px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('尚無體重記錄', width / 2, height / 2)
      return
    }

    // Calculate scales
    const weights = sortedRecords.map(r => r.weight)
    const minWeight = Math.min(...weights)
    const maxWeight = Math.max(...weights)
    const weightRange = maxWeight - minWeight || 1

    const xScale = (width - 2 * padding) / (sortedRecords.length - 1)
    const yScale = (height - 2 * padding) / weightRange

    // Draw grid lines
    ctx.strokeStyle = '#E5E7EB'
    ctx.lineWidth = 1

    // Vertical grid lines
    for (let i = 0; i < sortedRecords.length; i++) {
      const x = padding + i * xScale
      ctx.beginPath()
      ctx.moveTo(x, padding)
      ctx.lineTo(x, height - padding)
      ctx.stroke()
    }

    // Horizontal grid lines
    const gridLines = 5
    for (let i = 0; i <= gridLines; i++) {
      const y = padding + (i * (height - 2 * padding)) / gridLines
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(width - padding, y)
      ctx.stroke()
    }

    // Draw weight line
    ctx.strokeStyle = '#3B82F6'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    ctx.beginPath()
    sortedRecords.forEach((record, i) => {
      const x = padding + i * xScale
      const y = height - padding - ((record.weight - minWeight) * yScale)
      
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Draw data points
    ctx.fillStyle = '#3B82F6'
    sortedRecords.forEach((record, i) => {
      const x = padding + i * xScale
      const y = height - padding - ((record.weight - minWeight) * yScale)
      
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fill()
    })

    // Draw labels
    ctx.fillStyle = '#6B7280'
    ctx.font = '12px system-ui'
    ctx.textAlign = 'center'

    // X-axis labels (dates)
    sortedRecords.forEach((record, i) => {
      const x = padding + i * xScale
      const date = new Date(record.date)
      const label = `${date.getMonth() + 1}/${date.getDate()}`
      ctx.fillText(label, x, height - padding + 20)
    })

    // Y-axis labels (weights)
    ctx.textAlign = 'right'
    for (let i = 0; i <= gridLines; i++) {
      const y = padding + (i * (height - 2 * padding)) / gridLines
      const weight = maxWeight - (i * weightRange / gridLines)
      ctx.fillText(weight.toFixed(1), padding - 10, y + 4)
    }

    // Draw title
    ctx.fillStyle = '#374151'
    ctx.font = 'bold 16px system-ui'
    ctx.textAlign = 'center'
    const title = petName ? `${petName} 的體重變化` : '體重變化'
    ctx.fillText(title, width / 2, padding - 10)

  }, [weightRecords, petName])

  if (weightRecords.length === 0) {
    return (
      <Card className={`health-record-card ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>📊</span>
            <span>體重趨勢</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-b from-blue-50 to-sky-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <span className="text-4xl block mb-2">📈</span>
              <p>尚無體重記錄</p>
              <p className="text-sm">添加體重記錄以查看趨勢</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`health-record-card ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>📊</span>
          <span>體重趨勢</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 relative">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ background: 'linear-gradient(to bottom, #EFF6FF, #DBEAFE)' }}
          />
        </div>
      </CardContent>
    </Card>
  )
} 