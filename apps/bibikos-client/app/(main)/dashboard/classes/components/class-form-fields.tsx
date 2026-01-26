'use client'

import { FormControl, FormDescription, FormField, FormItem, FormLabel, Input } from '@js-monorepo/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@js-monorepo/components/ui/select'
import { Switch } from '@js-monorepo/components/ui/switch'
import { Textarea } from '@js-monorepo/components/ui/textarea'
import { Building, Video } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Control } from 'react-hook-form'
import { Location } from '../../../../../lib/scheduling'
import { ClassFormData } from '../schemas'

interface ClassFormFieldsProps {
  control: Control<ClassFormData>
  locations: Location[]
  editingClass: boolean
}

export function ClassFormFields({ control, locations, editingClass }: ClassFormFieldsProps) {
  const t = useTranslations('scheduling.classes')

  return (
    <>
      {/* Title */}
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('classTitle')}</FormLabel>
            <FormControl>
              <Input placeholder={t('titlePlaceholder')} {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      {/* Description */}
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('description')}</FormLabel>
            <FormControl>
              <Textarea placeholder={t('descriptionPlaceholder')} className="min-h-[100px] resize-none" {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      {/* Location */}
      <FormField
        control={control}
        name="locationId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('location')}</FormLabel>
            <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectLocation')} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id.toString()}>
                    <div className="flex items-center gap-2">
                      {location.isOnline ? (
                        <Video className="w-4 h-4 text-purple-500" />
                      ) : (
                        <Building className="w-4 h-4 text-green-500" />
                      )}
                      {location.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />

      {/* Capacity and Waitlist */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('capacity')}</FormLabel>
              <FormControl>
                <Input type="number" min="1" placeholder={t('`capacityPlaceholder`')} {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="waitlistLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('waitlistLimit')}</FormLabel>
              <FormControl>
                <Input type="number" min="0" placeholder={t('waitlistPlaceholder')} {...field} />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      {/* Soft Capacity */}
      {/* <FormField
        control={control}
        name="isCapacitySoft"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between p-4 rounded-lg border border-border/50">
            <div>
              <FormLabel className="text-base">{t('softCapacity')}</FormLabel>
              <FormDescription>Allow overbooking beyond the capacity limit</FormDescription>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      /> */}

      {/* Private Class */}
      <FormField
        control={control}
        name="isPrivate"
        render={({ field }) => (
          <FormItem className="flex items-center justify-between p-4 rounded-lg border border-border/50">
            <div>
              <FormLabel className="text-base">Private Class</FormLabel>
              <FormDescription>Hidden from discover. Only bookable by invitation.</FormDescription>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />

      {/* Active Status - Only show when editing */}
      {editingClass && (
        <FormField
          control={control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between p-4 rounded-lg border border-border/50">
              <div>
                <FormLabel className="text-base">Active</FormLabel>
                <FormDescription>Inactive classes won&apos;t appear in the calendar</FormDescription>
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
