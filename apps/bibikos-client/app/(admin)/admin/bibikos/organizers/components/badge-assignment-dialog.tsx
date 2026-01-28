'use client'

import { Badge } from '@js-monorepo/components/ui/badge'
import { Button } from '@js-monorepo/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@js-monorepo/components/ui/dialog'
import { useNotifications } from '@js-monorepo/notification'
import { Award, Loader2, Plus, X } from 'lucide-react'
import { AdminOrganizer, Badge as BadgeType, useAssignBadge, useBadges, useRemoveBadge } from '../queries'

interface BadgeAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizer: AdminOrganizer | null
}

export function BadgeAssignmentDialog({ open, onOpenChange, organizer }: BadgeAssignmentDialogProps) {
  const { data: availableBadges = [], isLoading: badgesLoading } = useBadges()
  const assignBadge = useAssignBadge()
  const removeBadge = useRemoveBadge()
  const { addNotification } = useNotifications()

  if (!organizer) return null

  const assignedBadgeIds = new Set(organizer.badges.map((b) => b.id))
  const unassignedBadges = availableBadges.filter((b) => !assignedBadgeIds.has(b.id))

  const handleAssign = async (badge: BadgeType) => {
    try {
      await assignBadge.mutateAsync({ organizerId: organizer.id, badgeId: badge.id })
      addNotification({
        message: `Badge "${badge.name}" assigned successfully`,
        type: 'success',
      })
    } catch {
      addNotification({
        message: 'Failed to assign badge',
        type: 'error',
      })
    }
  }

  const handleRemove = async (badgeId: number, badgeName: string) => {
    try {
      await removeBadge.mutateAsync({ organizerId: organizer.id, badgeId })
      addNotification({
        message: `Badge "${badgeName}" removed successfully`,
        type: 'success',
      })
    } catch {
      addNotification({
        message: 'Failed to remove badge',
        type: 'error',
      })
    }
  }

  const isPending = assignBadge.isPending || removeBadge.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Manage Badges
          </DialogTitle>
          <DialogDescription>
            Assign or remove badges for <span className="font-medium">{organizer.displayName || organizer.slug}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Badges */}
          <div>
            <h4 className="text-sm font-medium mb-3">Assigned Badges</h4>
            {organizer.badges.length === 0 ? (
              <p className="text-sm text-muted-foreground">No badges assigned yet</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {organizer.badges.map((badge) => (
                  <Badge
                    key={badge.id}
                    variant="default"
                    className="pl-3 pr-1.5 py-1.5 gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
                  >
                    <Award className="h-3.5 w-3.5" />
                    {badge.name}
                    <button
                      onClick={() => handleRemove(badge.id, badge.name)}
                      disabled={isPending}
                      className="ml-1 p-0.5 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50"
                    >
                      {removeBadge.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Available Badges */}
          <div>
            <h4 className="text-sm font-medium mb-3">Available Badges</h4>
            {badgesLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading badges...
              </div>
            ) : unassignedBadges.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {availableBadges.length === 0
                  ? 'No badges available. Create badges in the Tags section with empty "Applicable To" field.'
                  : 'All badges have been assigned'}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {unassignedBadges.map((badge) => (
                  <Button
                    key={badge.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAssign(badge)}
                    disabled={isPending}
                    className="gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {badge.name}
                    {assignBadge.isPending && <Loader2 className="h-3 w-3 animate-spin ml-1" />}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Help text */}
          <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
            <p className="font-medium mb-1">How badges work:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Badges are special tags with no &quot;Applicable To&quot; setting</li>
              <li>Only admins can assign badges to organizers</li>
              <li>Badges appear prominently on the instructor profile</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
