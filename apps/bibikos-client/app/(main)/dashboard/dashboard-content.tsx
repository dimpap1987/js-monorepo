'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { Button } from '@js-monorepo/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@js-monorepo/components/ui/card'
import { Skeleton } from '@js-monorepo/components/ui/skeleton'
import { DpNextNavLink } from '@js-monorepo/nav-link'
import { ContainerTemplate } from '@js-monorepo/templates'
import { cn } from '@js-monorepo/ui/util'
import { endOfDay, endOfWeek, format, startOfDay, startOfWeek } from 'date-fns'
import { ArrowRight, Calendar, Clock, MapPin, Plus, TrendingUp, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ClassSchedule, useClasses, useLocations, useOrganizer, useSchedulesCalendar } from '../../../lib/scheduling'
import { SentInvitationsCard } from './components/sent-invitations-card'

function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-48 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-16 mt-2" />
                </div>
                <Skeleton className="h-12 w-12 rounded-xl" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Sent Invitations Skeleton */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-52 mt-1" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </CardContent>
      </Card>
    </div>
  )
}

export function DashboardContent() {
  const t = useTranslations('scheduling.dashboard')
  const { session } = useSession()
  const router = useRouter()
  const user = session?.user

  // Fetch organizer profile
  const { data: organizer, isLoading: isOrganizerLoading } = useOrganizer()

  // Fetch classes and locations (only if organizer exists)
  const { data: classes, isLoading: isClassesLoading } = useClasses()
  const { data: locations, isLoading: isLocationsLoading } = useLocations()

  // Fetch this week's schedules
  const today = new Date()
  const weekStart = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const weekEnd = format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const { data: weekSchedules, isLoading: isSchedulesLoading } = useSchedulesCalendar(weekStart, weekEnd)

  // Get today's schedules
  const todayStart = startOfDay(today)
  const todayEnd = endOfDay(today)
  const todaySchedules = weekSchedules?.filter((s: ClassSchedule) => {
    const scheduleDate = new Date(s.startTimeUtc)
    return scheduleDate >= todayStart && scheduleDate <= todayEnd
  })

  // Redirect to onboarding if no organizer profile
  useEffect(() => {
    if (!isOrganizerLoading && !organizer) {
      router.push('/onboarding')
    }
  }, [isOrganizerLoading, organizer, router])

  // Loading state
  if (isOrganizerLoading) {
    return <DashboardSkeleton />
  }

  // If no organizer, show nothing (will redirect)
  if (!organizer) {
    return null
  }

  const stats = [
    {
      label: t('stats.classes'),
      value: classes?.length ?? 0,
      icon: Calendar,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      href: '/dashboard/classes',
    },
    {
      label: t('stats.locations'),
      value: locations?.length ?? 0,
      icon: MapPin,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      href: '/dashboard/locations',
    },
    {
      label: t('stats.bookings'),
      value: weekSchedules?.reduce((acc: number, s: ClassSchedule) => acc + (s.bookingCounts?.booked ?? 0), 0) ?? 0,
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      href: '/dashboard/bookings',
    },
  ]

  const quickActions = [
    {
      label: t('createClass'),
      href: '/dashboard/classes?action=create',
      icon: Plus,
    },
    {
      label: t('viewCalendar'),
      href: '/dashboard/calendar',
      icon: Calendar,
    },
  ]

  return (
    <ContainerTemplate className="space-y-2 sm:space-y-4">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2>
            {t('welcome')}, {organizer.displayName || user?.username}!
          </h2>
          <p className="text-foreground-muted mt-1">{format(today, 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <DpNextNavLink href="/dashboard/calendar">
          <Button className="gap-2">
            <Calendar className="w-4 h-4" />
            {t('viewCalendar')}
          </Button>
        </DpNextNavLink>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <DpNextNavLink key={stat.label} href={stat.href || '#'} className="block">
            <Card className="border-border/50 transition-all hover:shadow-md hover:border-primary/50 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground-muted">{stat.label}</p>
                    <div className="text-3xl font-bold mt-1">
                      {isClassesLoading || isLocationsLoading || isSchedulesLoading ? (
                        <Skeleton className="h-9 w-16" />
                      ) : (
                        stat.value
                      )}
                    </div>
                  </div>
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', stat.bgColor)}>
                    <stat.icon className={cn('w-6 h-6', stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </DpNextNavLink>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              {t('quickActions')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => (
              <DpNextNavLink key={action.href} href={action.href} className="block">
                <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                      <action.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium">{action.label}</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-foreground-muted group-hover:text-primary transition-colors" />
                </div>
              </DpNextNavLink>
            ))}
          </CardContent>
        </Card>

        {/* Today's Classes */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              {t('todayClasses')}
            </CardTitle>
            <CardDescription>{format(today, 'EEEE, MMMM d')}</CardDescription>
          </CardHeader>
          <CardContent>
            {isSchedulesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : todaySchedules && todaySchedules.length > 0 ? (
              <div className="space-y-3">
                {todaySchedules.slice(0, 5).map((schedule: ClassSchedule) => (
                  <DpNextNavLink
                    key={schedule.id}
                    href={`/dashboard/calendar?scheduleId=${schedule.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all">
                      <div>
                        <p className="font-medium">{schedule.class?.title}</p>
                        <p className="text-sm text-foreground-muted">
                          {format(new Date(schedule.startTimeUtc), 'h:mm a')} -{' '}
                          {format(new Date(schedule.endTimeUtc), 'h:mm a')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="w-4 h-4 text-foreground-muted" />
                          <span>
                            {schedule.bookingCounts?.booked ?? 0}
                            {schedule.class?.capacity && `/${schedule.class.capacity}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </DpNextNavLink>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-foreground-muted">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{t('noUpcoming')}</p>
                <DpNextNavLink href="/dashboard/calendar?action=new">
                  <Button variant="outline" size="sm" className="mt-4 gap-2">
                    <Plus className="w-4 h-4" />
                    {t('addSchedule')}
                  </Button>
                </DpNextNavLink>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sent Invitations - only shows if organizer has sent any */}
      <SentInvitationsCard />
    </ContainerTemplate>
  )
}
