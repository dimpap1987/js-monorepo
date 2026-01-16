'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { DpButton } from '@js-monorepo/button'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@js-monorepo/components/ui/form'
import { Input } from '@js-monorepo/components/ui/form'
import { Textarea } from '@js-monorepo/components/ui/textarea'
import { useTranslations } from 'next-intl'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { CreateClassSchema, type CreateClassDto } from '@js-monorepo/schemas'
import { z } from 'zod'

// Class Schema - use shared schema but adapt for form (locationId comes from state, handle empty strings)
const classSchema = CreateClassSchema.omit({ locationId: true }).extend({
  capacity: z.union([z.coerce.number().int().positive('Capacity must be a positive number'), z.literal('')]).optional(),
  waitlistLimit: z
    .union([z.coerce.number().int().min(0, 'Waitlist limit cannot be negative'), z.literal('')])
    .optional(),
})

export type ClassFormData = z.infer<typeof classSchema>

interface ClassStepFormProps {
  onSubmit: (data: ClassFormData) => void
  onBack: () => void
  isLoading?: boolean
}

export function ClassStepForm({ onSubmit, onBack, isLoading = false }: ClassStepFormProps) {
  const tClasses = useTranslations('scheduling.classes')
  const tOnboarding = useTranslations('scheduling.onboarding')
  const tCommon = useTranslations('common')

  const form = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      capacity: '',
      waitlistLimit: '',
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{tClasses('classTitle')}</FormLabel>
              <FormControl>
                <Input placeholder={tClasses('titlePlaceholder')} {...field} />
              </FormControl>
              <p className="text-sm text-foreground-muted">{tClasses('classTitleDescription')}</p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{tClasses('description')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={tClasses('descriptionPlaceholder')}
                  className="min-h-[100px] resize-none"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tClasses('capacity')}</FormLabel>
                <FormControl>
                  <Input type="number" min="1" placeholder={tClasses('capacityPlaceholder')} {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="waitlistLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tClasses('waitlistLimit')}</FormLabel>
                <FormControl>
                  <Input type="number" min="0" placeholder={tClasses('waitlistPlaceholder')} {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-between pt-4">
          <DpButton type="button" variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            {tCommon('back')}
          </DpButton>
          <DpButton type="submit" loading={isLoading} disabled={!form.formState.isValid} className="gap-2">
            {tCommon('next')}
            <ArrowRight className="w-4 h-4" />
          </DpButton>
        </div>
      </form>
    </Form>
  )
}
