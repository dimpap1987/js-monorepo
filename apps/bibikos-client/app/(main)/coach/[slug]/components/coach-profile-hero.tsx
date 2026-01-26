'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@js-monorepo/components/ui/avatar'
import { Badge } from '@js-monorepo/components/ui/badge'
import { Card, CardContent } from '@js-monorepo/components/ui/card'
import { Award, Dumbbell, Sparkles, Star, Trophy, Verified } from 'lucide-react'
import type { OrganizerPublicProfile, OrganizerPublicBadge } from '../../../../../lib/scheduling'

interface CoachProfileHeroProps {
  profile: OrganizerPublicProfile
}

function getInitials(name: string | null): string {
  if (!name) return 'C'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Badge icon mapping based on badge name
function getBadgeIcon(badgeName: string) {
  const name = badgeName.toLowerCase()
  if (name.includes('verified') || name.includes('certified')) return Verified
  if (name.includes('top') || name.includes('best') || name.includes('#1')) return Trophy
  if (name.includes('new')) return Sparkles
  if (name.includes('star') || name.includes('featured')) return Star
  return Award
}

// Badge color mapping based on badge name
function getBadgeStyle(badgeName: string) {
  const name = badgeName.toLowerCase()
  if (name.includes('verified') || name.includes('certified')) {
    return 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800'
  }
  if (name.includes('top') || name.includes('best') || name.includes('#1')) {
    return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0'
  }
  if (name.includes('new')) {
    return 'bg-green-400/10 text-green-600 border-green-200 dark:border-green-800'
  }
  if (name.includes('star') || name.includes('featured')) {
    return 'bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800'
  }
  return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0'
}

function ProfileAvatar({ profile }: { profile: OrganizerPublicProfile }) {
  return (
    <div className="relative">
      <Avatar className="h-28 w-28 sm:h-36 sm:w-36 ring-4 ring-background shadow-xl">
        {profile.profileImage && (
          <AvatarImage src={profile.profileImage} alt={profile.displayName || 'Coach'} sizes="144px" />
        )}
        <AvatarFallback className="text-3xl sm:text-4xl font-semibold bg-gradient-to-br from-primary/80 to-primary text-primary-foreground">
          {getInitials(profile.displayName)}
        </AvatarFallback>
      </Avatar>
    </div>
  )
}

function ProfileBadges({ badges }: { badges: OrganizerPublicBadge[] }) {
  if (badges.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
      {badges.map((badge) => {
        const Icon = getBadgeIcon(badge.name)
        const style = getBadgeStyle(badge.name)
        return (
          <Badge key={badge.id} className={`px-3 py-1.5 text-xs font-medium gap-1.5 ${style}`}>
            <Icon className="h-3.5 w-3.5" />
            {badge.name}
          </Badge>
        )
      })}
    </div>
  )
}

function ProfileTags({ tags }: { tags: OrganizerPublicProfile['tags'] }) {
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
      {tags.map((tag) => (
        <Badge key={tag.id} variant="secondary" className="px-3 py-1 text-sm font-medium">
          {tag.name}
        </Badge>
      ))}
    </div>
  )
}

function ClassTypesList({ classTypes }: { classTypes: OrganizerPublicProfile['classTypes'] }) {
  if (classTypes.length === 0) return null

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Dumbbell className="h-4 w-4 flex-shrink-0" />
      <span className="font-medium">Groups:</span>
      <span>{classTypes.map((c) => c.title).join(', ')}</span>
    </div>
  )
}

export function CoachProfileHero({ profile }: CoachProfileHeroProps) {
  return (
    <Card className="overflow-hidden border-0 shadow-none bg-transparent">
      {/* Gradient Background */}
      <div className="relative bg-gradient-to-br from-primary/5 via-primary/10 to-background">
        {/* Decorative Elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        <CardContent className="relative px-4 py-10 sm:px-8 sm:py-14">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
            {/* Avatar */}
            <ProfileAvatar profile={profile} />

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left space-y-4">
              {/* Name & Badges */}
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{profile.displayName || 'Coach'}</h1>
                <ProfileBadges badges={profile.badges} />
              </div>

              {/* Self-selected Tags */}
              <ProfileTags tags={profile.tags} />

              {/* Class Types */}
              <ClassTypesList classTypes={profile.classTypes} />

              {/* Bio */}
              {profile.bio && (
                <p className="text-muted-foreground leading-relaxed max-w-2xl text-sm sm:text-base">{profile.bio}</p>
              )}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
