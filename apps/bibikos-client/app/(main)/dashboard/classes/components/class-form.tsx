'use client'

import { Button } from '@js-monorepo/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@js-monorepo/components/ui/dialog'
import { Form } from '@js-monorepo/components/ui/form'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Class, Location } from '../../../../../lib/scheduling'
import { classSchema, ClassFormData } from '../schemas'
import { ClassFormFields } from './class-form-fields'

interface ClassFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingClass: Class | null
  locations: Location[]
  onSubmit: (data: ClassFormData) => Promise<void>
  isSubmitting: boolean
}

export function ClassForm({ open, onOpenChange, editingClass, locations, onSubmit, isSubmitting }: ClassFormProps) {
  const t = useTranslations('scheduling.classes')
  const tCommon = useTranslations('common')

  const form = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    mode: 'onTouched',
    shouldUnregister: false, // IMPORTANT
    defaultValues: {
      title: '',
      description: '',
      locationId: 0,
      capacity: '',
      waitlistLimit: '',
      isCapacitySoft: false,
      isPrivate: false,
      isActive: true,
    },
  })

  // Reset ONLY when dialog opens
  useEffect(() => {
    if (!open) return

    if (editingClass) {
      form.reset({
        title: editingClass.title,
        description: editingClass.description || '',
        locationId: editingClass.locationId,
        capacity: editingClass.capacity ?? '',
        waitlistLimit: editingClass.waitlistLimit ?? '',
        isCapacitySoft: editingClass.isCapacitySoft,
        isPrivate: editingClass.isPrivate,
        isActive: editingClass.isActive,
      })
    } else {
      form.reset({
        title: '',
        description: '',
        locationId: locations?.[0]?.id || 0,
        capacity: '',
        waitlistLimit: '',
        isCapacitySoft: false,
        isPrivate: false,
        isActive: true,
      })
    }
  }, [editingClass, open])

  const handleSubmit = async (data: ClassFormData) => {
    await onSubmit(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingClass ? t('edit') : t('add')}</DialogTitle>
          <DialogDescription>
            {editingClass ? 'Update your class details' : 'Create a new class template'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <ClassFormFields control={form.control} locations={locations} editingClass={!!editingClass} />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {tCommon('cancel')}
              </Button>
              <Button type="submit" loading={isSubmitting} disabled={!form.formState.isValid}>
                {editingClass ? tCommon('save') : tCommon('create')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
