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
import { Calendar, Users, Edit, Trash2, MoreVertical, Video, Building, CalendarPlus } from 'lucide-react'
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
            <div>
              <CardTitle className="text-lg">{classItem.title}</CardTitle>
              {!classItem.isActive && <span className="text-xs text-foreground-muted">(Inactive)</span>}
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
