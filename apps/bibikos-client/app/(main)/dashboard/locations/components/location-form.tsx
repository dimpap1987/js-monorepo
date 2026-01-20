'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@js-monorepo/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@js-monorepo/components/ui/dialog'
import { Form } from '@js-monorepo/components/ui/form'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Location } from '../../../../../lib/scheduling'
import { locationSchema, type LocationFormData } from '../schemas'
import { LocationFormFields } from './location-form-fields'

interface LocationFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingLocation: Location | null
  onSubmit: (data: LocationFormData) => Promise<void>
  isSubmitting: boolean
  defaultTimezone: string
}

export function LocationForm({
  open,
  onOpenChange,
  editingLocation,
  onSubmit,
  isSubmitting,
  defaultTimezone,
}: LocationFormProps) {
  const t = useTranslations('scheduling.locations')
  const tCommon = useTranslations('common')

  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: '',
      countryCode: '',
      city: '',
      address: '',
      timezone: defaultTimezone,
      isOnline: false,
      onlineUrl: '',
      isActive: true,
    },
  })

  const isOnline = useWatch({
    control: form.control,
    name: 'isOnline',
  })

  // Reset form when dialog opens/closes or editing location changes
  useEffect(() => {
    if (editingLocation) {
      form.reset({
        name: editingLocation.name,
        countryCode: editingLocation.countryCode,
        city: editingLocation.city || '',
        address: editingLocation.address || '',
        timezone: editingLocation.timezone,
        isOnline: editingLocation.isOnline,
        onlineUrl: editingLocation.onlineUrl || '',
        isActive: editingLocation.isActive,
      })
    } else {
      form.reset({
        name: '',
        countryCode: '',
        city: '',
        address: '',
        timezone: defaultTimezone,
        isOnline: false,
        onlineUrl: '',
        isActive: true,
      })
    }
  }, [editingLocation, defaultTimezone, form])

  // Handle form state when switching between online/offline
  useEffect(() => {
    // Skip if dialog is not open to avoid interfering with form reset
    if (!open) return

    if (isOnline) {
      // Clear physical location fields when switching to online
      form.setValue('city', '', { shouldValidate: false })
      form.setValue('address', '', { shouldValidate: false })
      // Don't clear countryCode as it's required by schema
      form.clearErrors(['city', 'address'])
    } else {
      // Clear online URL when switching to physical location
      form.setValue('onlineUrl', '', { shouldValidate: false })
      form.clearErrors(['onlineUrl'])
    }
    // Trigger validation after clearing fields
    form.trigger()
  }, [isOnline, open, form])

  const handleSubmit = async (data: LocationFormData) => {
    await onSubmit(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingLocation ? t('edit') : t('add')}</DialogTitle>
          <DialogDescription>
            {editingLocation ? 'Update your location details' : 'Add a new location for your classes'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <LocationFormFields control={form.control} isOnline={isOnline} editingLocation={!!editingLocation} />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {tCommon('cancel')}
              </Button>
              <Button type="submit" loading={isSubmitting} disabled={!form.formState.isValid}>
                {editingLocation ? tCommon('save') : tCommon('create')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
