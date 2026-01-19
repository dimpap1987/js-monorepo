import { Badge } from '@js-monorepo/components/ui/badge'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { BookOpen, Lock, MapPin, User, Video } from 'lucide-react'
import type { ClassViewResponse } from '../../../../../lib/scheduling'

interface ClassDetailHeroProps {
  classData: ClassViewResponse
}

export function ClassDetailHero({ classData }: ClassDetailHeroProps) {
  return (
    <div className="relative bg-primary/5 border-b border-border/50">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-primary/10 flex items-center justify-center ring-4 ring-background">
            <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
              <h1 className="text-3xl sm:text-4xl font-bold">{classData.title}</h1>
              {classData.isPrivate && (
                <Badge variant="secondary" className="gap-1">
                  <Lock className="w-3 h-3" />
                  Private
                </Badge>
              )}
            </div>

            {classData.organizer.displayName && (
              <div className="flex items-center justify-center sm:justify-start gap-2 text-foreground-muted mb-4">
                <User className="w-4 h-4" />
                <span>by </span>
                {classData.organizer.slug ? (
                  <DpNextNavLink href={`/coach/${classData.organizer.slug}`} className="hover:underline text-primary">
                    {classData.organizer.displayName}
                  </DpNextNavLink>
                ) : (
                  <span>{classData.organizer.displayName}</span>
                )}
                {classData.organizer.activityLabel && (
                  <Badge variant="outline" className="ml-2">
                    {classData.organizer.activityLabel}
                  </Badge>
                )}
              </div>
            )}

            <div className="flex items-center justify-center sm:justify-start gap-2 text-foreground-muted mb-4">
              {classData.location.isOnline ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
              <span>{classData.location.name}</span>
            </div>

            {classData.description && (
              <p className="text-foreground-muted max-w-2xl leading-relaxed">{classData.description}</p>
            )}

            {classData.capacity && (
              <p className="text-sm text-foreground-muted mt-4">Class capacity: {classData.capacity} participants</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
