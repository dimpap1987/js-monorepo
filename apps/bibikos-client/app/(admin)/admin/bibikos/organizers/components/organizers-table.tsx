'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@js-monorepo/components/ui/avatar'
import { Badge } from '@js-monorepo/components/ui/badge'
import { Button } from '@js-monorepo/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@js-monorepo/components/ui/card'
import { Skeleton } from '@js-monorepo/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@js-monorepo/components/table'
import { Award, ChevronLeft, ChevronRight, ExternalLink, User } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { AdminOrganizer, useOrganizers } from '../queries'
import { BadgeAssignmentDialog } from './badge-assignment-dialog'

function getInitials(name: string | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function OrganizerAvatar({ organizer }: { organizer: AdminOrganizer }) {
  return (
    <Avatar className="h-10 w-10">
      {organizer.profileImage && (
        <AvatarImage src={organizer.profileImage} alt={organizer.displayName || 'Organizer'} />
      )}
      <AvatarFallback className="bg-primary/10 text-primary">
        {organizer.profileImage ? <User className="h-5 w-5" /> : getInitials(organizer.displayName)}
      </AvatarFallback>
    </Avatar>
  )
}

function OrganizerBadges({ badges }: { badges: AdminOrganizer['badges'] }) {
  if (badges.length === 0) {
    return <span className="text-muted-foreground text-sm">No badges</span>
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((badge) => (
        <Badge
          key={badge.id}
          variant="default"
          className="text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0"
        >
          <Award className="h-3 w-3 mr-1" />
          {badge.name}
        </Badge>
      ))}
    </div>
  )
}

function OrganizerTags({ tags }: { tags: AdminOrganizer['selfSelectedTags'] }) {
  if (tags.length === 0) {
    return <span className="text-muted-foreground text-sm">No tags</span>
  }

  return (
    <div className="flex flex-wrap gap-1">
      {tags.slice(0, 3).map((tag) => (
        <Badge key={tag.id} variant="secondary" className="text-xs">
          {tag.name}
        </Badge>
      ))}
      {tags.length > 3 && (
        <Badge variant="outline" className="text-xs">
          +{tags.length - 3}
        </Badge>
      )}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  )
}

export function OrganizersTable() {
  const [page, setPage] = useState(1)
  const pageSize = 10
  const { data, isLoading } = useOrganizers(page, pageSize)

  const [selectedOrganizer, setSelectedOrganizer] = useState<AdminOrganizer | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleManageBadges = (organizer: AdminOrganizer) => {
    setSelectedOrganizer(organizer)
    setDialogOpen(true)
  }

  const organizers = data?.content ?? []
  const totalPages = data?.totalPages ?? 1
  const totalCount = data?.totalCount ?? 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organizers</CardTitle>
        <CardDescription>
          Manage badges for organizers. Badges are special recognition tags that only admins can assign.
          {totalCount > 0 && ` (${totalCount} total)`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton />
        ) : organizers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No organizers found</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Organizer</TableHead>
                  <TableHead>Badges</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizers.map((organizer) => (
                  <TableRow key={organizer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <OrganizerAvatar organizer={organizer} />
                        <div>
                          <div className="font-medium">{organizer.displayName || 'Unnamed'}</div>
                          {organizer.slug && (
                            <Link
                              href={`/instructor/${organizer.slug}`}
                              target="_blank"
                              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                            >
                              @{organizer.slug}
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <OrganizerBadges badges={organizer.badges} />
                    </TableCell>
                    <TableCell>
                      <OrganizerTags tags={organizer.selfSelectedTags} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleManageBadges(organizer)}>
                        <Award className="h-4 w-4 mr-1.5" />
                        Manage Badges
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>

      <BadgeAssignmentDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setSelectedOrganizer(null)
        }}
        organizer={selectedOrganizer}
      />
    </Card>
  )
}
