import Image from 'next/image'
import { Heart, Calendar, Weight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Pet } from '@/lib/supabase'

interface PetCardProps {
  pet: Pet
  latestWeight?: string
  lastLog?: string
  onClick?: () => void
}

export function PetCard({ pet, latestWeight, lastLog, onClick }: PetCardProps) {
  const age = pet.birthday 
    ? Math.floor((Date.now() - new Date(pet.birthday).getTime()) / (1000 * 60 * 60 * 24 * 365))
    : null

  return (
    <Card 
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-full bg-gray-100">
            {pet.photo_url ? (
              <Image
                src={pet.photo_url}
                alt={pet.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Heart className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{pet.name}</CardTitle>
            <p className="text-sm text-gray-600">{pet.breed}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {age !== null && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{age} years old</span>
            </div>
          )}
          {latestWeight && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Weight className="h-4 w-4" />
              <span>{latestWeight}</span>
            </div>
          )}
          {lastLog && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Last log:</span> {lastLog}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 