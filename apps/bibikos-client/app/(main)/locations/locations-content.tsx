'use client'

import { BackButton } from '@js-monorepo/back-arrow'
import { useNotifications } from '@js-monorepo/notification'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Location,
  useCreateLocation,
  useDeleteLocation,
  useLocations,
  useOrganizer,
  useUpdateLocation,
} from '../../../lib/scheduling'
import { DeleteLocationDialog } from './components/delete-location-dialog'
import { LocationForm } from './components/location-form'
import { LocationsEmptyState } from './components/locations-empty-state'
import { LocationsHeader } from './components/locations-header'
import { LocationsList } from './components/locations-list'
import { LocationsSkeleton } from './components/locations-skeleton'
import { LocationFormData } from './schemas'

export function LocationsContent() {
  const router = useRouter()
  const { addNotification } = useNotifications()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [deleteLocationId, setDeleteLocationId] = useState<number | null>(null)

  // Check if user has organizer profile
  const { data: organizer, isLoading: isOrganizerLoading } = useOrganizer()

  // Fetch locations (include inactive)
  const { data: locations, isLoading: isLocationsLoading } = useLocations(true)

  // Mutations
  const createLocationMutation = useCreateLocation()
  const updateLocationMutation = useUpdateLocation()
  const deleteLocationMutation = useDeleteLocation()

  // Redirect to onboarding if no organizer profile
  useEffect(() => {
    if (!isOrganizerLoading && !organizer) {
      router.push('/onboarding')
    }
  }, [isOrganizerLoading, organizer, router])

  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

  const handleOpenDialog = (location?: Location) => {
    setEditingLocation(location || null)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingLocation(null)
  }

  const handleSubmit = async (data: LocationFormData) => {
    try {
      if (editingLocation) {
        await updateLocationMutation.mutateAsync({
          id: editingLocation.id,
          name: data.name,
          countryCode: data.countryCode,
          city: data.city || null,
          address: data.address || null,
          timezone: data.timezone,
          isOnline: data.isOnline,
          onlineUrl: data.isOnline ? data.onlineUrl || null : null,
          isActive: data.isActive,
        })
        addNotification({ message: 'Location updated', type: 'success' })
      } else {
        await createLocationMutation.mutateAsync({
          name: data.name,
          countryCode: data.countryCode,
          city: data.city || null,
          address: data.address || null,
          timezone: data.timezone,
          isOnline: data.isOnline,
          onlineUrl: data.isOnline ? data.onlineUrl || null : null,
        })
        addNotification({ message: 'Location created', type: 'success' })
      }
      handleCloseDialog()
    } catch (error: any) {
      addNotification({
        message: error?.message || 'Failed to save location',
        type: 'error',
      })
    }
  }

  const handleDelete = async () => {
    if (!deleteLocationId) return

    try {
      await deleteLocationMutation.mutateAsync(deleteLocationId)
      addNotification({ message: 'Location deleted', type: 'success' })
      setDeleteLocationId(null)
    } catch (error: any) {
      addNotification({
        message: error?.message || 'Failed to delete location',
        type: 'error',
      })
    }
  }

  if (isOrganizerLoading || isLocationsLoading) {
    return <LocationsSkeleton />
  }

  if (!organizer) {
    return null
  }

  const isSubmitting = createLocationMutation.isPending || updateLocationMutation.isPending

  return (
    <div className="container mx-auto px-4 py-6">
      <BackButton href="/dashboard" className="mb-3" />
      <div className="space-y-6">
        <LocationsHeader onAddClick={() => handleOpenDialog()} />

        {locations && locations.length === 0 ? (
          <LocationsEmptyState onAddClick={() => handleOpenDialog()} />
        ) : (
          <LocationsList locations={locations || []} onEdit={handleOpenDialog} onDelete={setDeleteLocationId} />
        )}
      </div>

      <LocationForm
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingLocation={editingLocation}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        defaultTimezone={userTimezone}
      />

      <DeleteLocationDialog
        open={!!deleteLocationId}
        onOpenChange={(open) => !open && setDeleteLocationId(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
