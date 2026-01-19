'use client'

import { useSession } from '@js-monorepo/auth/next/client'
import { BackButton } from '@js-monorepo/back-arrow'
import { useNotifications } from '@js-monorepo/notification'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Class,
  useClasses,
  useCreateClass,
  useDeleteClass,
  useLocations,
  useOrganizer,
  useUpdateClass,
} from '../../../lib/scheduling'
import { ClassForm } from './components/class-form'
import { ClassesEmptyState } from './components/classes-empty-state'
import { ClassesHeader } from './components/classes-header'
import { ClassesList } from './components/classes-list'
import { ClassesNoLocationsWarning } from './components/classes-no-locations-warning'
import { ClassesSkeleton } from './components/classes-skeleton'
import { DeleteClassDialog } from './components/delete-class-dialog'
import { InviteDialog } from './components/invite-dialog'
import { ClassFormData } from './schemas'

export function ClassesContent() {
  const { session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addNotification } = useNotifications()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<Class | null>(null)
  const [deleteClassId, setDeleteClassId] = useState<number | null>(null)
  const [inviteClass, setInviteClass] = useState<Class | null>(null)

  // Check if user has organizer profile
  const { data: organizer, isLoading: isOrganizerLoading } = useOrganizer()

  // Fetch classes and locations
  const { data: classes, isLoading: isClassesLoading } = useClasses(true)
  const { data: locations, isLoading: isLocationsLoading } = useLocations()

  // Mutations
  const createClassMutation = useCreateClass()
  const updateClassMutation = useUpdateClass()
  const deleteClassMutation = useDeleteClass()

  // Redirect to onboarding if no organizer profile
  useEffect(() => {
    if (!isOrganizerLoading && !organizer) {
      router.push('/onboarding')
    }
  }, [isOrganizerLoading, organizer, router])

  const handleOpenDialog = (classItem?: Class) => {
    setEditingClass(classItem || null)
    setIsDialogOpen(true)
  }

  // Open dialog if action=create is in URL
  useEffect(() => {
    const action = searchParams.get('action')
    if (action === 'create' && !isDialogOpen) {
      handleOpenDialog()
      // Clean up URL by removing the query parameter
      router.replace('/classes', { scroll: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isDialogOpen, router])

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingClass(null)
  }

  const handleSubmit = async (data: ClassFormData) => {
    try {
      if (editingClass) {
        await updateClassMutation.mutateAsync({
          id: editingClass.id,
          title: data.title,
          description: data.description || null,
          locationId: data.locationId,
          capacity: data.capacity ? Number(data.capacity) : null,
          waitlistLimit: data.waitlistLimit ? Number(data.waitlistLimit) : null,
          isCapacitySoft: data.isCapacitySoft,
          isPrivate: data.isPrivate,
          isActive: data.isActive,
        })
        addNotification({ message: 'Class updated', type: 'success' })
      } else {
        await createClassMutation.mutateAsync({
          title: data.title,
          description: data.description || null,
          locationId: data.locationId,
          capacity: data.capacity ? Number(data.capacity) : null,
          waitlistLimit: data.waitlistLimit ? Number(data.waitlistLimit) : null,
          isCapacitySoft: data.isCapacitySoft,
          isPrivate: data.isPrivate,
        })
        addNotification({ message: 'Class created', type: 'success' })
      }
      handleCloseDialog()
    } catch (error: any) {
      addNotification({
        message: error?.message || 'Failed to save class',
        type: 'error',
      })
    }
  }

  const handleDelete = async () => {
    if (!deleteClassId) return

    try {
      await deleteClassMutation.mutateAsync(deleteClassId)
      addNotification({ message: 'Class deleted', type: 'success' })
      setDeleteClassId(null)
    } catch (error: any) {
      addNotification({
        message: error?.message || 'Failed to delete class',
        type: 'error',
      })
    }
  }

  const isLoading = isOrganizerLoading || isClassesLoading || isLocationsLoading

  if (isLoading) {
    return <ClassesSkeleton />
  }

  if (!organizer) {
    return null
  }

  const hasLocations = locations && locations.length > 0
  const isSubmitting = createClassMutation.isPending || updateClassMutation.isPending

  return (
    <div className="container mx-auto px-4 py-6">
      <BackButton href="/dashboard" className="mb-3" />
      <div className="space-y-6">
        <ClassesHeader onAddClick={() => handleOpenDialog()} hasLocations={!!hasLocations} />

        {!hasLocations && <ClassesNoLocationsWarning />}

        {classes && classes.length === 0 && hasLocations ? (
          <ClassesEmptyState onAddClick={() => handleOpenDialog()} />
        ) : (
          hasLocations && (
            <ClassesList
              classes={classes || []}
              locations={locations || []}
              onEdit={handleOpenDialog}
              onDelete={setDeleteClassId}
              onInvite={setInviteClass}
            />
          )
        )}
      </div>

      <ClassForm
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingClass={editingClass}
        locations={locations || []}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <DeleteClassDialog
        open={!!deleteClassId}
        onOpenChange={(open) => !open && setDeleteClassId(null)}
        onConfirm={handleDelete}
      />

      {inviteClass && (
        <InviteDialog
          classItem={inviteClass}
          open={!!inviteClass}
          onOpenChange={(open) => !open && setInviteClass(null)}
        />
      )}
    </div>
  )
}
