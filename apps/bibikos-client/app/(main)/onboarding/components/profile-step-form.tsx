'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@js-monorepo/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@js-monorepo/components/ui/form'
import { Input } from '@js-monorepo/components/ui/form'
import { Textarea } from '@js-monorepo/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@js-monorepo/components/ui/tooltip'
import { useTranslations } from 'next-intl'
import { ArrowRight, Info } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { TagSelectField } from '../../../../components/tag-select'
import { CreateOrganizerDto, CreateOrganizerSchema } from '@js-monorepo/schemas'

export type ProfileFormData = CreateOrganizerDto

interface ProfileStepFormProps {
  defaultDisplayName?: string
  initialData?: ProfileFormData | null
  onSubmit: (data: ProfileFormData) => void
  isLoading?: boolean
}

export function   ProfileStepForm({
  defaultDisplayName = '',
  initialData,
  onSubmit,
  isLoading = false,
}: ProfileStepFormProps) {
  const t = useTranslations('scheduling.onboarding')
  const tCommon = useTranslations('common')

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(CreateOrganizerSchema),
    defaultValues: initialData || {
      displayName: defaultDisplayName,
      bio: '',
      tagIds: [],
    },
  })

  // Reset form when initialData becomes available (after hydration from localStorage)
  useEffect(() => {
    if (initialData) {
      form.reset(initialData)
    }
  }, [initialData, form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5">
                {t('displayName')}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger type="button" className="text-muted-foreground hover:text-foreground">
                      <Info className="w-4 h-4" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('displayNameTooltip')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </FormLabel>
              <FormControl>
                <Input placeholder={t('displayNamePlaceholder')} autoFocus {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <TagSelectField
          control={form.control}
          name="tagIds"
          entityType="ORGANIZER"
          label={t('activityLabel')}
          placeholder={t('activityLabelPlaceholder')}
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
          <Button type="submit" loading={isLoading} disabled={!form.formState.isValid} className="gap-2">
            {tCommon('next')}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Form>
  )
}
