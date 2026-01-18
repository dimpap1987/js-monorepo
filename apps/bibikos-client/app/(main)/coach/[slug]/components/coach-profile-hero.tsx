import { Badge } from '@js-monorepo/components/ui/badge'
import { User } from 'lucide-react'
import type { OrganizerPublicProfile } from '../../../../../lib/scheduling'

interface CoachProfileHeroProps {
  profile: OrganizerPublicProfile
}

export function CoachProfileHero({ profile }: CoachProfileHeroProps) {
  return (
    <div className="relative bg-primary/5 border-b border-border/50">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-primary/10 flex items-center justify-center ring-4 ring-background">
            <User className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
          </div>

          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">{profile.displayName || 'Coach'}</h1>

            {profile.activityLabel && (
              <Badge variant="secondary" className="mb-4">
                {profile.activityLabel}
              </Badge>
            )}

            {profile.bio && <p className="text-foreground-muted max-w-2xl leading-relaxed">{profile.bio}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
