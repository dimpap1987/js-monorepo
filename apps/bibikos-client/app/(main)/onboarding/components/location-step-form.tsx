'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@js-monorepo/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@js-monorepo/components/ui/form'
import { Input } from '@js-monorepo/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@js-monorepo/components/ui/select'
import { Switch } from '@js-monorepo/components/ui/switch'
import { useTranslations } from 'next-intl'
import { ArrowRight, ArrowLeft, Building, Video } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { useEffect } from 'react'
import { CreateLocationSchema, type CreateLocationDto } from '@js-monorepo/schemas'
import { GREEK_CITIES } from '../../../../lib/scheduling/constants'

interface LocationStepFormProps {
  initialData?: CreateLocationDto | null
  onSubmit: (data: CreateLocationDto) => void
  onBack: () => void
  isLoading?: boolean
}

const GREEK_COUNTRY_CODE = 'GR'
const GREEK_TIMEZONE = 'Europe/Athens'

export function LocationStepForm({ initialData, onSubmit, onBack, isLoading = false }: LocationStepFormProps) {
  const tLocations = useTranslations('scheduling.locations')
  const tOnboarding = useTranslations('scheduling.onboarding')
  const tCommon = useTranslations('common')

  const form = useForm<CreateLocationDto>({
    resolver: zodResolver(CreateLocationSchema),
    mode: 'onTouched',
    defaultValues: initialData || {
      name: '',
      countryCode: GREEK_COUNTRY_CODE,
      city: null,
      address: null,
      timezone: GREEK_TIMEZONE,
      isOnline: false,
      onlineUrl: null,
    },
  })

  const isOnline = useWatch({
    control: form.control,
    name: 'isOnline',
  })

  // Reset form when initialData becomes available (after hydration from localStorage)
  useEffect(() => {
    if (initialData) {
      form.reset(initialData)
    }
  }, [initialData, form])

  // Handle form state when switching between online/offline
  useEffect(() => {
    if (isOnline) {
      // Clear physical location fields when switching to online
      form.setValue('city', null, { shouldValidate: false })
      form.setValue('address', null, { shouldValidate: false })
      form.clearErrors(['city', 'address'])
    } else {
      // Clear online URL when switching to physical location
      form.setValue('onlineUrl', null, { shouldValidate: false })
      form.clearErrors(['onlineUrl'])
    }
    // Trigger validation after clearing fields
    form.trigger()
  }, [isOnline, form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Location Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{tOnboarding('venueName')}</FormLabel>
              <FormControl>
                <Input placeholder={tOnboarding('venueNamePlaceholder')} autoFocus {...field} />
              </FormControl>
              <p className="text-sm text-foreground-muted">{tOnboarding('venueNameDescription')}</p>
            </FormItem>
          )}
        />

        {/* Conditional Fields - Always render to avoid registration issues */}
        <div className={isOnline ? '' : 'hidden'}>
          <FormField
            control={form.control}
            name="onlineUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tLocations('onlineUrl')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={tLocations('onlineUrlPlaceholder')}
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
        </div>

        <div className={isOnline ? 'hidden' : ''}>
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tLocations('city')}</FormLabel>
                <Select value={field.value ?? ''} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={tLocations('cityPlaceholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {GREEK_CITIES.map((city) => (
                      <SelectItem key={city.value} value={city.value}>
                        {city.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tLocations('address')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={tLocations('addressPlaceholder')}
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
        </div>

        {/* Online / In-Person Toggle */}
        <FormField
          control={form.control}
          name="isOnline"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background-secondary/30">
              <div className="flex items-center gap-3">
                {field.value ? (
                  <Video className="w-5 h-5 text-primary" />
                ) : (
                  <Building className="w-5 h-5 text-primary" />
                )}
                <div>
                  <FormLabel className="text-base">{tLocations('isOnline')}</FormLabel>
                  <p className="text-sm text-foreground-muted">
                    {field.value
                      ? tOnboarding('onlineLocationDescription')
                      : tOnboarding('physicalLocationDescription')}
                  </p>
                </div>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex justify-between pt-4">
          <Button type="button" variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            {tCommon('back')}
          </Button>

          <Button type="submit" loading={isLoading} disabled={!form.formState.isValid} className="gap-2">
            {tCommon('next')}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Form>
  )
}
