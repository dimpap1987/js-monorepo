import { DpButton } from '@js-monorepo/button'
import { Card, CardContent, CardHeader, CardTitle } from '@js-monorepo/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@js-monorepo/components/ui/dropdown'
import { cn } from '@js-monorepo/ui/util'
import { Building, Video, Edit, Trash2, Globe, Clock, MoreVertical, MapPin } from 'lucide-react'
import { Location, COUNTRIES } from '../../../../lib/scheduling'

interface LocationCardProps {
  location: Location
  onEdit: () => void
  onDelete: () => void
}

export function LocationCard({ location, onEdit, onDelete }: LocationCardProps) {
  const country = COUNTRIES.find((c) => c.code === location.countryCode)

  return (
    <Card className={cn('border-border/50 transition-all hover:shadow-md', !location.isActive && 'opacity-60')}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                location.isOnline ? 'bg-purple-500/10' : 'bg-green-500/10'
              )}
            >
              {location.isOnline ? (
                <Video className="w-5 h-5 text-purple-500" />
              ) : (
                <Building className="w-5 h-5 text-green-500" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{location.name}</CardTitle>
              {!location.isActive && <span className="text-xs text-foreground-muted">(Inactive)</span>}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <DpButton variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </DpButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {location.isOnline ? (
          location.onlineUrl && (
            <div className="flex items-center gap-2 text-sm text-foreground-muted">
              <Globe className="w-4 h-4" />
              <span className="truncate">{location.onlineUrl}</span>
            </div>
          )
        ) : (
          <>
            {(location.city || country) && (
              <div className="flex items-center gap-2 text-sm text-foreground-muted">
                <MapPin className="w-4 h-4" />
                <span>{[location.city, country?.name].filter(Boolean).join(', ')}</span>
              </div>
            )}
            {location.address && <p className="text-sm text-foreground-muted pl-6">{location.address}</p>}
          </>
        )}
        <div className="flex items-center gap-2 text-sm text-foreground-muted">
          <Clock className="w-4 h-4" />
          <span>{location.timezone}</span>
        </div>
      </CardContent>
    </Card>
  )
}
