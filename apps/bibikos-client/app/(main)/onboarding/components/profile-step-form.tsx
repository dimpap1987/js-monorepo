'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { DpButton } from '@js-monorepo/button'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@js-monorepo/components/ui/form'
import { Input } from '@js-monorepo/components/ui/form'
import { Textarea } from '@js-monorepo/components/ui/textarea'
import { useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { CreateOrganizerSchema } from '@js-monorepo/schemas'
import { z } from 'zod'

// Profile Schema - use shared schema but adapt for form (slug is auto-generated)
const profileSchema = CreateOrganizerSchema.omit({ slug: true, cancellationPolicy: true, defaultLocationId: true })

export type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileStepFormProps {
  defaultDisplayName?: string
  onSubmit: (data: ProfileFormData) => void
  isLoading?: boolean
}

export function ProfileStepForm({ defaultDisplayName = '', onSubmit, isLoading = false }: ProfileStepFormProps) {
  const t = useTranslations('scheduling.onboarding')
  const tCommon = useTranslations('common')

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: defaultDisplayName,
      activityLabel: '',
      bio: '',
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('displayName')}</FormLabel>
              <FormControl>
                <Input placeholder={t('displayNamePlaceholder')} {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="activityLabel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('activityLabel')}</FormLabel>
              <FormControl>
                <Input placeholder={t('activityLabelPlaceholder')} {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('bio')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('bioPlaceholder')}
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

        <div className="flex justify-end pt-4">
          <DpButton type="submit" loading={isLoading} disabled={!form.formState.isValid} className="gap-2">
            {tCommon('next')}
            <ArrowRight className="w-4 h-4" />
          </DpButton>
        </div>
      </form>
    </Form>
  )
}
