'use client'

import { Badge } from '@js-monorepo/components/ui/badge'
import { Button } from '@js-monorepo/components/ui/button'
import { Card, CardContent } from '@js-monorepo/components/ui/card'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { cn } from '@js-monorepo/ui/util'
import { Calendar, ChevronRight, MapPin, User } from 'lucide-react'
import { DateBadge } from '../../../../components/date-badge'
import { useScheduleTime } from '../../../../lib/datetime'
import type { DiscoverClassGroup } from '../../../../lib/scheduling'

interface ClassGroupCardProps {
  group: DiscoverClassGroup
  onClick: () => void
  className?: string
}

export function ClassGroupCard({ group, onClick, className }: ClassGroupCardProps) {
  const firstSchedule = group.schedules[0]
  const { dateParts } = useScheduleTime({
    id: firstSchedule.id,
    startTimeUtc: firstSchedule.startTimeUtc,
    endTimeUtc: firstSchedule.endTimeUtc,
    localTimezone: firstSchedule.localTimezone,
  })
  const schedulesCount = group.schedules.length

  return (
    <Card className={cn('border-border rounded-3xl transition-all hover:shadow-md hover:border-primary', className)}>
      <CardContent className="px-6 py-9 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="flex gap-4 min-w-0 items-center">
            <DateBadge dateParts={dateParts} />

            <div className="space-y-3 min-w-0">
              {/* Title */}
              <DpNextNavLink
                href={`/class/${group.classId}`}
                className="group flex items-center gap-3 rounded-md py-1 px-2 hover:bg-muted"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="truncate group-hover:underline">{group.title}</h3>
              </DpNextNavLink>

              {/* Location */}
              {group.location?.name && (
                <DpNextNavLink
                  href={`/locations/${group.location.id}`}
                  className="group flex items-center justify-start gap-2 text-foreground-muted"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MapPin className="w-4 h-4" />
                  <span className="truncate group-hover:underline">{group.location.name}</span>
                </DpNextNavLink>
              )}

              {/* Time slots and instructor */}
              <div className="flex items-center gap-4 flex-wrap">
                {group.organizer?.displayName && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <User className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                    {group.organizer.slug ? (
                      <DpNextNavLink
                        href={`/instructor/${group.organizer.slug}`}
                        className="hover:underline text-primary"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {group.organizer.displayName}
                      </DpNextNavLink>
                    ) : (
                      <span className="text-muted-foreground">{group.organizer.displayName}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Tags */}
              {group.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {group.tags.map((tag) => (
                    <Badge key={tag.id} variant="outline">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Arrow indicator */}
          <div className="flex flex-col gap-3 items-center justify-end sm:justify-center px-5">
            {/* Schedule count and user bookings badge */}
            <div className="flex justify-between flex-row-reverse sm:flex-auto sm:flex-row w-full gap-2">
              {group.userBookingsCount > 0 && (
                <Badge
                  variant="outline"
                  className="border-status-success bg-status-success-bg text-status-success gap-1"
                >
                  {group.userBookingsCount} {group.userBookingsCount === 1 ? 'booking' : 'bookings'}
                </Badge>
              )}
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span>
                  {schedulesCount} {schedulesCount === 1 ? 'time' : 'times'} available
                </span>
              </div>
            </div>
            <Button
              variant="accent"
              onClick={onClick}
              className="w-full sm:w-auto flex self-end items-center gap-1.5 text-sm"
            >
              <span className="text-sm font-medium">View times</span>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
