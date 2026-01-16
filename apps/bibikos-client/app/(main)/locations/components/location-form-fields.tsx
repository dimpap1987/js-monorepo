'use client'

import { FormControl, FormField, FormItem, FormLabel } from '@js-monorepo/components/ui/form'
import { Input } from '@js-monorepo/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@js-monorepo/components/ui/select'
import { Switch } from '@js-monorepo/components/ui/switch'
import { useTranslations } from 'next-intl'
import { Building, Video } from 'lucide-react'
import { Control } from 'react-hook-form'
import { LocationFormData } from '../schemas'
import { TIMEZONES, COUNTRIES } from '../../../../lib/scheduling'

interface LocationFormFieldsProps {
  control: Control<LocationFormData>
  isOnline: boolean
  editingLocation: boolean
}

export function LocationFormFields({ control, isOnline, editingLocation }: LocationFormFieldsProps) {
  const t = useTranslations('scheduling.locations')

  return (
    <>
      {/* Online/In-Person Toggle */}
      <FormField
        control={control}
        name="isOnline"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background-secondary/30">
            <div className="flex items-center gap-3">
              {field.value ? <Video className="w-5 h-5 text-primary" /> : <Building className="w-5 h-5 text-primary" />}
              <div>
                <FormLabel className="text-base">{t('isOnline')}</FormLabel>
                <p className="text-sm text-foreground-muted">
                  {field.value ? 'Zoom, Google Meet, etc.' : 'Physical studio or gym'}
                </p>
              </div>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />

      {/* Location Name */}
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('name')}</FormLabel>
            <FormControl>
              <Input placeholder={t('namePlaceholder')} {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      {/* Online URL - Always render to avoid registration issues */}
      <div className={isOnline ? '' : 'hidden'}>
        <FormField
          control={control}
          name="onlineUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('onlineUrl')}</FormLabel>
              <FormControl>
                <Input placeholder={t('onlineUrlPlaceholder')} {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      {/* Physical Location Fields - Always render to avoid registration issues */}
      <div className={isOnline ? 'hidden' : ''}>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="countryCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('country')}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('city')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('cityPlaceholder')} {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('address')}</FormLabel>
              <FormControl>
                <Input placeholder={t('addressPlaceholder')} {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      {/* Timezone */}
      <FormField
        control={control}
        name="timezone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('timezone')}</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />

      {/* Active Status - Only show when editing */}
      {editingLocation && (
        <FormField
          control={control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between p-4 rounded-lg border border-border/50">
              <div>
                <FormLabel className="text-base">Active</FormLabel>
                <p className="text-sm text-foreground-muted">
                  Inactive locations won&apos;t be available for new classes
                </p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />
      )}
    </>
  )
}
