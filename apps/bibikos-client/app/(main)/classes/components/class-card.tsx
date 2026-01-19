import { Badge } from '@js-monorepo/components/ui/badge'
import { Button } from '@js-monorepo/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@js-monorepo/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@js-monorepo/components/ui/dropdown'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { cn } from '@js-monorepo/ui/util'
import { Calendar, Users, Edit, Trash2, MoreVertical, Video, Building, CalendarPlus, Lock, Globe } from 'lucide-react'
import { Class, Location } from '../../../../lib/scheduling'

interface ClassCardProps {
  classItem: Class
  locations: Location[]
  onEdit: () => void
  onDelete: () => void
}

export function ClassCard({ classItem, locations, onEdit, onDelete }: ClassCardProps) {
  const location = locations.find((l) => l.id === classItem.locationId)

  return (
    <Card className={cn('border-border/50 transition-all hover:shadow-md', !classItem.isActive && 'opacity-60')}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-lg">{classItem.title}</CardTitle>
              <div className="flex items-center gap-1.5">
                {classItem.isPrivate ? (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5 gap-1">
                    <Lock className="w-3 h-3" />
                    Private
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 gap-1 text-foreground-muted">
                    <Globe className="w-3 h-3" />
                    Public
                  </Badge>
                )}
                {!classItem.isActive && (
                  <Badge variant="destructive" className="text-xs px-1.5 py-0 h-5">
                    Inactive
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <DpNextNavLink href={`/calendar?action=new&classId=${classItem.id}`} className="flex items-center">
                  <CalendarPlus className="w-4 h-4 mr-2" />
                  Add Schedule
                </DpNextNavLink>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
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
      <CardContent className="space-y-3">
        {classItem.description && <p className="text-sm text-foreground-muted line-clamp-2">{classItem.description}</p>}

        <div className="flex flex-wrap gap-4 text-sm text-foreground-muted">
          {location && (
            <div className="flex items-center gap-1.5">
              {location.isOnline ? (
                <Video className="w-4 h-4 text-purple-500" />
              ) : (
                <Building className="w-4 h-4 text-green-500" />
              )}
              <span>{location.name}</span>
            </div>
          )}

          {classItem.capacity && (
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>
                {classItem.capacity} max
                {classItem.isCapacitySoft && ' (soft)'}
              </span>
            </div>
          )}
        </div>

        {classItem.waitlistLimit && classItem.waitlistLimit > 0 && (
          <p className="text-xs text-foreground-muted">Waitlist: up to {classItem.waitlistLimit} people</p>
        )}
      </CardContent>
    </Card>
  )
}
