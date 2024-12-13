'use client'

import { DpButton } from '@js-monorepo/button'
import { Card } from '@js-monorepo/components/card'
import {
  Form,
  FormControl,
  FormErrorDisplay,
  FormField,
  FormItem,
  FormLabel,
  Input,
} from '@js-monorepo/components/form'
import { useNotifications } from '@js-monorepo/notification'
import { apiClient } from '@js-monorepo/utils/http'
import { SelectUsersComponent } from '@next-app/components/select-users'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const schema = z
  .object({
    message: z.string().nonempty('Message cannot be empty'),
    selectedUserIds: z.array(z.number()).optional(),
    isGlobal: z.boolean(),
  })
  .refine(
    (data) =>
      (data.selectedUserIds?.length && data.selectedUserIds?.length > 0) ||
      data.isGlobal,
    {
      message: 'Provide at least one of selectedUserIds or check Global.',
      path: ['selectedUserIds'], // Adjust where the error shows
    }
  )

type FormValues = z.infer<typeof schema>

const CreateAnnouncement = () => {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      message: '',
      selectedUserIds: [],
      isGlobal: false,
    },
  })

  const { addNotification } = useNotifications()

  const isGlobal = form.watch('isGlobal')

  const onSubmit = async (data: FormValues) => {
    const submitResponse = await apiClient.post('/announcements', {
      announcement: data.message.trim(),
      userIds: data.isGlobal ? [] : data.selectedUserIds,
      isGlobal: data.isGlobal,
    })

    if (submitResponse.ok) {
      form.reset()
      addNotification({
        message: 'Announcement sent successfully',
        type: 'success',
      })
    } else {
      addNotification({
        message: 'Error sending Announcement',
        type: 'error',
      })
    }
  }

  return (
    <Card className="space-y-4 w-full p-5 bg-background-secondary">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Message Field */}
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-sm font-medium text-gray-300 mb-2 uppercase tracking-wide">
                  Message
                </FormLabel>
                <FormControl>
                  <textarea
                    {...field}
                    placeholder="Type your message here..."
                    className="w-full border border-gray-300 rounded-md p-2 bg-gray-900"
                    rows={4}
                  />
                </FormControl>
                <FormErrorDisplay
                  className="mt-2"
                  errors={form.formState.errors}
                  fields={{ message: 'Message' }}
                />
              </FormItem>
            )}
          />

          {/* Global Checkbox */}
          <FormField
            control={form.control}
            name="isGlobal"
            render={({ field }) => (
              <FormItem>
                <FormControl className="flex items-center gap-3">
                  <Input
                    type="checkbox"
                    {...field}
                    value={String(field.value)}
                    checked={field.value}
                    className="h-4 w-4 border-gray-300 rounded"
                  />
                  <span className="text-white">Global (Send to all users)</span>
                </FormControl>
              </FormItem>
            )}
          />

          {/* Select Users */}
          {!isGlobal && (
            <FormField
              control={form.control}
              name="selectedUserIds"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <SelectUsersComponent
                      classNameTrigger="text-white bg-gray-900"
                      className="text-white"
                      onChange={(selected) =>
                        field.onChange(selected.map((u) => u.id))
                      }
                      selectedUserIds={field.value || []}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}

          {/* Submit Button */}
          <DpButton
            type="submit"
            size="large"
            className="w-full"
            variant="accent"
            disabled={!form.formState.isValid}
          >
            Send Announcement
          </DpButton>
        </form>
      </Form>
    </Card>
  )
}

export { CreateAnnouncement }
